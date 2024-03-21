const controller = require("../controllers/auth.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
    next();
  });

  app.post("/api/auth/signup", controller.signup);

  app.post("/api/auth/signin", controller.signin);
  app.post("/api/auth/verifyOtp", controller.verifyOtp);
  app.get("/api/auth/verifyUser/:id", controller.verifyUser);
};
