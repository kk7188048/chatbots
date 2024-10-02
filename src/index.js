const express = require('express');
const app = express();
const port = 3000;

// Mock menu data with subcategories
const menu = {
    pizza: {
        spicy: [
            { name: 'Spicy Hawaiian', price: 10.99 },
            { name: 'Spicy Pepperoni', price: 9.99 },
        ],
        nonSpicy: [
            { name: 'Margherita', price: 8.99 },
            { name: 'Pepperoni', price: 9.99 },
        ],
    },
    pasta: {
        cheesy: [
            { name: 'Cheesy Carbonara', price: 12.99 },
            { name: 'Creamy Alfredo', price: 13.99 },
        ],
        nonCheesy: [
            { name: 'Bolognese', price: 13.99 },
            { name: 'Aglio e Olio', price: 11.99 },
        ],
    },
    // Add more categories here
};

app.get('/menu/:category/:subCategory', (req, res) => {
    const category = req.params.category.toLowerCase();
    const subCategory = req.params.subCategory.toLowerCase();
    
    const items = menu[category]?.[subCategory] || [];
    res.json(items);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
