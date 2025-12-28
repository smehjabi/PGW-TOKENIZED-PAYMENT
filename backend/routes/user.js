const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Complaint = require('../models/ComplainPage_model');
const { authenticateToken } = require('./userAuth');

// Sign Up
router.post('/sign-up', async (req, res) => {
  try {
    const { username, email, password, address } = req.body;
    if (!username || !email || !password || !address) return res.status(400).json({ message: "All fields are required" });
    if (username.length < 4) return res.status(400).json({ message: "Username must be at least 4 characters" });
    if (password.length <= 4) return res.status(400).json({ message: "Password must be at least 4 characters" });

    if (await User.findOne({ username })) return res.status(400).json({ message: "Username already exists" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, address });
    await newUser.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    console.error('Error in /sign-up:', error);
    res.status(500).json({ message: "Router Error", error: error.message });
  }
});

// Sign In
router.post('/sign-in', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "All fields are required" });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid Credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(200).json({ id: user._id, role: user.role, token });
  } catch (error) {
    console.error('Error in /sign-in:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get user (uses token or headers.id)
router.get('/get-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    if (!userId) return res.status(400).json({ message: "User id required" });
    const data = await User.findById(userId).select('-password');
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in /get-user:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Update user address
router.put('/update-user', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    const { address } = req.body;
    if (!userId) return res.status(400).json({ message: "User id required" });
    await User.findByIdAndUpdate(userId, { address });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error('Error in /update-user:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Submit complaint
router.post('/complain', authenticateToken, async (req, res) => {
  try {
    const { type, description } = req.body;
    const userId = req.user?.id || req.body.userId || req.headers.id;
    if (!userId || !type || !description) return res.status(400).json({ message: "All fields are required" });

    const newComplaint = new Complaint({ userId, complaintType: type, complaintText: description });
    await newComplaint.save();
    res.status(200).json({ message: "Complaint submitted successfully" });
  } catch (error) {
    console.error('Error in /complain:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get all complaints (admin only)
router.get('/complaints', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id || req.headers.id;
    if (!userId) return res.status(400).json({ message: "User id required" });
    const requester = await User.findById(userId);
    if (!requester) return res.status(404).json({ message: "User not found" });
    if (requester.role !== 'admin') return res.status(403).json({ message: "Access denied" });

    const complaints = await Complaint.find().populate('userId', 'username email');
    res.status(200).json({ status: "Success", data: complaints });
  } catch (error) {
    console.error('Error in /complaints:', error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;