const mongoose = require('mongoose');
require('dotenv').config(); // Ensure you load environment variables

// Define the FoodItem schema
const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number },
  priceRegular: { type: Number },
  priceLarge: { type: Number }
});

// Define the FoodCategory schema
const foodCategorySchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  foodItems: [foodItemSchema] // Array of food items
});

// Create the model
const Menu = mongoose.model('Menu', foodCategorySchema);

// Sample menu data
const menuData = [
  {
    foodName: 'Fries',
    foodItems: [
      { name: 'Classic Fries', price: 189 },
      { name: 'Cheesy Fries', price: 209 },
      { name: 'Dil Se Cheesy Fries', price: 229 },
      { name: 'Hola Mexican', price: 229 },
      { name: 'Peri Peri Fries', price: 249 },
      { name: 'Southwest Garlic Fries', price: 249 },
      { name: 'Paneer Popcorn Fries', price: 269 }
    ]
  },
  {
    foodName: 'Special Fries Non Veg',
    foodItems: [
      { name: 'Chicken ‘n’ Cheese', price: 279 },
      { name: 'Chicken Seekh Tandoori', price: 289 },
      { name: 'Dil se Chicken Cheese', price: 289 },
      { name: 'Peri Peri Chicken Fries', price: 289 },
      { name: 'Chicken Poppers', price: 299 },
      { name: 'Chicken Ball Garlic Fries', price: 299 },
      { name: 'Hola Mexican Chicken', price: 299 }
    ]
  },
  {
    foodName: 'Pizza Veg',
    foodItems: [
      { name: 'Cheesy Margherita', priceRegular: 279, priceLarge: 379 },
      { name: 'Veggie Affair', priceRegular: 309, priceLarge: 399 },
      { name: 'Peri-Peri Paneer Delight', priceRegular: 339, priceLarge: 429 },
      { name: 'Crispy Peppe Paneer', priceRegular: 339, priceLarge: 429 },
      { name: 'Makhani Paneer Pizza', priceRegular: 349, priceLarge: 439 }
    ]
  },
  {
    foodName: 'Pizza Non Veg',
    foodItems: [
      { name: 'Chicken Tikka', priceRegular: 359, priceLarge: 449 },
      { name: 'Peri-Peri Chicken', priceRegular: 369, priceLarge: 459 },
      { name: 'Loaded Chicken', priceRegular: 379, priceLarge: 469 },
      { name: 'Butter Chicken', priceRegular: 379, priceLarge: 469 },
      { name: 'Chicken Delight', priceRegular: 379, priceLarge: 469 }
    ]
  },
  {
    foodName: 'Single Serve',
    foodItems: [
      { name: 'Cheese Onion', price: 99 },
      { name: 'Cheese Corn', price: 99 },
      { name: 'Cheese Capsicum', price: 99 },
      { name: 'Paneer Delight', price: 109 },
      { name: 'Chicken Cheese', price: 129 }
    ]
  },
  {
    foodName: 'Star Shaped Pizza',
    foodItems: [
      { name: 'Mac & Cheese Pizza', price: 379 },
      { name: 'Mughlai Paneer', price: 379 },
      { name: 'Mughlai Chicken', price: 429 },
      { name: 'Peri Peri Chicken Ball', price: 429 }
    ]
  },
  {
    foodName: 'Pizza In A Jar',
    foodItems: [
      { name: 'Veg Pizza in a Jar', price: 149 },
      { name: 'Non Veg Pizza in a Jar', price: 169 }
    ]
  },
  {
    foodName: 'Appetizers',
    foodItems: [
      { name: 'Veg Pizza Pocket', price: 199 },
      { name: 'Mexican Nachos', price: 239 },
      { name: 'Mac ‘n’ Cheese', price: 249 },
      { name: 'Baked Cheesy Nachos', price: 249 },
      { name: 'Mini Veg Roll', price: 259 },
      { name: 'Eggsplosion', price: 209 },
      { name: 'Galouti Kebab', price: 279 },
      { name: 'Chicken Mac ‘n’ Cheese', price: 289 },
      { name: 'Chilling Chicken Fries', price: 289 },
      { name: 'Chicken Keema with Pao', price: 309 },
      { name: 'Chicken Balls in Cheese Sauce', price: 319 },
      { name: 'Mini Chicken ‘n’ Cheese Roll', price: 319 }
    ]
  }
];

// Connect to MongoDB using Mongoose
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
    console.error('Error seeding the database:', err);
  } finally {
    // Close the connection after seeding
    mongoose.connection.close();
  }
}

// Run the database seeding function
seedDatabase();

module.exports = {
    Menu,
    foodItemSchema,
    foodCategorySchema
};
