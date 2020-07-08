const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, "../db/contacts.json");

class DbController {
  async listContacts() {
    const data = await fsPromises.readFile(contactsPath, "utf-8");
    const parsedData = JSON.parse(data);
    return parsedData;
  }

  async getContactById(contactId) {
    const contactsList = await this.listContacts();
    const targetContact = contactsList.find(
      (contact) => contact.id === contactId
    );
    return targetContact;
  }

  async addContact(newUser) {
    const data = await this.listContacts();
    await fsPromises.writeFile(
      contactsPath,
      JSON.stringify([...data, newUser])
    );
  }

  async updateContact(id, updatedFields) {
    const contactsList = await this.listContacts();

    const targetContactIdx = contactsList.findIndex(
      (contact) => contact.id === id
    );

    if (targetContactIdx === -1) {
      return null;
    }

    const updatedContact = {
      ...contactsList[targetContactIdx],
      ...updatedFields,
    };

    contactsList[targetContactIdx] = updatedContact;

    await fsPromises.writeFile(contactsPath, JSON.stringify(contactsList));

    return updatedContact;
  }

  async removeContact(contactId) {
    const contactsList = await this.listContacts();

    const listWithOutDeletedContact = contactsList.filter(
      (user) => user.id !== contactId
    );

    if (contactsList.length === listWithOutDeletedContact.length) {
      return false;
    }
    await fsPromises.writeFile(
      contactsPath,
      JSON.stringify(listWithOutDeletedContact)
    );
    return true;
  }
}

module.exports = new DbController();
