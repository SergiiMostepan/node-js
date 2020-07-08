const express = require("express");
const UserController = require("./users.controller");

const userRouter = express.Router();

userRouter.get("/api/contacts", UserController.getUsers);
userRouter.get("/api/contacts/:contactId", UserController.getUsersById);
userRouter.post(
  "/api/contacts",
  UserController.validateCreateUser,
  UserController.createUsers
);
userRouter.patch(
  "/api/contacts/:contactId",
  UserController.validateUpdateUser,
  UserController.updateUser
);
userRouter.delete("/api/contacts/:contactId", UserController.removeUser);

module.exports = userRouter;
