const express = require("express");
const app = express();

//Import middleware
const authRoute = require("./routes/auth");

//Route middleware
app.use("/api/wc/", authRoute);

app.listen(8080, () => console.log("Server up and running"));
