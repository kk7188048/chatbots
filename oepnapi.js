const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { MongoClient } = require('mongodb');
const { Menu } = require('./src/seedmenu'); // Ensure this path is correct
const readline = require('readline');
const nlp = require('compromise');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// MongoDB Client
const client = new MongoClient(process.env.MONGODB);
let db;

// Connect to MongoDB
// Connect to MongoDB
async function connectToDatabase() {
    try {
      await mongoose.connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
      process.exit(1);
    }
  }
  
  // Fetch menu items from MongoDB
  async function fetchMenuFromDB() {
    try {
      // Wait for the database connection to be established
      await connectToDatabase();
  
      // Check if the connection is established
      if (mongoose.connection.readyState === 1) {
        const menuItem = await Menu.find({}, 'foodName')    
        console.log(menuItem);

        return menuItem;
      } else {
        console.error("Error: MongoDB connection is not established");
        return [];
      }
    } catch (error) {
      console.error("Error fetching menu from DB:", error);
      return [];
    }
  }

// Get AI response from the model
async function getChatResponse(prompt) {
    console.log("prompt", prompt);
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


// async function handleCustomerInput(customerInput = "") {
//     let staticPrompt = `
//     Identity:*  
// Myra is a friendly, knowledgeable female waiter, specializing in customer interactions at Xero Degrees, a quick-service restaurant that serves continental and Italian dishes. She is a North Indian and speaks Hinglish like people in Delhi, maintaining professionalism, and focusing on delivering a seamless customer experience.

// *Style:*  
// Conversational and spartan, avoiding corporate jargon. Myra speaks Hindi for conversation but uses English for item names, units, and standard terms. She speaks with warmth, offering clear and concise responses, no longer than 10-15 words, ensuring a smooth order process.

// *Response Guidelines:*  
// - Greet customers warmly and introduce yourself.  
// - Guide customers through the continental and Italian menu options.  
// - Suggest popular items, combinations, and upsell or cross-sell when appropriate.  
// - Assist customers with special dietary preferences or help them choose between options.  
// - Confirm orders promptly and ensure there’s no delay in the customer’s selection process.  
// - When an item is unavailable, offer similar alternatives from the menu.  
// - Handle difficult-to-pronounce item names by suggesting the best match from the menu and confirming with the customer.  
// - Avoid repeating item prices unless asked.  
// - Conclude by thanking the customer and offering further assistance if needed.

// Examples of responses:

// 1. Customer says: "Piri Piri Pizza"
//    Assistant: "Kya aapka matlab 'Peri Peri Pizza' tha?"

// 2. Customer says: "Cold Coffe"
//    Assistant: "Kya aap 'Cold Coffee' kehna chahte hain?"

// 3. Customer says: "Chiken Wings"
//    Assistant: "Kya aap 'Chicken Wings' kehna chahte hain?"

// If you cannot find a close match, respond:
//    "Mujhe sahi se samajh nahi aaya. Kripya item ka naam fir se boliye."
//     `;

//     if (!customerInput) {
//         staticPrompt += `
//         Customer has not provided any input yet. Please greet them warmly and introduce yourself.
//         `;
//         const response = await getChatResponse(staticPrompt);
//         return response;
//     }

//     const menuItems = await fetchMenuFromDB();
//     let normalizedInput = customerInput.toLowerCase().trim();

//     // Normalize input by removing common phrases
//     const commonPhrases = [
//         "i want",
//         "can i get",
//         "i would like",
//         "give me",
//         "please bring me"
//     ];

//     commonPhrases.forEach(phrase => {
//         if (normalizedInput.startsWith(phrase)) {
//             normalizedInput = normalizedInput.replace(phrase, "").trim();
//         }
//     });

//     const foodNames = menuItems.map(item => item.foodName);

//     // Filter food names based on the normalized input (case insensitive)
//     const matchedItems = foodNames.filter(name => name.toLowerCase().includes(normalizedInput));

//     console.log("Matched Items:", matchedItems); // Log matched items

//     if (matchedItems.length > 0) {
//         // Fetch food items for each matched item from the database
//         const allFoodItems = [];

//         for (const foodName of matchedItems) {
//             try {
//                 const foodItems = await Menu.find({ foodName: foodName }).exec();
//                 allFoodItems.push(...foodItems);
//             } catch (error) {
//                 console.error(`Error fetching items for ${foodName}:`, error);
//             }
//         }

//         // Log the combined food items
//         console.log("All Food Items:", allFoodItems.map(item => item.foodItems).flat().map(item => item.name));
//         const all = allFoodItems.map(item => item.foodItems).flat().map(item => item.name);
//         const itemNames = matchedItems.join(', ');
        
//         staticPrompt += ` Customer is looking for '${customerInput}'. Here are some items I found: ${itemNames}.`;

//         if (all.length > 0) {
//             staticPrompt += ` Here is the menu related to: ${all.join(', ')}.`;
//         } else {
//             staticPrompt += " Lekin koi food items nahi mile.";
//         }
//     } else {
//         staticPrompt += " Mujhe sahi se samajh nahi aaya. Kripya item ka naam fir se boliye.";
//     }

//     const response = await getChatResponse(staticPrompt);
//     return response;
// }
let conversationState = {
    stage: 'greeting', // Other stages: 'ordering', 'confirmation', etc.
    currentOrder: [],
    confirmed: false
};

// Update conversation state based on user's input
function updateConversationState(input) {
    if (conversationState.stage === 'greeting') {
        conversationState.stage = 'ordering';
    } else if (conversationState.stage === 'ordering' && input) {
        conversationState.currentOrder.push(input);
        conversationState.stage = 'confirmation';
    } else if (conversationState.stage === 'confirmation') {
        conversationState.confirmed = input.toLowerCase().includes("yes");
        conversationState.stage = 'complete';
    }
}

// Generate a question or response based on the current conversation state
async function generateDynamicResponse(input) {
    if (conversationState.stage === 'greeting') {
        return "Welcome! What would you like to order today?";
    } else if (conversationState.stage === 'ordering') {
        updateConversationState(input);
        const menuItems = await fetchMenuFromDB();
        return `You've ordered: ${conversationState.currentOrder.join(', ')}. Would you like anything else?`;
    } else if (conversationState.stage === 'confirmation') {
        updateConversationState(input);
        if (conversationState.confirmed) {
            return `Thank you! Your order for ${conversationState.currentOrder.join(', ')} has been confirmed. Would you like to add a drink?`;
        } else {
            return `Got it, what else would you like to add?`;
        }
    } else if (conversationState.stage === 'complete') {
        return "Your order is complete! Thank you for ordering with us!";
    }
}

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

    // Split input into individual food items
    const foodKeywords = normalizedInput.split(/,\s*|and\s+/); 
    console.log("Food Keywords:", foodKeywords);
    
    const matchedItems = [];

    for (const keyword of foodKeywords) {
        const foodNames = menuItems.map(item => item.foodName);
        console.log("Food Names:", foodNames);
        const foundItems = foodNames.filter(name => name.toLowerCase().includes(keyword));
        console.log("Found Items:", foundItems);
        if (foundItems.length > 0) {
            matchedItems.push(...foundItems);
        }
    }

    console.log("Matched Items:", matchedItems); // Log matched items

    if (matchedItems.length > 0) {
        // Fetch food items for each matched item from the database
        const allFoodItems = [];

        for (const foodName of matchedItems) {
            try {
                const foodItems = await Menu.find({ foodName: foodName }).exec();
                allFoodItems.push(...foodItems);
            } catch (error) {
                console.error(`Error fetching items for ${foodName}:`, error);
            }
        }

        // Log the combined food items
        console.log("All Food Items:", allFoodItems.map(item => item.foodItems).flat().map(item => item.name));
        
        const all = allFoodItems.map(item => item.foodItems).flat().map(item => item.name);
        const itemNames = [...new Set(matchedItems)].join(', '); // Unique matched items
        
        staticPrompt += ` Customer is looking for '${customerInput}'. Here are some items I found: ${itemNames}.`;

        if (all.length > 0) {
            staticPrompt += ` Here is the menu related to: ${all.join(', ')}.`;
        } else {
            staticPrompt += " Lekin koi food items nahi mile.";
        }
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
    await promptUser();
}


startChatbot();