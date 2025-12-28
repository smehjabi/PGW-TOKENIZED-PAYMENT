const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ensureValidToken } = require("../helpers/bkashAgreement");

// ===========================
// 1️⃣ Create Agreement
// ===========================
router.post("/create", async (req, res) => {
  try {
    const token = await ensureValidToken();

    const response = await axios.post(
      process.env.BKASH_BASE_URL + "agreement/create", // <-- fixed URL
      {
        mode: "0000",
        payerReference: req.body.phone, // phone number from frontend
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
      process.env.BKASH_BASE_URL + "agreement/execute",
      {
        agreementId,  // must match bKash's requirement
        
      },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
