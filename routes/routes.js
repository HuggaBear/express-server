const router = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const DESSERTS_CATEGORY_ID = 99;
const BASE_URL = "https://dinnerin.co.nz"; // Change this to https://dinnerin.co.nz/ for prod
const SINGLE_ID = 10403; // ID of single purchase DINNERin product on https://dinnerin.co.nz/
const SUB_ID = 10402; // ID of subscription DINNERin product on https://dinnerin.co.nz/
// Get the Single Purchase / Subscription price for a given number of nights / people
router.get("/price", cors(), async (req, response) => {
	// Configure the environment variables
	dotenv.config();

	// Extract the nights and people from query
	const { nights, people } = req.query;
	if (!nights) {
		response.send("No nights value given");
	}
	if (!people) {
		response.send("No people value given");
	}
	// The sku to be searched for in the product variations
	// e.g 3 Meals 6 People would be 3M6P_SINGLE or 3M_6P_SUB
	const sku = `${nights}M${people}P`;

	try {
		// Authorise access to WC API
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK,
				password: process.env.WOO_CS
			}
		});

		// Get all the subscription and single purchase product variations
		const subVariations = await instance.get(
			`https://dinnerin.co.nz/wp-json/wc/v2/products/${SUB_ID}/variations?per_page=100`
		);
		const singleVariations = await instance.get(
			`https://dinnerin.co.nz/wp-json/wc/v2/products/${SINGLE_ID}/variations?per_page=100`
		);
		// Find the subscription variation
		const subVariation = subVariations.data.filter(item => {
			return item.sku === sku + "_SUB";
		})[0];
		// Find the single purchase variation
		const singleVariation = singleVariations.data.filter(item => {
			return item.sku === sku + "_SINGLE";
		})[0];

		if (!subVariation || !singleVariation) {
			response.send("Invalid nights or people value");
		} else {
			response.send({
				subscription: {
					perWeek: parseFloat(subVariation.price).toFixed(2),
					perMeal: (subVariation.price / (nights * people)).toFixed(2)
				},
				singlePurchase: {
					perWeek: parseFloat(singleVariation.price).toFixed(2),
					perMeal: (singleVariation.price / (nights * people)).toFixed(2)
				}
			});
		}
		// Send back the subscription / single price
	} catch (err) {
		// Invalid nights / people values
		response.send(err);
	}

	// Get the meals and people from the query parameters
	// response.send(result.data);
});

router.get("/meals", cors(), async (req, response) => {
	dotenv.config();

	// Extract the cookie value
	const cookie = req.query.cookieid;
	try {
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK,
				password: process.env.WOO_CS
			}
		});

		// Dump request to get all info about the user
		const result = await instance.get(
			`${BASE_URL}/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
		);
		// Send the main_meal_selections in a nice array format
		const mealsArray = Object.keys(result.data.main_meal_selections).map(
			key => result.data.main_meal_selections[key]
		);
		response.send({ meals: mealsArray });
	} catch (err) {
		// Unable to reach server
		response.status(404).send();
	}
});

// Send all the available desserts on the DINNERin website
router.get("/desserts", cors(), async (req, response) => {
	dotenv.config();
	console.log("desserts hit");

	try {
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK_TEST,
				password: process.env.WOO_CS_TEST
			}
		});

		const result = await instance.get(`${BASE_URL}/wp-json/wc/v2/products?category=${DESSERTS_CATEGORY_ID}`);
		console.log(result.data);

		response.send(result.data);
	} catch (err) {
		console.log(err.message);
		// Unable to reach server
		response.status(404).send();
	}
});

// Check the database for the cookie value to see if the user has been to the website in the past 28 days.
// If they have, they will have their previously selected nights and people options stored in the database.
// We will return their previously selected nights and people.
router.get("/nightsandpeople", cors(), async (req, response) => {
	dotenv.config();

	// Extract the cookie value
	const cookie = req.query.cookieid;
	try {
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK,
				password: process.env.WOO_CS
			}
		});
		// Dump request to get all info about the user
		const result = await instance.get(
			`${BASE_URL}/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
		);
		response.send({ nights: result.data.num_nights, people: result.data.num_people });
	} catch (err) {
		// Cookie could not be found in the database
		response.status(404).send();
	}
});

module.exports = router;
