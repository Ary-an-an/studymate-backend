import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// health check
app.get("/", (req, res) => {
  res.send("StudyMate backend is running with Groq");
});

// main chat endpoint – matches your index.html exactly
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;

    // basic validation to avoid crashes
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // ensure roles/content are strings
    const safeMessages = messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "")
    }));

    const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: safeMessages
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ error: "AI backend error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
