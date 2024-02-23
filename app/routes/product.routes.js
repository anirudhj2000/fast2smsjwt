const authJwt = require("../middleware/authJwt");
const productController = require("../controllers/product.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/products/search",
    // [authJwt.verifyToken],
    productController.searchProducts
  );

  app.post(
    "/api/products",
    // [authJwt.verifyToken],
    productController.createProduct
  );

  app.put(
    "/api/products/:id",
    [authJwt.verifyToken],
    productController.updateProduct
  );

  app.delete(
    "/api/products/:id",
    [authJwt.verifyToken],
    productController.deleteProduct
  );

  app.get(
    "/api/products",
    // [authJwt.verifyToken],
    productController.getProductById
  );
};
