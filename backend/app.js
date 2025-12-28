const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
require('./conn/conn');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoute = require('./routes/user');
const itemRoute = require('./routes/item');
const cartRoute = require('./routes/cart');
const orderRoute = require('./routes/order');
const bkashRoute = require('./routes/bkash');
const foodRoute = require('./routes/food');
const PopularDishesRoute = require('./routes/PopularDishes');
const RecommendedMealsRoute = require('./routes/RecommendedMeals');
const bkashAgreementRoutes = require("./routes/bkashAgreement");
const bkashPaymentRoutes = require("./routes/bkashPayment");

// Register routes
app.use('/api/user', userRoute);
app.use('/api/item', itemRoute);
app.use('/api/cart', cartRoute);
app.use('/api/order', orderRoute);
app.use('/api/bkash', bkashRoute);
app.use('/api/food', foodRoute);
app.use("/api/bkash-agreement", bkashAgreementRoutes);
app.use("/api/bkash-payment", bkashPaymentRoutes);


app.use('/api/PopularDishes', PopularDishesRoute);
app.use('/api/RecommendedMeals', RecommendedMealsRoute);
// Health check route
app.get('/', (req, res) => {
  res.send('✅ Server is running and connected to MongoDB!');
});

// Global error handler (optional but recommended)
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
