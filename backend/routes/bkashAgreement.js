const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ensureValidToken } = require("../helpers/bkashAgreement");
const BkashAgreement = require("../models/BkashAgreement");

// ===========================
// 1️⃣ Create Agreement
// ===========================
router.post("/create", async (req, res) => {
  try {
    // 🔍 STEP 1: Check if agreement already exists (wallet-based)
    const existingAgreement = await BkashAgreement.findOne({
      walletNumber: req.body.phone,
      status: "ACTIVE",
    });

    if (existingAgreement) {
      return res.json({
        message: "Agreement already exists",
        agreementId: existingAgreement.agreementId,
      });
    }

    // 🔐 STEP 2: Get valid bKash token
    const token = await ensureValidToken();

    // 🔗 STEP 3: Create new agreement (OTP will be sent)
    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}agreement/create`,
      {
        mode: "0000",
        payerReference: req.body.phone, // wallet number
        callbackURL: `${process.env.SERVER_URL}/api/bkash-agreement/execute`,
      },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ===========================
// 2️⃣ Execute Agreement
// Called by bKash after OTP
// ===========================
router.post("/execute", async (req, res) => {
  try {
    const token = await ensureValidToken();
    const { agreementId } = req.body;

    if (!agreementId) {
      return res.status(400).json({ error: "agreementID is required" });
    }

    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}agreement/execute`,
      { agreementId },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 💾 STEP 3: Save agreement in DB (NO req.user)
    await BkashAgreement.create({
      walletNumber: response.data.payerReference,
      agreementId: response.data.agreementID,
      status: "ACTIVE",
    });

    return res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
