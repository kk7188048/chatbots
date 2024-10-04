// seedDatabase.js
const mongoose = require('mongoose');
const menuData = require('./menudata');
const { Menu } = require('./seedmenu');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected successfully to server');

    // Drop existing data (optional)
    await Menu.deleteMany({});

    // Insert the new menu data
    await Menu.insertMany(menuData);
  } catch (err) {
    console.error(err);
  }
}

module.exports = seedDatabase;