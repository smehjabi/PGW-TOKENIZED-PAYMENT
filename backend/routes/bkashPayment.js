
// const express = require("express");
// const router = express.Router();
// const axios = require("axios");
// const { ensureValidToken } = require("../helpers/bkashAgreement");

// /**
//  * ===========================
//  * 1️⃣ Create Payment With Agreement
//  * ===========================
//  */
// router.post("/create", async (req, res) => {
//   try {
//     const token = await ensureValidToken();
//     const {
//       agreementId,
//       payerReference,
//       amount,
//       merchantInvoiceNumber,
//     } = req.body;
//     console.log(req.body);
//     if (!agreementId || !payerReference || !amount || !merchantInvoiceNumber) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     const response = await axios.post(
//       `${process.env.BKASH_BASE_URL}payment-with-agreement/create`,
//       {
//         agreementId : req.body.agreementId,
//         // payerReference,
//         amount : req.body.amount,
//         currency: "BDT",
//         intent: "sale",
//         merchantInvoiceNumber: "12121212sdfsdf",
//         callbackURL: `${process.env.SERVER_URL}/api/bkash-payment/execute`,
//       },
//       {
//         headers: {
//           Authorization: token,
//           "X-App-Key": process.env.BKASH_APP_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     res.json(response.data);
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: err.response?.data || err.message });
//   }
// });

// /**
//  * ===========================
//  * 2️⃣ Execute Payment With Agreement
//  * ===========================
//  */
// router.get("/execute", async (req, res) => {
//   try {
//     const token = await ensureValidToken();

//     const paymentId = req.query.paymentID; // bKash sends paymentID
//     const agreementId = req.query.agreementId;
//     const status = req.query.status;

//     if (!paymentId || !agreementId) {
//       return res.status(400).json({ error: "paymentId or agreementId missing" });
//     }
//     if (status !== "success") {
//       return res.redirect("/payment-failed");
//     }

//     const executeResponse = await axios.post(
//       `${process.env.BKASH_BASE_URL}payment-with-agreement/execute`,
//       {
//         paymentId,
//         agreementId,
//       },
//       {
//         headers: {
//           Authorization: token,
//           "X-App-Key": process.env.BKASH_APP_KEY,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log("Payment executed:", executeResponse.data);

//     // 👉 Save trxId, payment status, payerAccount in DB here

//     res.redirect("http://localhost:5173/payment-success");
//   } catch (err) {
//     console.error("Payment execute error:", err.response?.data || err.message);
//     res.status(500).json({ error: err.response?.data || err.message });
//   }
// });  


// module.exports = router;