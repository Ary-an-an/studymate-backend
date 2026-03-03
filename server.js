import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("StudyMate backend is running");
});

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages = [
      { role: "system", content: "You are StudyMate, a warm, concise study assistant. Keep answers short and clear." }
    ];

    if (Array.isArray(history)) {
      for (const item of history) {
        if (item.role && item.content) {
          messages.push({ role: item.role, content: item.content });
        }
      }
    }

    messages.push({ role: "user", content: message });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.get("/", (req, res) => {
  res.send("StudyMate backend is running with Groq");
});

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages
    });

    const reply = completion.choices[0]?.message?.content || "No response";
    res.json({ reply });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ error: "AI backend error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
