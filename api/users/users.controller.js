const Joi = require("joi");
// const DbController = require("../utils/DbController");
const shortid = require("shortid");
const {
  Types: { ObjectId },
} = require("mongoose");
const contactModel = require("./users.module");

class userController {
  async getUsers(req, res, next) {
    try {
      const contacts = await contactModel.find();
      return res.json(contacts);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async getUsersById(req, res, next) {
    try {
      const contactId = req.params.contactId;

      const contact = await contactModel.findById(contactId);
      if (!contact) {
        return res.status(404).json("Not Found contact with such id");
      }

      return res.json(contact);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async createUsers(req, res, next) {
    try {
      const newContact = await contactModel.create(req.body);
      return res.status(201).send(newContact);
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      const contactId = req.params.contactId;
      const updatedContact = await contactModel.findContactByIdAndUpdate(
        contactId,
        req.body
      );
      console.log(updatedContact);
      if (!updatedContact) {
        return res.status(404).json("Not Found contact with such id");
      }
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async removeUser(req, res, next) {
    try {
      const contactId = req.params.contactId;
      const deletedContact = await contactModel.findByIdAndDelete(contactId);
      if (!deletedContact) {
        return res.status(404).json("Not Found contact with such id");
      }
      return res.status(204).json({ message: "contact deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
  validateContactId(req, res, next) {
    const contactId = req.params.contactId;
    if (!ObjectId.isValid(contactId)) {
      return res.status(400).json("Invalid Id");
    }
    next();
  }

  async validateCreateUser(req, res, next) {
    try {
      const createUserRules = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        subscription: Joi.string().required(),
        password: Joi.string().required(),
        token: Joi.string(),
      });

      const result = await Joi.validate(req.body, createUserRules);

      next();
    } catch (e) {
      res.status(400).json({ message: "missing required name field" });
    }
  }

  async validateUpdateUser(req, res, next) {
    try {
      if (!Object.keys(req.body).length) {
        throw new Error("missing fields");
      }

      const updateUserRules = Joi.object({
        name: Joi.string(),
        email: Joi.string(),
        phone: Joi.string(),
        subscription: Joi.string(),
        password: Joi.string(),
        token: Joi.string(),
      });

      const result = await Joi.validate(req.body, updateUserRules);

      next();
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

module.exports = new userController();
