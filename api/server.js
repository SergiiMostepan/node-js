const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRouter = require("./users/users.router");
const contactRouter = require("./contacts/contacts.router");
require("dotenv").config();

// PORT = process.env.PORT || 80;
PORT = 80;

module.exports = class UsersServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.initStatic();
    await this.initDatabase();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }

  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: "http://localhost:3000" }));
  }

  initRoutes() {
    this.server.use("/api/contacts", contactRouter);
    this.server.use("/", userRouter);
  }

  initStatic() {
    this.server.use(express.static("public"));
  }

  async initDatabase() {
    try {
      const client = await mongoose.connect(process.env.MONGODB_URL);
      console.log("Database connection successful");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
  }

  startListening() {
    this.server.listen(PORT, () => {
      console.log("Server started listening on port", process.env.PORT);
    });
  }
};
