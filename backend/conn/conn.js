const mongoose = require('mongoose');

const conn = async () => {
    try {
        await mongoose.connect(process.env.MONGO, {
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
    }
};


conn();
module.exports = mongoose;