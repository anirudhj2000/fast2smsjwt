const authJwt = require("../middleware/authJwt");
const cartController = require("../controllers/cart.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/carts", cartController.getCarts);

  // Create a New Cart
  app.post("/api/carts", cartController.createCart);

  // Update an Existing Cart
  app.put("/api/carts/:id", cartController.updateCart);

  // Delete a Cart
  app.delete("/api/carts/:id", cartController.deleteCart);
};
