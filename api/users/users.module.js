const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  subscription: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String, default: "" },
});

contactSchema.statics.findContactByIdAndUpdate = findContactByIdAndUpdate;

async function findContactByIdAndUpdate(contactId, updatedParams) {
  return this.findByIdAndUpdate(
    contactId,
    {
      $set: updatedParams,
    },
    { new: true }
  );
}

const contactModel = mongoose.model("Contact", contactSchema);

module.exports = contactModel;
