const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const Item = require('../models/item');
const PopularDish = require('../models/PopularDishes');
const Recommendation = require('../models/RecommendedMeals');
const { authenticateToken } = require('./userAuth');

// ------------------- ADMIN ROUTES -------------------

// Add a new item (Admin only)
router.post('/add-item', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin')
      return res.status(403).json({ message: "Forbidden. Only admin can add items." });

    const { name, imageUrl, restaurant, price, description, category, isAvailable } = req.body;
    if (!name || !imageUrl || !restaurant || !price || !description || !category)
      return res.status(400).json({ message: "All fields are required." });

    const newItem = new Item({ name, imageUrl, restaurant, price, description, category, isAvailable });
    await newItem.save();
    res.status(201).json({ message: "Item added successfully", data: newItem });
  } catch (error) {
    console.error('Error in /add-item:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update an item (Admin only)
router.put('/update-item/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin')
      return res.status(403).json({ message: "Forbidden. Only admin can update items." });

    const { itemId } = req.params;
    const updatedFields = (({ name, imageUrl, restaurant, price, description, category, isAvailable }) =>
      ({ name, imageUrl, restaurant, price, description, category, isAvailable }))(req.body);

    const updatedItem = await Item.findByIdAndUpdate(itemId, updatedFields, { new: true });
    if (!updatedItem) return res.status(404).json({ message: "Item not found" });
    res.status(200).json({ message: "Item updated successfully", data: updatedItem });
  } catch (error) {
    console.error('Error in /update-item:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ------------------- USER ROUTES -------------------

// Get all items (for menu)
router.get('/get-all-items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "Success", data: items });
  } catch (error) {
    console.error('Error in /get-all-items:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Add to cart
router.post('/add-to-cart', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const userId = req.user?.id || req.headers.id;

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent duplicates
    if (user.cart.includes(itemId)) {
      return res.status(400).json({ message: "Item already in cart" });
    }

    user.cart.push(itemId);
    await user.save();

    res.status(200).json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error('Error in /add-to-cart:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Remove from cart
router.delete('/remove-from-cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const { itemId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.cart = user.cart.filter(id => id.toString() !== itemId);
    await user.save();

    res.status(200).json({ message: "Item removed from cart successfully" });
  } catch (error) {
    console.error('Error in /remove-from-cart:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// ------------------- COMBINED SEARCH -------------------
router.get('/combined-search', async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ status: "Error", message: "Query is required" });

    // Search across Item, PopularDish, and Recommendation
    const [items, popularDishes, recommendations] = await Promise.all([
      Item.find({ $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]}),
      PopularDish.find({ $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]}),
      Recommendation.find({ $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]})
    ]);

    const combined = [...items, ...popularDishes, ...recommendations];
    res.status(200).json({ status: "Success", data: combined });
  } catch (err) {
    console.error('Error in /combined-search', err);
    res.status(500).json({ status: "Error", message: "Internal server error", error: err.message });
  }
});

module.exports = router;
