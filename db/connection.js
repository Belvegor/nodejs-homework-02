const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://igorsocha:k3X2ARUZBre5AiUo@hwcluster.gz1m6hu.mongodb.net/?retryWrites=true&w=majority&appName=HWcluster', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connection successful');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;