const router = require("express").Router();
const axios = require("axios");
const dotenv = require("dotenv");

router.get("/products", function(req, response) {
	dotenv.config();
	// try {
	// 	const instance = axios.create({
	// 		auth: {
	// 			username: process.env.WOO_CK,
	// 			password: process.env.WOO_CS
	// 		}
	// 	});
	// 	const result = await instance.get(`https://react.alphabean.co.nz/wp-json/wc/v2/products/6271/variations`);

	// response.send(result.data[0].price);
	response.send("50");
	// } catch (err) {
	// 	response.send("Error: " + err);
	// }
});

module.exports = router;
