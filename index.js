const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

var corsOptions = {
  origin: [
    "https://localhost:3001",
    "https://mahakali-ui-nuk9.vercel.app",
    "http://144.24.111.231:3001",
    "http://144.24.111.231:3001",
    "https://mahakalisarees.com",
    "https://www.mahakalisarees.com",
  ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/images", express.static("images"));

require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/product.routes")(app);
require("./app/routes/utils.routes")(app);
require("./app/routes/cart.routes")(app);
require("./app/routes/order.routes")(app);
require("./app/routes/category.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
