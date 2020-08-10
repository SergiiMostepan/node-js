const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const userController = require("./users.controller");

const storage = multer.diskStorage({
  destination: "tmp",
  filename: function (req, file, cb) {
    const ext = path.parse(file.originalname).ext;
    cb(null, Date.now() + ext);
  },
});

const upload = multer({ storage });

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

userRouter.patch(
  "/users/avatars",
  userController.authorize,
  upload.single("file_example"), // работает только когда пишу тут. Вынести в контроллеры не выходит
  // userController.avatarUpploadMidlvare, не работает(((
  userController.minifyImage,
  userController.updateUserAvatar
);

module.exports = userRouter;
