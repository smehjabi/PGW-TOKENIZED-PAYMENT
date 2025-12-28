const express = require('express');
const router = express.Router();
const PopularDish = require('../models/PopularDishes');
const { authenticateToken } = require('./userAuth');

// Add Popular Dish (Admin only)
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { id } = req.user;
    const { name, imageUrl, restaurant, price, description, category } = req.body;

    if (!name || !imageUrl || !restaurant || !price || !description || !category)
      return res.status(400).json({ message: "All fields are required" });

    const newDish = new PopularDish({ name, imageUrl, restaurant, price, description, category });
    await newDish.save();
    res.status(201).json({ message: "Popular dish added", data: newDish });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all popular dishes
router.get('/get-all', async (req, res) => {
  try {
    const dishes = await PopularDish.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "Success", data: dishes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
