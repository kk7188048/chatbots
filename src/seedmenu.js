const mongoose = require('mongoose');
const menuData = require('./menudata');
require('dotenv').config(); 

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number },
  priceRegular: { type: Number },
  priceLarge: { type: Number }
});

const foodCategorySchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  foodItems: [foodItemSchema] // Array of food items
});

const Menu = mongoose.model('Menu', foodCategorySchema);

module.exports = {
  Menu,
  foodItemSchema,
  foodCategorySchema
};

