const { Router } = require("express");

const contactController = require("./contacts.controller");

const contactRouter = Router();

contactRouter.get("/", contactController.getContacts);
contactRouter.get(
  "/:contactId",
  contactController.validateContactId,
  contactController.getContactById
);
contactRouter.post(
  "/",
  contactController.validateCreateContact,
  contactController.createContact
);
contactRouter.patch(
  "/:contactId",
  contactController.validateContactId,
  contactController.validateUpdateContact,
  contactController.updateContact
);
contactRouter.delete(
  "/:contactId",
  contactController.validateContactId,
  contactController.removeContact
);

module.exports = contactRouter;
