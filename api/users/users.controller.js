const Joi = require("joi");
const DbController = require("../utils/DbController");
const shortid = require("shortid");

class userController {
  async getUsers(req, res, next) {
    try {
      const contacts = await DbController.listContacts();
      return res.json(contacts);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async getUsersById(req, res, next) {
    try {
      const contact = await DbController.getContactById(req.params.contactId);
      if (!contact) {
        throw new Error("Not Found");
      }
      return res.json(contact);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async createUsers(req, res, next) {
    try {
      const newUser = { id: shortid.generate(), ...req.body };
      await DbController.addContact(newUser);
      return res.status(201).send(newUser);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  }

  async updateUser(req, res, next) {
    try {
      const updatedContact = await DbController.updateContact(
        req.params.contactId,
        req.body
      );
      if (!updatedContact) {
        throw new Error("Not Found");
      }
      return res.status(200).json(updatedContact);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async removeUser(req, res, next) {
    try {
      const removedContact = await DbController.removeContact(
        req.params.contactId
      );
      if (!removedContact) {
        throw new Error("Not Found");
      }
      return res.status(200).json({ message: "contact deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }

  async validateCreateUser(req, res, next) {
    try {
      const createUserRules = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.number().required(),
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
        phone: Joi.number(),
      });

      const result = await Joi.validate(req.body, updateUserRules);

      next();
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  }
}

module.exports = new userController();
