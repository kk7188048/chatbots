const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require('mongodb');
const { Menu } = require('./src/seedmenu'); // Ensure this path is correct
const readline = require('readline');
const nlp = require('compromise');
require('dotenv').config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MongoDB Client
const client = new MongoClient(process.env.MONGODB);
let db;

// Connect to MongoDB
async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('restaurant');
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

// Get AI response from the model
async function getChatResponse(prompt) {
    try {
        const response = await model.generateContent(prompt);
        const candidates = response.response.candidates;

        if (candidates && candidates.length > 0) {
            return candidates[0].content.parts[0].text;
        }

        return "I didn't catch that. Could you please clarify?";
    } catch (error) {
        console.error("Error fetching AI response:", error);
        return "I'm having trouble responding right now. Please try again.";
    }
}

// Fetch menu items from MongoDB
async function fetchMenuFromDB() {
    try {
        const menuItem = await Menu.findOne();
        if (!menuItem) return [];

        // Flatten the menu items into a single array
        return Array.from(menuItem.items.values()).flat();
    } catch (error) {
        console.error("Error fetching menu from DB:", error);
        return [];
    }
}

// Handle customer input and generate responses
async function handleCustomerInput(customerInput = "") {
    let staticPrompt = `
    Identity:*  
Myra is a friendly, knowledgeable female waiter, specializing in customer interactions at Xero Degrees, a quick-service restaurant that serves continental and Italian dishes. She is a North Indian and speaks Hinglish like people in Delhi, maintaining professionalism, and focusing on delivering a seamless customer experience.

*Style:*  
Conversational and spartan, avoiding corporate jargon. Myra speaks Hindi for conversation but uses English for item names, units, and standard terms. She speaks with warmth, offering clear and concise responses, no longer than 10-15 words, ensuring a smooth order process.

*Response Guidelines:*  
- Greet customers warmly and introduce yourself.  
- Guide customers through the continental and Italian menu options.  
- Suggest popular items, combinations, and upsell or cross-sell when appropriate.  
- Assist customers with special dietary preferences or help them choose between options.  
- Confirm orders promptly and ensure there’s no delay in the customer’s selection process.  
- When an item is unavailable, offer similar alternatives from the menu.  
- Handle difficult-to-pronounce item names by suggesting the best match from the menu and confirming with the customer.  
- Avoid repeating item prices unless asked.  
- Conclude by thanking the customer and offering further assistance if needed.

Examples of responses:

1. Customer says: "Piri Piri Pizza"
   Assistant: "Kya aapka matlab 'Peri Peri Pizza' tha?"

2. Customer says: "Cold Coffe"
   Assistant: "Kya aap 'Cold Coffee' kehna chahte hain?"

3. Customer says: "Chiken Wings"
   Assistant: "Kya aap 'Chicken Wings' kehna chahte hain?"

If you cannot find a close match, respond:
   "Mujhe sahi se samajh nahi aaya. Kripya item ka naam fir se boliye."
    `;

    if (!customerInput) {
        staticPrompt += `
        Customer has not provided any input yet. Please greet them warmly and introduce yourself.
        `;
        const response = await getChatResponse(staticPrompt);
        return response;
    }

    const menuItems = await fetchMenuFromDB();

    let normalizedInput = customerInput.toLowerCase().trim();

    // Extract keywords using compromise
    const doc = nlp(normalizedInput);
    const keywords = doc.nouns().out('array');

    // Normalize input by removing common phrases
    const commonPhrases = [
        "i want",
        "can i get",
        "i would like",
        "give me",
        "please bring me"
    ];

    commonPhrases.forEach(phrase => {
        if (normalizedInput.startsWith(phrase)) {
            normalizedInput = normalizedInput.replace(phrase, "").trim();
        }
    });

    console.log(menuItems)

    const matchedItems = menuItems.filter(menuItem =>
        keywords.some(keyword =>
            menuItem.name.toLowerCase().includes(keyword)
        )
    );

    if (matchedItems.length > 0) {
        const itemNames = matchedItems.map(item => item.name).join(', ');
        staticPrompt += ` Customer is looking for '${customerInput}'. Here are some items I found: ${itemNames}.`;
        console.log("Matched items:", matchedItems);
    } else {
        staticPrompt += " Mujhe sahi se samajh nahi aaya. Kripya item ka naam fir se boliye.";
    }

    const response = await getChatResponse(staticPrompt);
    return response;
}

// Prompt user for input
async function promptUser() {
    const greetingResponse = await handleCustomerInput();
    console.log("Myra's greeting:", greetingResponse);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Please enter your order (e.g., Pizza): ', async (input) => {
        rl.close();
        try {
            const response = await handleCustomerInput(input);
            console.log("Myra's response:", response);
        } catch (error) {
            console.error("Error handling customer input:", error);
        }
    });
}

// Start the chatbot application
async function startChatbot() {
    await connectToDatabase();
    promptUser();
}

startChatbot();