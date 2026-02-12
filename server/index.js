require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { OpenAI } = require('openai'); // We use OpenAI SDK for Groq

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.options('*', cors());
app.use(express.json());

// 1. Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

const VersionSchema = new mongoose.Schema({
  prompt: String,
  plan: String,
  code: String,
  explanation: String,
  timestamp: { type: Date, default: Date.now }
});
const Version = mongoose.model('Version', VersionSchema);

// 2. AI Configuration (GROQ via OpenAI SDK)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
  baseURL: "https://api.groq.com/openai/v1" // <--- This points to Groq!
});

// 3. SYSTEM PROMPT
const SYSTEM_PROMPT = `
You are a React UI Generator. You strictly adhere to a FIXED Component System.
You CANNOT use standard HTML tags like <div>, <button>, <input> directly unless wrapping a layout.
You MUST use these components:
<Container>, <Card title="" footer="">, <Button variant="primary|secondary|danger">, <Input label="">, <Alert type="info|success|warning">, <Row>, <Col>

RULES:
1. Return ONLY the JSX code. No markdown, no \`\`\`.
2. Do NOT include import statements or 'export default'.
3. Assume the code runs inside a render function.
4. If the user asks for a modification, keep the existing structure but update the props/components.
`;

app.post('/api/generate', async (req, res) => {
  const { userPrompt, currentCode } = req.body;

  try {
    console.log("🤖 Agent Step 1: Planning...");
    
    // STEP 1: PLANNER
    const planResponse = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a UI Architect. Create a brief 3-step plan." },
        { role: "user", content: userPrompt }
      ]
    });
    const plan = planResponse.choices[0].message.content;

    console.log("🤖 Agent Step 2: Generating Code...");
    
    // STEP 2: GENERATOR
    const codeResponse = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `
          PLAN: ${plan}
          CURRENT CODE: ${currentCode || "None"}
          USER REQUEST: ${userPrompt}
          
          Generate the pure JSX now:
        `}
      ]
    });
    
    let generatedCode = codeResponse.choices[0].message.content;
    // Clean markdown
    generatedCode = generatedCode.replace(/```jsx/g, '').replace(/```/g, '').trim();

    console.log("🤖 Agent Step 3: Explaining...");
    
    // STEP 3: EXPLAINER
    const explainResponse = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "Explain in 1 sentence why you chose these components." },
        { role: "user", content: `Plan: ${plan}. Request: ${userPrompt}` }
      ]
    });
    const explanation = explainResponse.choices[0].message.content;

    // Save Version
    const newVersion = await new Version({
        prompt: userPrompt,
        plan,
        code: generatedCode,
        explanation
    }).save();

    res.json({ plan, code: generatedCode, explanation, versionId: newVersion._id });

  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "AI Failed" });
  }
});

app.get('/api/versions', async (req, res) => {
  const versions = await Version.find().sort({ timestamp: -1 }).limit(10);
  res.json(versions);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));