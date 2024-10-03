const express = require('express');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Define Menu and Subcategory Schemas
const menuSchema = new mongoose.Schema({
    category: String,
    subCategory: String,
    items: [
        { name: String, price: Number }
    ]
});

const subcategorySchema = new mongoose.Schema({
    category: String,
    options: [String]
});

const Menu = mongoose.model('Menu', menuSchema);
const SubCategory = mongoose.model('SubCategory', subcategorySchema);

// Fetch menu items based on category only
app.get('/menu/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const menu = await Menu.find({ category });
        if (menu.length > 0) {
            res.json(menu);
        } else {
            res.status(404).json({ message: 'Menu items not found for this category' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});



// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
