const mongoose = require("mongoose");
const Article = require("../model/Article");
mongoose
  .connect("mongodb://192.168.43.44:27017/blogdb", {
    user: "ninja",
    pass: "root1234",
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then((a, b) => {
    console.log("successfull");
  })
  .catch(err => {
    console.error(err);
  });

// db.on("error", err => {
//   console.error(err);
// });

// db.once("open", () => {
//   console.log("successfull");
// });

// module.exports = db;
