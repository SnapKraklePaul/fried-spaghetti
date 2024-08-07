const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  let uri;

  if (process.env.MONGODB_ENV === 'atlas') {
    const username = encodeURIComponent(process.env.MONGODB_ATLAS_USERNAME);
    const password = encodeURIComponent(process.env.MONGODB_ATLAS_PASSWORD);
    const cluster = process.env.MONGODB_ATLAS_CLUSTER;
    const dbName = process.env.MONGODB_ATLAS_DB_NAME;

    uri = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;
  } else {
    // Default to local if not set to 'atlas'
    uri = process.env.LOCAL_MONGODB_URI;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB (${process.env.MONGODB_ENV === 'atlas' ? 'Atlas' : 'Local'})`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;