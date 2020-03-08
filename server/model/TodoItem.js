const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
  name: {
    type: String,
    default: "unname task"
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  }
});

todoSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Todo", todoSchema);
