const authJwt = require("../middleware/authJwt");
const utilsController = require("../controllers/utils.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/contactUs", utilsController.createContact);
};
