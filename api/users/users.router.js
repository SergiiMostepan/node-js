const { Router } = require("express");
const userController = require("./users.controller");

const userRouter = Router();

userRouter.post(
  "/auth/register",
  userController.validateRegistrateUser,
  userController.registrateUser
);

userRouter.post(
  "/auth/login",
  userController.validateSignIn,
  userController.signIn
);

userRouter.patch(
  "/auth/logout",
  userController.authorize,
  userController.logout
);

userRouter.get(
  "/users/current",
  userController.authorize,
  userController.getUser
);

userRouter.patch(
  "/users",
  userController.authorize,
  userController.validateUpdateUser,
  userController.updateUser
);

module.exports = userRouter;
