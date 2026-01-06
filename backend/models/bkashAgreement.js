const mongoose = require("mongoose");

const bkashAgreementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    walletNumber: {
      type: String,
      required: true,
      unique: true, // 🔒 One wallet = one agreement
    },

    agreementId: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BkashAgreement", bkashAgreementSchema);
