const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require('mongodb');
const { Menu, itemSchema, menuSchema } = require('./src/seedmenu');

require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const client = new MongoClient(process.env.MONGODB);
const db = client.db('restaurant');

function calculateLevenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str1.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1]; 
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    Math.min(matrix[i][j - 1] + 1,
                              matrix[i - 1][j] + 1)
                );
            }
        }
    }

    return matrix[str1.length][str2.length];
}

function calculateStringSimilarity(str1, str2) {
    const distance = calculateLevenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    return maxLength === 0 ? 1 : (maxLength - distance) / maxLength;
}

async function getChatResponse(prompt) {
    const response = await model.generateContent(prompt);
    const candidates = response.response.candidates;
    
    for (const candidate of candidates) {
        return candidate.content.parts[0].text;
    }
    
    return "I didn't catch that. Could you please clarify?";
}

async function fetchMenuFromDB() {
    const menuItem = await Menu.findOne();
    console.log(menuItem.items);
    
    return menuItem ? Array.from(menuItem.items.entries()).flatMap(([key, value]) => value) : [];
}

function findClosestMenuItem(customerItem, menu) {
    const customerItemLower = customerItem.toLowerCase();
    let bestMatch = null;
    let highestConfidence = 0;

    menu.forEach(menuItem => {
        const menuItemLower = menuItem.name.toLowerCase();
        const similarity = calculateStringSimilarity(customerItemLower, menuItemLower);
        console.log(menuItem.name, similarity);

        if (similarity > highestConfidence) {
            highestConfidence = similarity;
            bestMatch = menuItem.name;
        }
    });

    return highestConfidence > 0.8 ? bestMatch : null;
}

async function handleCustomerInput(customerInput) {
    let staticPrompt = `
      Myra is a friendly, knowledgeable female waiter specializing in customer interactions at Xero Degrees. 
      She serves continental and Italian dishes and communicates in Hindi for conversation, using English for item names.
    `;

   const menuItems = await fetchMenuFromDB();
   console.log(staticPrompt);

   // Find items containing the customer input
   const matchedItems = menuItems.filter(menuItem => 
       menuItem.name.toLowerCase().includes(customerInput.toLowerCase())
   );

   // Check if any items matched
   if (matchedItems.length > 0) {
       const itemNames = matchedItems.map(item => item.name).join(', ');
       staticPrompt += ` Customer is looking for '${customerInput}'. Here are some items I found: ${itemNames}.`;
   } else {
       staticPrompt += " Mujhe sahi se samajh nahi aaya. Kripya item ka naam fir se boliye.";
   }

   const response = await getChatResponse(staticPrompt);
   return response;
}

// Example of usage with a customer input
handleCustomerInput("Pizza").then(response => {
   console.log(response); // Myra's generated response
});
