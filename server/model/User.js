const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  username: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /\w{4,16}/.test(v);
      },
      message: "必须包含数字英特殊字符中的两种组成的4～16位用户名"
    }
  },
  age: Number,
  password: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /[\w\s_-`]{8,16}/.test(v);
      }
    }
  },
  email: {
    type: String,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
          v
        );
      }
    }
  },
  mobile: {
    type: String,
    validate: {
      validator: function(v) {
        return /\d{11}/.test(v);
      },
      message: "手机号只能是11位数字"
    }
  },
  role: {
    type: Number,
    default: 0
  },
  createTime: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
