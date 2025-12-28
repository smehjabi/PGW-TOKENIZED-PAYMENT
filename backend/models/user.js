const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    avatar: { 
      type: String, 
      default: "https://cdn-icons-png.flaticon.com/128/16683/16683419.png" 
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
