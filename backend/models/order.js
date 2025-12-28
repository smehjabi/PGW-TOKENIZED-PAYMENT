const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    item: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Item", 
      required: true 
    },
    status: { 
      type: String, 
      default: "Order Placed", 
      enum: ["Order Placed", "Out for Delivery", "Delivered", "Canceled"] 
    },
    paymentMethod: { 
      type: String, 
      required: true 
    },
    customerDetails: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
