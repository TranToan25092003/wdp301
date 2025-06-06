// contact.model.js
const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    facebook: {
      type: String,
      default: "",
    },
    zalo: {
      type: String,
      default: "",
    },
    iframe: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true, // Thêm createdAt và updatedAt
  }
);

const Contact = mongoose.model("Contact", ContactSchema);

module.exports = Contact;
