// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const { ensureValidToken } = require("../helpers/bkashAgreement");
// const BkashAgreement = require("../models/bkashAgreement");

// // ===========================
// // 1️⃣ Create Agreement
// // ===========================
// router.post("/create", async (req, res) => {
//   try {
//     global.amount = req.body.amount;
//     console.log(global.amount);
//     // 🔍 STEP 1: Check if agreement already exists (wallet-based)
//     const existingAgreement = await BkashAgreement.findOne({
//       walletNumber: req.body.phone,
//       status: "ACTIVE",
//     });

//     // if (existingAgreement) {
//     //   return res.json({
//     //     message: "Agreement already exists",
//     //     agreementId: existingAgreement.agreementId,
//     //   });
//     // }

//     // 🔐 STEP 2: Get valid bKash token
//     const token = await ensureValidToken();

//     // 🔗 STEP 3: Create new agreement (OTP will be sent)
//     const response = await axios.post(
//       `${process.env.BKASH_BASE_URL}agreement/create`,
//       {
//         mode: "0000",
//         payerReference: req.body.phone, // wallet number
//         callbackURL: `${process.env.SERVER_URL}/api/bkash-agreement/execute`,
//       },
//       {
//         headers: {
//           Authorization: token,
//           "X-App-Key": process.env.BKASH_APP_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(500).json({ error: err.response?.data || err.message });
//   }
// });

// // ===========================
// // 2️⃣ Execute Agreement
// // Called by bKash after OTP
// // ===========================
// router.get("/execute", async (req, res) => {
//   try {
//     const token = await ensureValidToken();
//     const agreementId = req.query.agreementId;
//     console.log("agreementId:", agreementId);

//     if (!agreementId) {
//       return res.status(400).json({ error: "agreementID is required" });
//     }

//     const response = await axios.post(
//       `${process.env.BKASH_BASE_URL}agreement/execute`,
//       { agreementId },
//       {
//         headers: {
//           Authorization: token,
//           "X-App-Key": process.env.BKASH_APP_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // 💾 STEP 3: Save agreement in DB (NO req.user)
//     await BkashAgreement.create({
//       walletNumber: response.data.payerAccount,
//       agreementId: response.data.agreementId,
//       status: "ACTIVE",
//     });

//     const paymentResponse = await axios.post(
//       `http://localhost:3000/api/bkash-payment/create`,
//       { agreementId , amount},
//       {
//         headers: {
//           Authorization: token,
//           "X-App-Key": process.env.BKASH_APP_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     window.open(paymentResponse.data.bkashURL);
//     // return res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     return res.status(500).json({ error: err.response?.data || err.message });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const axios = require("axios");
const { ensureValidToken } = require("../helpers/bkashAgreement");
const BkashAgreement = require("../models/bkashAgreement");

/**
 * ===========================
 * 1️⃣ CREATE AGREEMENT
 * ===========================
 */
router.post("/agreement/create", async (req, res) => {
  try {
    const { phone } = req.body;

    global.amount = req.body.amount;
    
    const token = await ensureValidToken();

    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}agreement/create`,
      {
        mode: "0000",
        payerReference: phone,
        callbackURL: `${process.env.SERVER_URL}/api/bkash/agreement/execute`,
      },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/**
 * ===========================
 * 2️⃣ EXECUTE AGREEMENT
 * ===========================
 */
router.get("/agreement/execute", async (req, res) => {
  try {
    const token = await ensureValidToken();
    const { agreementId, status } = req.query;
    if (!agreementId || status !== "success") {
      return res.redirect("http://localhost:5173/agreement-failed");
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

    await BkashAgreement.create({
      walletNumber: response.data.payerAccount,
      agreementId: response.data.agreementId,
      status: "ACTIVE",
    });

    // try {
    //   const token = await ensureValidToken();

    //   if (!agreementId || !global.amount) {
    //     return res.status(400).json({ error: "agreementId & amount required" });
    //   }

    //   const response = await axios.post(
    //     `${process.env.BKASH_BASE_URL}payment-with-agreement/create`,
    //     {
    //       agreementId,
    //       amount: global.amount,
    //       currency: "BDT",
    //       intent: "sale",
    //       merchantInvoiceNumber: `INV-${Date.now()}`,
    //       callbackURL: `${process.env.SERVER_URL}/api/bkash/payment/execute`,
    //     },
    //     {
    //       headers: {
    //         Authorization: token,
    //         "X-App-Key": process.env.BKASH_APP_KEY,
    //         "Content-Type": "application/json",
    //       },
    //     }
    //   );

    //   res.json(response.data);
    // } catch (err) {
    //   console.error(err.response?.data || err.message);
    //   res.status(500).json({ error: err.response?.data || err.message });
    // }

    res.redirect(
      `http://localhost:5173/payment-success?agreementId=${agreementId}&total=${global.amount}`
    );
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/**
 * ===========================
 * 3️⃣ CREATE PAYMENT WITH AGREEMENT
 * ===========================
 */
router.post("/payment/create", async (req, res) => {
  try {
    const token = await ensureValidToken();
    const { agreementId, amount } = req.body;

    if (!agreementId || !amount) {
      return res.status(400).json({ error: "agreementId & amount required" });
    }

    const response = await axios.post(
      `${process.env.BKASH_BASE_URL}payment-with-agreement/create`,
      {
        agreementId,
        amount,
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: `INV-${Date.now()}`,
        callbackURL: `${process.env.SERVER_URL}/api/bkash/payment/execute`,
      },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

/**
 * ===========================
 * 4️⃣ EXECUTE PAYMENT
 * ===========================
 */
router.get("/payment/execute", async (req, res) => {
  try {
    const token = await ensureValidToken();
    const { paymentID, agreementId, status } = req.query;

    console.log(req.query);

    if (!paymentID || !agreementId || status !== "success") {
      return res.redirect("http://localhost:5173/payment-failed");
    }

    const executeResponse = await axios.post(
      `${process.env.BKASH_BASE_URL}payment-with-agreement/execute`,
      {
        paymentId: paymentID,
        agreementId: agreementId,
      },
      {
        headers: {
          Authorization: token,
          "X-App-Key": process.env.BKASH_APP_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const trxId = executeResponse.data?.trxId;

    if (!trxId) {
      return res.redirect(
        "http://localhost:5173/payment-failed?reason=trxId_not_found"
      );
    }

    res.redirect(`http://localhost:5173/payment-success?trxId=${trxId}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
