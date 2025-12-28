const router = require('express').Router();
const { authenticateToken } = require('./userAuth');
const Order = require('../models/order');
const User = require('../models/user');
const axios = require('axios');
let sendEmail;
try {
  sendEmail = require('../services/emailService');
} catch {
  console.warn('sendEmail function not found. Emails will not be sent.');
}

// ---------------- bKash config -----------------
const BKASH_BASE_URL = "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout/";
const APP_KEY = process.env.BKASH_APP_KEY;
const APP_SECRET = process.env.BKASH_APP_SECRET;
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;

let accessToken = null;
let tokenExpireTime = null;

// Generate / refresh bKash token
async function generateBkashToken() {
  const payload = { app_key: APP_KEY, app_secret: APP_SECRET };
  const response = await axios.post(`${BKASH_BASE_URL}auth/grant-token`, payload, {
    headers: {
      "Content-Type": "application/json",
      username: BKASH_USERNAME,
      password: BKASH_PASSWORD
    }
  });
  accessToken = response.data.id_token;
  tokenExpireTime = Date.now() + 3500 * 1000;
  console.log("✅ New bKash Token Generated");
  return accessToken;
}

// ------------------- Place Order -------------------
router.post('/place-order', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    if (!userId) return res.status(400).json({ message: "User ID not found" });

    const { order, paymentMethod, customerDetails } = req.body;
    if (!order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ message: "Order must be a non-empty array of items" });
    }

    const orderIds = [];
    for (const orderData of order) {
      if (!orderData._id) return res.status(400).json({ message: "Each order item must have a valid _id" });

      const newOrder = new Order({ user: userId, item: orderData._id, paymentMethod, customerDetails, paymentStatus: paymentMethod === 'Bkash' ? 'Pending' : 'Cash' });
      const saved = await newOrder.save();
      orderIds.push(saved._id);
    }

    // Update user cart and orders
    await User.findByIdAndUpdate(userId, {
      $push: { orders: { $each: orderIds } },
      $pull: { cart: { $in: order.map(o => o._id) } }
    });

    // Optional: send email
    if (sendEmail) {
      const user = await User.findById(userId);
      if (user?.email) {
        const subject = 'Order Confirmation - FoodApp';
        const text = `Dear ${user.username},\n\nYour order has been placed successfully.\n\nThank you,\nFoodApp Team`;
        try { sendEmail(user.email, subject, text); } catch (err) { console.error(err); }
      }
    }

    res.json({ status: "Success", message: "Order Placed Successfully", orderIds });
  } catch (error) {
    console.error('Error in /place-order:', error);
    res.status(500).json({ message: "An error has occurred", error: error.message });
  }
});

// ------------------- Get Order History -------------------
router.get('/get-order-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const userData = await User.findById(userId).populate({ path: 'orders', populate: { path: 'item' } });
    res.json({ status: "Success", data: (userData.orders || []).reverse() });
  } catch (error) {
    console.error('Error in /get-order-history:', error);
    res.status(500).json({ message: "An error has occurred", error: error.message });
  }
});

// ------------------- Get All Orders (Admin) -------------------
router.get('/get-all-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const requester = await User.findById(userId);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: "Access denied" });

    const allOrders = await Order.find().populate('user').populate('item').sort({ createdAt: -1 });
    res.json({ status: "Success", data: allOrders });
  } catch (error) {
    console.error('Error in /get-all-orders:', error);
    res.status(500).json({ message: "An error has occurred", error: error.message });
  }
});

// ------------------- Update Status (Admin) -------------------
router.put('/update-status/:id', authenticateToken, async (req, res) => {
  try {
    const requesterId = req.user?.id || req.headers.id;
    const requester = await User.findById(requesterId);
    if (!requester || requester.role !== 'admin') return res.status(403).json({ message: "Access denied" });

    const { id } = req.params;
    const { status } = req.body;

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true }).populate('user');
    if (!updated) return res.status(404).json({ message: "Order not found" });

    // Notify user via email
    if (sendEmail && updated.user?.email) {
      const subject = `Your order status at FoodApp is ${status}`;
      const text = `Dear ${updated.user.username},\n\nYour order status has been updated to ${status}.\n\nRegards,\nFoodApp Team`;
      try { sendEmail(updated.user.email, subject, text); } catch (err) { console.error(err); }
    }

    res.json({ status: "Success", message: "Status Updated Successfully" });
  } catch (error) {
    console.error('Error in /update-status:', error);
    res.status(500).json({ message: "An error has occurred", error: error.message });
  }
});

// ------------------- bKash Create Payment -------------------
router.post('/create-payment', authenticateToken, async (req, res) => {
  try {
    if (!accessToken || Date.now() > tokenExpireTime) {
      await generateBkashToken();
    }

    const { amount, payerReference, callbackURL, merchantInvoiceNumber } = req.body;
    const payload = {
      mode: "0011",
      payerReference: payerReference || "01770618567",
      callbackURL: callbackURL || "http://localhost:5173",
      amount: amount?.toString() || "1.00",
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: merchantInvoiceNumber || `INV-${Date.now()}`
    };

    const response = await axios.post(`${BKASH_BASE_URL}payment/create`, payload, {
      headers: { "Content-Type": "application/json", Authorization: accessToken, "X-APP-Key": APP_KEY }
    });

    res.json(response.data);
  } catch (err) {
    console.error('bKash create-payment error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Create payment failed', details: err.response?.data || err.message });
  }
});

// ------------------- bKash Execute Payment -------------------
router.post('/execute-payment', authenticateToken, async (req, res) => {
  try {
    if (!accessToken || Date.now() > tokenExpireTime) {
      await generateBkashToken();
    }

    const { paymentId } = req.body;
    if (!paymentId) return res.status(400).json({ error: "paymentId is required" });

    const response = await axios.post(`${BKASH_BASE_URL}payment/execute`, { paymentId }, {
      headers: { "Content-Type": "application/json", Authorization: accessToken, "X-APP-Key": APP_KEY }
    });

    res.json(response.data);
  } catch (err) {
    console.error('bKash execute-payment error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Execute payment failed', details: err.response?.data || err.message });
  }
});

// ------------------- Payment Success -------------------

module.exports = router;
