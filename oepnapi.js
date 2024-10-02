const axios = require('axios');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to interact with Gemini AI
async function getMenuItemsFromChat(userInput) {
    const prompt = `You are a friendly restaurant chatbot named ChefBot. 
    Respond naturally as if you're helping a customer at a restaurant.
    If the user asks for pizza or pasta, guide them to choose from available options, like spicy or non-spicy for pizza, cheesy or non-cheesy for pasta.
    Always respond in a conversational, engaging way.
    The user said: "${userInput}". How do you respond?`;

    const response = await model.generateContent(prompt);
    
    const answer = response?.content?.trim() || "I didn't catch that. Could you please clarify?";
    return answer;
}

// Function to fetch menu data based on category and subcategory
async function fetchMenuItems(category, subCategory) {
    try {
        const response = await axios.get(`http://localhost:3000/menu/${category}/${subCategory}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        return []; // Return an empty array in case of error
    }
}

// Function to handle user input with dynamic conversation flow
async function handleUserInput() {
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Hey! Welcome to ChefBot’s menu. What would you like to have today? (pizza or pasta): ', async (userInput) => {
        const geminiResponse = await getMenuItemsFromChat(userInput);

        // Basic category detection (Pizza or Pasta)
        let category = '';
        let subCategory = '';
        
        if (userInput.toLowerCase().includes('pizza')) {
            category = 'pizza';
            
            // Human-like transition to ask for preferences
            rl.question('Great choice! Do you prefer your pizza spicy or more on the mild side? (spicy/non-spicy): ', async (spicyInput) => {
                subCategory = spicyInput.toLowerCase().includes('spicy') ? 'spicy' : 'nonSpicy';
                const menuItems = await fetchMenuItems(category, subCategory);
                displayMenuItems(category, menuItems);
                rl.close();
            });
        } else if (userInput.toLowerCase().includes('pasta')) {
            category = 'pasta';
            
            rl.question('Yum! Would you like your pasta to be extra cheesy or a little lighter? (cheesy/non-cheesy): ', async (cheesyInput) => {
                subCategory = cheesyInput.toLowerCase().includes('cheesy') ? 'cheesy' : 'nonCheesy';
                const menuItems = await fetchMenuItems(category, subCategory);
                displayMenuItems(category, menuItems);
                rl.close();
            });
        } else {
            // Fallback to Gemini’s response
            console.log(geminiResponse || "I didn't quite understand. Could you let me know if you're in the mood for pizza or pasta?");
            rl.close();
        }
    });
}

// Function to display menu items in a human-friendly way
function displayMenuItems(category, menuItems) {
    if (menuItems.length > 0) {
        console.log(`Here are our ${category} options for you! Let me know what looks good:`);
        menuItems.forEach(item => console.log(`- ${item.name}: $${item.price.toFixed(2)}`));
    } else {
        console.log(`Hmm, it seems like we’re out of options for ${category} at the moment. Could I suggest something else?`);
    }
}

// Start the chatbot interaction
handleUserInput();
