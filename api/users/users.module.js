const mongoose = require("mongoose");
const { token } = require("morgan");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatarURL: { type: String },
  verify: {
    type: Boolean,
    default: false,
  },
  verifyToken: {
    type: String,
    required: [true, "Verify token required"],
  },
  subscription: {
    type: String,
    enum: ["free", "pro", "premium"],
    default: "free",
  },
  token: String,
});

userSchema.statics.findUserByEmail = findUserByEmail;
userSchema.statics.updateToken = updateToken;
userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;

async function findUserByEmail(email) {
  return this.findOne({ email });
}

async function updateToken(id, newToken) {
  return this.findByIdAndUpdate(id, { token: newToken });
}

async function findUserByIdAndUpdate(userId, updatedParams) {
  return this.findByIdAndUpdate(
    userId,
    {
      $set: updatedParams,
    },
    { new: true }
  );
}

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
