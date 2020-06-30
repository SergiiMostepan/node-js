const fs = require("fs");
const path = require("path");
const { promises: fsPromises } = fs;
const shortid = require("shortid");

const contactsPath = path.join(__dirname, "./db/contacts.json");

function listContacts() {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    if (err) throw err;
    console.log(data);
  });
}
// listContacts();

function getContactById(contactId) {
  fs.readFile(contactsPath, "utf-8", (err, data) => {
    if (err) throw err;
    const users = JSON.parse(data);
    const finedUser = users.filter((user) => user.id === contactId);
    console.log(finedUser);
  });
}
// getContactById(finedUser);

function removeContact(contactId) {
  fsPromises
    .readFile(contactsPath, "utf-8")
    .then((data) => JSON.parse(data))
    .then((users) => users.filter((user) => user.id !== contactId))
    .then((data) => fsPromises.writeFile(contactsPath, JSON.stringify(data)))
    .catch((err) => console.log(err));
}
// removeContact(contactId);

async function addContact(name, email, phone) {
  const data = await fsPromises.readFile(contactsPath, "utf-8");
  const parsedData = JSON.parse(data);
  const newRecord = {
    id: shortid.generate(),
    name: name,
    email: email,
    phone: phone,
  };
  await fsPromises.writeFile(
    contactsPath,
    JSON.stringify([...parsedData, newRecord])
  );
}
// addContact(name, email, phone);

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
