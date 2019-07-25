const router = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const WooCommerceAPI = require("woocommerce-api");

// Get the Single Purchase / Subscription price for a given number of nights / people
router.get("/price", cors(), async (req, response) => {
	const singleId = 10403; // ID of single purchase DINNERin product on https://dinnerin.co.nz/
	const subId = 10402; // ID of subscription DINNERin product on https://dinnerin.co.nz/

	// Configure the environment variables
	dotenv.config();

	// Extract the nights and people from query
	const { nights, people } = req.query;

	// The sku to be searched for in the product variations
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
		const subVariations = await instance.get(`https://dinnerin.co.nz/wp-json/wc/v2/products/${subId}/variations`);
		const singleVariations = await instance.get(
			`https://dinnerin.co.nz/wp-json/wc/v2/products/${singleId}/variations`
		);

		// Find the subscription price of the matching sku
		const subPrice = subVariations.data.filter(item => {
			return item.sku === sku + "_SUB";
		})[0].price;

		// Find the single purchase price of the matching sku
		const singlePrice = singleVariations.data.filter(item => {
			return item.sku === sku + "_SINGLE";
		})[0].price;

		response.send({
			subscription: {
				perWeek: subPrice,
				perMeal: subPrice / (nights * people)
			},
			singlePurchase: {
				perWeek: singlePrice,
				perMeal: singlePrice / (nights * people)
			}
		});
	} catch (err) {
		// Cookie could not be found in the database
		response.status(404).send();
	}

	// Get the meals and people from the query parameters
	// response.send(result.data);
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
		const result = await instance.get(
			`https://dinnerin.alphabean.co.nz/wp-json/dinnerinquasicart/v2/quasicart/dump/notloggedin/${cookie}`
		);
		response.send({ nights: result.data.num_nights, people: result.data.num_people });
	} catch (err) {
		// Cookie could not be found in the database
		response.status(404).send();
	}
});

//router.post('/login')

module.exports = router;
