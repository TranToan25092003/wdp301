const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  session_id: { type: String, required: true, unique: true },
  status: { type: String, default: "completed" },
});
const Session = mongoose.model("session", SessionSchema);

module.exports = Session;
