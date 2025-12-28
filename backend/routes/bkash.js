const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authenticateToken } = require('./userAuth');

// bKash Sandbox base URL
const BKASH_BASE_URL = "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/";

// Load credentials from .env
const APP_KEY = process.env.BKASH_APP_KEY;
const APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;

// Store token and expiry in memory
let accessToken = null;
let tokenExpireTime = null;

// ===============================
// 🔐 Helper: Generate / Refresh Token
// ===============================
async function generateBkashToken() {
  const payload = {
    app_key: APP_KEY,
    app_secret: APP_SECRET
  };

  const response = await axios.post(`${BKASH_BASE_URL}auth/grant-token`, payload, {
    headers: {
      "Content-Type": "application/json",
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD
    }
  });

  accessToken = response.data.id_token;
  tokenExpireTime = Date.now() + 3500 * 1000; // 58 minutes validity
  console.log("✅ New bKash Token Generated");
  return accessToken;
}

// ===============================
// 🧩 Grant Token Endpoint
// ===============================
router.post('/grant-token', async (req, res) => {
  try {
    // If token is still valid, reuse it
    if (accessToken && Date.now() < tokenExpireTime) {
      console.log("♻️ Using cached bKash token");
      return res.json({ message: "Reused existing token", token: accessToken });
    }

    // Otherwise, generate a new one
    const token = await generateBkashToken();
    res.json({ message: "New token granted successfully", token });
  } catch (err) {
    console.error("❌ Token generation failed:", err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to grant token' });
  }
});

// 💳 Create Payment
router.post('/create-payment', async (req, res) => {
  try {
    if (!accessToken || Date.now() > tokenExpireTime) {
      await generateBkashToken();
    }

    const { amount, payerReference, callbackURL, merchantInvoiceNumber } = req.body;
    const payload = {
      mode: "0011",
      payerReference: payerReference || "01770618567",
      callbackURL: callbackURL || "http://localhost:5173/payment-success",
      amount: amount?.toString() || "1.00",
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: merchantInvoiceNumber || `INV-${Date.now()}`
    };

    const response = await axios.post(`${BKASH_BASE_URL}payment/create`, payload, {
      headers: { "Content-Type": "application/json", Authorization: accessToken, "X-APP-Key": APP_KEY }
    });

    console.log("✅ bKash create-payment response:", response.data);
    res.json(response.data);
  } catch (err) {
    console.error("❌ bKash create-payment error:", err.response?.data || err.message);
    res.status(500).json({ error: 'Create payment failed', details: err.response?.data || err.message });
  }
});

// // ⚡ Execute Payment
router.post('/execute-payment', async (req, res) => {
  try {
    // Refresh token if expired
    if (!accessToken || Date.now() > tokenExpireTime) {
      await generateBkashToken();
    }

    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

    // Execute payment
    const response = await axios.post(`${BKASH_BASE_URL}payment/execute`, { paymentId }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
        "X-APP-Key": APP_KEY
      }
    });

    console.log("✅ bKash execute-payment response:", response.data);

    // If already completed (ETC70052), treat as success
    const internalCode = response.data?.transactionStatus;
    if (internalCode === 'Completed') {
      return res.json({
        transactionStatus: 'Completed',
        message: 'Payment Successful',
        originalResponse: response.data
      });
    }

    // Return normal success response
    res.json(response.data);

  } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error("❌ bKash execute-payment error:", errorData);

    // Check if ETC70052 or similar inside error response
    const internalCode = errorData?.internalCode || errorData?.errorCode;
    if (internalCode === 'payment_already_completed' || internalCode === 'ETC70052') {
      return res.json({
        transactionStatus: 'Completed',
        message: 'Payment was already completed',
        originalResponse: errorData
      });
    }

    // Otherwise real error
    res.status(500).json({ error: 'Execute payment failed', details: errorData });
  }
});









module.exports = router;
