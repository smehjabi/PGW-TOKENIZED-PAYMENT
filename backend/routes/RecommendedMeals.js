const express = require('express');
const router = express.Router();
const Recommendation = require('../models/RecommendedMeals');
const { authenticateToken } = require('./userAuth');

// Add Recommendation (Admin only)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { name, imageUrl, restaurant, price, description, category } = req.body;

    if (!name || !imageUrl || !restaurant || !price || !description || !category)
      return res.status(400).json({ message: "All fields are required" });

    const newItem = new Recommendation({ name, imageUrl, restaurant, price, description, category });
    await newItem.save();
    res.status(201).json({ message: "Recommendation added", data: newItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all recommendations
router.get('/get-all', async (req, res) => {
  try {
    const items = await Recommendation.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "Success", data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
