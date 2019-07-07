const express = require("express");
const app = express();
const dotenv = require("dotenv");

//Import middleware
const authRoute = require("./routes/auth");

//Route middleware
//app.use("/api/wc/", authRoute);

app.get("/", (req, res) => res.send("Hello World!"));

app.get("/api/wc/products", (req, res) => {
	dotenv.config();
	try {
		const instance = axios.create({
			auth: {
				username: process.env.WOO_CK,
				password: process.env.WOO_CS
			}
		});
		// const result = await instance.get(`https://react.alphabean.co.nz/wp-json/wc/v2/products/6271/variations`);

		instance.get(`https://react.alphabean.co.nz/wp-json/wc/v2/products/6271/variations`).then(res => {
			res.send(res.data);
		});
		// response.send(result.data[0].price);
	} catch (err) {
		res.send("Error: " + err);
	}
});

app.listen(8081, () => console.log("Server up and running on port 8081"));
