const mongoose = require('mongoose');

// Your MongoDB connection URL
const mongoURI = 'mongodb://localhost:27017/Shopping-site';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to mongoDB')
  } catch (error) {
    console.log(error)
  }
};

module.exports = {connectDB};
