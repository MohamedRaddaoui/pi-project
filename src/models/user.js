const mongo = require("mongoose");
const Schema = mongo.Schema;

const User = new Schema(
  {
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    role: {
      type: String,
      enum: ["User", "Admin", "Manager", "Developer"],
      required: true,
    },
    createdAt: Date,
  },
  { timestamps: true }
);

module.exports = mongo.model("User", User);
