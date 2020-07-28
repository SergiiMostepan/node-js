const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
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
contactSchema.plugin(mongoosePaginate);

const contactModel = mongoose.model("Contact", contactSchema);

module.exports = contactModel;
