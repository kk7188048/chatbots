const mongoose = require('mongoose');
require('dotenv').config(); // Ensure you load environment variables

// Define the Item schema
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number },
  priceRegular: { type: Number },
  priceLarge: { type: Number }
});

// Define the Menu schema using Mixed type for dynamic categories
const menuSchema = new mongoose.Schema({
  items: {
    type: Map,
    of: [itemSchema] // Each key in the map is an array of items
  }
});

// Create the model
const Menu = mongoose.model('Menu', menuSchema);


// Menu data
const menuData = {
  items: {
    Fries: [
      { name: 'Classic Fries', price: 189 },
      { name: 'Cheesy Fries', price: 209 },
      { name: 'Dil Se Cheesy Fries', price: 229 },
      { name: 'Hola Mexican', price: 229 },
      { name: 'Peri Peri Fries', price: 249 },
      { name: 'Southwest Garlic Fries', price: 249 },
      { name: 'Paneer Popcorn Fries', price: 269 }
    ],
    SpecialFriesNonVeg: [
      { name: 'Chicken ‘n’ Cheese', price: 279 },
      { name: 'Chicken Seekh Tandoori', price: 289 },
      { name: 'Dil se Chicken Cheese', price: 289 },
      { name: 'Peri Peri Chicken Fries', price: 289 },
      { name: 'Chicken Poppers', price: 299 },
      { name: 'Chicken Ball Garlic Fries', price: 299 },
      { name: 'Hola Mexican Chicken', price: 299 }
    ],
    PizzaVeg: [
      { name: 'Cheesy Margherita', priceRegular: 279, priceLarge: 379 },
      { name: 'Veggie Affair', priceRegular: 309, priceLarge: 399 },
      { name: 'Peri-Peri Paneer Delight', priceRegular: 339, priceLarge: 429 },
      { name: 'Crispy Peppe Paneer', priceRegular: 339, priceLarge: 429 },
      { name: 'Makhani Paneer Pizza', priceRegular: 349, priceLarge: 439 }
    ],
    PizzaNonVeg: [
      { name: 'Chicken Tikka', priceRegular: 359, priceLarge: 449 },
      { name: 'Peri-Peri Chicken', priceRegular: 369, priceLarge: 459 },
      { name: 'Loaded Chicken', priceRegular: 379, priceLarge: 469 },
      { name: 'Butter Chicken', priceRegular: 379, priceLarge: 469 },
      { name: 'Chicken Delight', priceRegular: 379, priceLarge: 469 }
    ],
    SingleServe: [
      { name: 'Cheese Onion', price: 99 },
      { name: 'Cheese Corn', price: 99 },
      { name: 'Cheese Capsicum', price: 99 },
      { name: 'Paneer Delight', price: 109 },
      { name: 'Chicken Cheese', price: 129 }
    ],
    StarShapedPizza: [
      { name: 'Mac & Cheese Pizza', price: 379 },
      { name: 'Mughlai Paneer', price: 379 },
      { name: 'Mughlai Chicken', price: 429 },
      { name: 'Peri Peri Chicken Ball', price: 429 }
    ],
    PizzaInAJar: [
      { name: 'Veg Pizza in a Jar', price: 149 },
      { name: 'Non Veg Pizza in a Jar', price: 169 }
    ],
    Appetizers: [
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
};

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
    const menu = new Menu(menuData);
    await menu.save();
    console.log('Menu data inserted successfully');
  } catch (err) {
    console.error('Error seeding the database:', err);
  } finally {
    // Close the connection
    await mongoose.connection.close();
  }
}

// Run the database seeding function
seedDatabase();
module.exports = {
    Menu,
    itemSchema,
    menuSchema
  };
  