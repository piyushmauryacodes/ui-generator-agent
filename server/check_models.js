require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

    console.log("Checking available models...");

    
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();
    
    if (data.models) {
        console.log("✅ AVAILABLE MODELS FOR YOU:");
        data.models.forEach(m => {
            if (m.name.includes("generateContent")) {
                console.log(`- ${m.name.replace('models/', '')}`);
            }
        });
    } else {
        console.log("❌ Error listing models:", data);
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();