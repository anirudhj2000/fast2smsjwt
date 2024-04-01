const authJwt = require("../middleware/authJwt");
const orderController = require("../controllers/order.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/orders", orderController.createOrder);
  app.get("/api/orders", orderController.getOrders);

  app.delete("/api/orders/:id", orderController.deleteOrder);
};
