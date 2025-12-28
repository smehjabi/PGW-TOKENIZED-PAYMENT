const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Item = require('../models/item'); // your Item model

// ------------------- GET SINGLE FOOD ITEM -------------------
router.get('/foods/:id', async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ status: "Error", message: "Invalid food ID" });
  }

  try {
    const food = await Item.findById(id)
      .populate('comments.user', 'name email')
      .populate('ratings.user', 'name email');

    if (!food) {
      return res.status(404).json({ status: "Error", message: "Food not found" });
    }

    // Optional: calculate average rating
    const avgRating = food.calculateAverageRating();

    res.status(200).json({
      status: "Success",
      data: food,
      averageRating: avgRating
    });
  } catch (error) {
    console.error('Error in GET /foods/:id', error);
    res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
});

// ------------------- GET ALL FOODS -------------------
router.get('/foods', async (req, res) => {
  try {
    const foods = await Item.find().sort({ createdAt: -1 });
    res.status(200).json({ status: "Success", data: foods });
  } catch (error) {
    console.error('Error in GET /foods', error);
    res.status(500).json({
      status: "Error",
      message: "Internal server error",
      error: error.message
    });
  }
});

module.exports = router;
