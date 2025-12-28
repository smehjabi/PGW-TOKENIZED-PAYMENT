const router = require('express').Router();
const User = require('../models/user');
const { authenticateToken } = require('./userAuth');

// Add to cart
router.put("/add-to-cart", authenticateToken, async (req, res) => {
  try {
    const itemid = req.headers.itemid || req.body.itemid;
    const userId = req.user.id;
    if (!itemid) return res.status(400).json({ message: "Item id required" });

    const userData = await User.findById(userId);
    if (!userData) return res.status(404).json({ message: "User not found" });

    const isiteminCart = userData.cart.some(i => i.toString() === itemid.toString());
    if (isiteminCart) return res.json({ status: "success", message: "Item already in cart" });

    await User.findByIdAndUpdate(userId, { $push: { cart: itemid } });
    res.json({ status: "success", message: "Item added to cart successfully" });
  } catch (error) {
    console.error('Error in /add-to-cart:', error);
    res.status(500).json({ message: "An error occurred", error });
  }
});

// Remove from cart
router.put("/remove-from-cart/:itemid", authenticateToken, async (req, res) => {
  try {
    const { itemid } = req.params;
    const userId = req.user.id;
    await User.findByIdAndUpdate(userId, { $pull: { cart: itemid } });
    res.json({ status: "Success", message: "Item removed from cart" });
  } catch (error) {
    console.error('Error in /remove-from-cart:', error);
    res.status(500).json({ message: "An Error Occurred" });
  }
});

// Get user cart
router.get('/get-user-cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await User.findById(userId).populate("cart");
    res.json({ status: "Success", data: userData.cart.reverse() });
  } catch (error) {
    console.error('Error in /get-user-cart:', error);
    res.status(500).json({ message: "An Error Occurred" });
  }
});

module.exports = router;