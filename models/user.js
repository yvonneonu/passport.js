const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId;
    },
  },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, unique: true },
  displayName: { type: String },
  thumbnail: { type: String },
});

// UserSchema.index({ username: 1 }, { unique: true });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.googleId) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw err;
  }
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
