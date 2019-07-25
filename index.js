const express = require("express");
const app = express();
//Import middleware
const authRoute = require("./routes/routes");

//Route middleware
app.use("/api/dinnerin/", authRoute);

app.get("/", (req, res) => res.send("No available route"));

app.listen(8081, () => console.log("Server up and running on port 8081"));
