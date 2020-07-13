const { Router } = require("express");
const UserController = require("./users.controller");

const userRouter = Router();

userRouter.get("/", UserController.getUsers);
userRouter.get(
  "/:contactId",
  UserController.validateContactId,
  UserController.getUsersById
);
userRouter.post(
  "/",
  UserController.validateCreateUser,
  UserController.createUsers
);
userRouter.patch(
  "/:contactId",
  UserController.validateContactId,
  UserController.validateUpdateUser,
  UserController.updateUser
);
userRouter.delete(
  "/:contactId",
  UserController.validateContactId,
  UserController.removeUser
);

module.exports = userRouter;
