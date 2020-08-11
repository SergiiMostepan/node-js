const Joi = require("joi");
const {
  Types: { ObjectId },
} = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const multer = require("multer");
const path = require("path");
const { promises: fsPromises } = require("fs");
const imagemin = require("imagemin");
const imageminJpegtran = require("imagemin-jpegtran");
const imageminPngquant = require("imagemin-pngquant");
const Avatar = require("avatar-builder");
const { nanoid } = require("nanoid");
const sgMail = require("@sendgrid/mail");
const Mailgen = require("mailgen");
const userModel = require("./users.module");
require("dotenv").config();

class userController {
  constructor() {
    this._costfactor = 4;
  }

  get registrateUser() {
    return this._registrateUser.bind(this);
  }

  get getUser() {
    return this._getUser.bind(this);
  }

  get sendEmail() {
    return this._sendEmail.bind(this);
  }

  async _getUser(req, res, next) {
    try {
      const user = req.user;
      return res.json({
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      });
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async _registrateUser(req, res, next) {
    try {
      const avatar = await Avatar.catBuilder(128);
      const buff = await avatar.create();
      const fileName = Date.now() + ".png";
      const fileLink = `public/images/${fileName}`;
      await fsPromises.writeFile(fileLink, buff);

      const { email, password, subscription, token } = req.body;

      const existingUser = await userModel.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).send("Email in use");
      }

      const passwordHash = await bcrypt.hash(password, this._costfactor);
      const verifyToken = nanoid();
      const options = {
        verifyToken,
        email,
      };
      await this.sendEmail(options);
      const newUser = await userModel.create({
        email,
        password: passwordHash,
        avatarURL: `public/images/${fileName}`,
        subscription,
        verifyToken,
      });

      return res.status(201).send({
        email: newUser.email,
        avatarURL: newUser.avatarURL,
        subscription: newUser.subscription,
      });
    } catch (err) {
      next(err);
    }
  }

  async signIn(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findUserByEmail(email);

      if (!user) {
        return res.status(401).send("Email or password is wrong");
      }

      const isPasswordWalid = await bcrypt.compare(password, user.password);
      if (!isPasswordWalid) {
        return res.status(401).send("Email or password is wrong");
      }

      const token = await jwt.sign({ id: user._id }, process.env.SECRETKEY);
      await userModel.updateToken(user._id, token);
      return res.status(200).json({ token });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const user = req.user;
      await userModel.updateToken(user._id, null);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = req.user;

      const updatedUser = await userModel.findUserByIdAndUpdate(user._id, {
        subscription: req.body.subscription,
      });

      if (!updatedUser) {
        return res.status(404).json("Not Found contact");
      }

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async updateUserAvatar(req, res, next) {
    try {
      const user = req.user;

      const oldAvatar = await userModel.findById(user._id);
      await fsPromises.unlink(oldAvatar.avatarURL);

      const updatedUser = await userModel.findUserByIdAndUpdate(user._id, {
        avatarURL: req.file.path,
      });

      if (!updatedUser) {
        return res.status(404).json("Not Found contact");
      }

      return res.status(200).json({ avatarURL: updatedUser.avatarURL });
    } catch (err) {
      next(err);
    }
  }

  async authorize(req, res, next) {
    try {
      // 1. витягнути токен користувача з заголовка Authorization
      const authorizationHeader = req.get("Authorization");
      const token = authorizationHeader.replace("Bearer ", "");

      // 2. витягнути id користувача з пейлоада або вернути користувачу
      // помилку зі статус кодом 401
      let userId;
      try {
        userId = await jwt.verify(token, process.env.SECRETKEY).id;
        console.log("UserId", userId);
      } catch (err) {
        res.status(401).send("Not authorized");
      }

      // 3. витягнути відповідного користувача. Якщо такого немає - викинути
      // помилку зі статус кодом 401
      // userModel - модель користувача в нашій системі
      const user = await userModel.findById(userId);
      if (!user || user.token !== token) {
        res.status(401).send("Not authorized");
      }

      // 4. Якщо все пройшло успішно - передати запис користувача і токен в req
      // і передати обробку запиту на наступний middleware
      req.user = user;
      req.token = token;
      next();
    } catch (err) {
      next(err);
    }
  }

  async validateRegistrateUser(req, res, next) {
    try {
      const createUserRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      const result = await Joi.validate(req.body, createUserRules);

      next();
    } catch (e) {
      res.status(400).json({ message: "missing required field" });
    }
  }

  async validateSignIn(req, res, next) {
    try {
      const signInRules = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      });

      const result = await Joi.validate(req.body, signInRules);

      next();
    } catch (e) {
      res.status(400).json({ message: "missing required field" });
    }
  }

  async validateUpdateUser(req, res, next) {
    try {
      const updateUserRules = Joi.object({
        subscription: Joi.string().only("free", "pro", "premium").required(),
      });

      const result = await Joi.validate(req.body, updateUserRules);

      next();
    } catch (e) {
      res.status(400).json({ message: "Value must be on of free/pro/premium" });
    }
  }

  // async avatarUpploadMidlvare(req, res, next) {
  //   const upload = multer({ dest: "tmp" });
  //   await upload.single("file_example");
  //   next();
  // }
  async minifyImage(req, res, next) {
    try {
      await imagemin([req.file.path], {
        destination: "public/images",
        plugins: [
          imageminJpegtran(),
          imageminPngquant({
            quality: [0.6, 0.8],
          }),
        ],
      });

      await fsPromises.unlink(req.file.path);

      req.file.path = path.join("public/images", req.file.filename);
      req.file.destination = "public/images";
      next();
    } catch (err) {
      res
        .status(400)
        .json({ message: "Value must be file_example with added photo" });
    }
  }
  async _sendEmail({ verifyToken, email }) {
    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "GOiT",
        link: "http://localhost:3000/",
      },
    });
    const template = {
      body: {
        intro: "Welcome to my HW! We're very excited to have you on board.",
        action: {
          instructions: "To get started with uss, please click here:",
          button: {
            color: "#22BC66", // Optional action button color
            text: "Verify your account",
            link: `http://localhost:3000/verify/${verifyToken}`,
          },
        },
      },
    };
    const emailBody = mailGenerator.generate(template);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: email,
      from: "sergiimostepan@gmail.com", // Use the email address or domain you verified above
      subject: "Sending with Twilio SendGrid is Fun",
      text: "verify account",
      html: emailBody,
      // html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };
    //ES6

    await sgMail.send(msg).then(
      () => {},
      (error) => {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    );
  }

  async verifyToken(req, res, next) {
    const { token } = req.params;
    const user = await userModel.findOne({ verifyToken: token });
    if (!user) {
      return res.status(404).json({
        message:
          "Your verification token is not valid. Contact with administration",
      });
    }
    await user.updateOne({ verify: true, verifyToken: null });
    res.status(200).json({ message: "verification successful" });
  }
}

module.exports = new userController();
