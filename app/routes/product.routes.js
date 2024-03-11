const authJwt = require("../middleware/authJwt");
const productController = require("../controllers/product.controller");
const multer = require("multer");
const path = require("path");
const { request } = require("http");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let path = "./images";
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

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
    // [authJwt.verifyToken],
    productController.updateProduct
  );

  app.delete(
    "/api/products/:id",
    // [authJwt.verifyToken],
    productController.deleteProduct
  );

  app.get(
    "/api/products/:id",
    // [authJwt.verifyToken],
    productController.getProductById
  );

  app.post(
    "/api/products/image",
    upload.array("productImages", 10),
    productController.imageUpload
  );

  app.delete("/api/products/image/:imageName", productController.deleteImage);
};
