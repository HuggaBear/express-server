const router = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

// Get the Single Purchase / Subscription price for a given number of nights / people
router.get("/price", cors(), async (req, response) => {
	const singleId = 10403; // ID of single purchase DINNERin product on https://dinnerin.co.nz/
	const subId = 10402; // ID of subscription DINNERin product on https://dinnerin.co.nz/

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
			`https://dinnerin.co.nz/wp-json/wc/v2/products/${subId}/variations?per_page=100`
		);
		const singleVariations = await instance.get(
			`https://dinnerin.co.nz/wp-json/wc/v2/products/${singleId}/variations?per_page=100`
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
			`https://dinnerin.alphabean.co.nz/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
		);
		response.send({ meals: result.data.main_meal_selections });
	} catch (err) {
		// Cookie could not be found in the database
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
			`https://dinnerin.alphabean.co.nz/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
		);
		response.send({ nights: result.data.num_nights, people: result.data.num_people });
	} catch (err) {
		// Cookie could not be found in the database
		response.status(404).send();
	}
});

// router.post("/nightsandpeople", cors(), async (req, response) => {
// 	dotenv.config();

// 	// Extract the cookie value
// 	const cookie = req.query.cookieid;
// 	try {
// 		const instance = axios.create({
// 			auth: {
// 				username: process.env.WOO_CK,
// 				password: process.env.WOO_CS
// 			}
// 		});
// 		const result = await instance.get(
// 			`https://dinnerin.alphabean.co.nz/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
// 		);
// 		response.send({ nights: result.data.num_nights, people: result.data.num_people });
// 	} catch (err) {
// 		// Cookie could not be found in the database
// 		response.status(404).send();
// 	}
// });
//router.post('/login')

module.exports = router;
