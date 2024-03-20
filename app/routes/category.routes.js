const categories = require("../controllers/category.controller.js");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/categories", categories.createCategory);
  app.get("/api/categories", categories.getCategories);
  app.delete("/api/categories/:id", categories.deleteCategory);
  app.put("/api/categories/:id", categories.updateCategory);
  app.get("/api/categories/:id", categories.getCategory);
};
