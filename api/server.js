const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const usersRouter = require("./users/users.router");
require("dotenv").config();

const MONGODB_URL =
  "mongodb+srv://sergii:1005012bk@cluster0.clbfk.mongodb.net/db-contacts?retryWrites=true&w=majority";

module.exports = class UsersServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
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
    this.server.use("/api/contacts", usersRouter);
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
    this.server.listen(process.env.PORT, () => {
      console.log("Server started listening on port", process.env.PORT);
    });
  }
};
