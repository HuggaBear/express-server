const router = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");

router.get("/products", cors(), async (req, response) => {
	dotenv.config();
	try {
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK,
				password: process.env.WOO_CS
			}
		});
		const result = await instance.get(`https://react.alphabean.co.nz/wp-json/wc/v2/products?per_page=100`);
		response.send(result.data);
	} catch (err) {
		response.send("Error: " + err);
	}
});

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
