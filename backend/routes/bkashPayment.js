const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ensureValidToken } = require("../helpers/bkashAgreement");

// ===========================
// 1️⃣ Create Payment With Agreement
// ===========================
router.post("/create", async (req, res) => {
  try {
    const token = await ensureValidToken();
    const {
      agreementId,
      payerReference,
      amount,
      merchantInvoiceNumber,
      subMerchantName, // optional
    } = req.body;

    if (!agreementId || !payerReference || !amount || !merchantInvoiceNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = await axios.post(
      process.env.BKASH_BASE_URL + "payment-with-agreement/create",
      {
        agreementId,
        payerReference,
        amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber,
        subMerchantName: subMerchantName || "",
        callbackURL: `${process.env.SERVER_URL}/api/bkash-payment/execute`, // bKash callback URL
      },
      {
        headers: {
          Authorization: "Bearer " + token,
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
// 2️⃣ Execute Payment With Agreement
// Handles:
// - POST from Postman or backend for manual execution
// - GET callback from bKash for success/failure/cancel
// ===========================
router.all("/execute", async (req, res) => {
  try {
    const token = await ensureValidToken();

    // Get paymentId and agreementId from POST body or GET query
    const paymentId = req.body.paymentId || req.query.paymentID;
    const agreementId = req.body.agreementId || req.query.agreementId;
    const status = req.query.status || null; // success/failure/cancel

    if (!paymentId || !agreementId) {
      return res.status(400).json({ error: "paymentId and agreementId are required" });
    }

    if (req.method === "POST") {
      // Manual execution via Postman
      const response = await axios.post(
        process.env.BKASH_BASE_URL + "payment-with-agreement/execute",
        { paymentId, agreementId },
        {
          headers: {
            Authorization: "Bearer " + token,
            "X-App-Key": process.env.BKASH_APP_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json(response.data);
    } else {
      // GET request from bKash callback
      console.log("bKash callback received:", { paymentId, agreementId, status });

      // Here you can update your DB with transaction status if needed

      return res.send("Callback received successfully");
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
