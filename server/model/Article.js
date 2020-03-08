const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  name: {
    type: String
  },
  content: {
    type: String
  },
  author: {
    type: String
  }
});

articleSchema.virtual("id").get(function() {
  return this._id;
});

module.exports = mongoose.model("Article", articleSchema);
