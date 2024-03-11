const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

var corsOptions = {
  origin: [
    "https://localhost:3001",
    "https://mahakali-ui-nuk9.vercel.app",
    "http://144.24.111.231:3000",
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple route
// app.get("/", (req, res) => {
//   res.status(200).send({ message: "here here" });
// });

app.use("/images", express.static("images"));

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/utils.routes")(app);
require("./app/routes/cart.routes")(app);
require("./app/routes/order.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
