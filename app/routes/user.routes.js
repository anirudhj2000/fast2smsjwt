const authJwt = require("../middleware/authJwt");
const userController = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/users", userController.createUser);

  // Get All Users
  app.get("/api/users", userController.getAllUsers);

  // Get a User by ID
  app.get("/api/users/:id", userController.getUserById);

  // Update a User
  app.put("/api/users/:id", userController.updateUser);

  // Delete a User
  app.delete("/api/users/:id", userController.deleteUser);

  app.get("/api/users/search/:id", userController.searchUsers);
};
