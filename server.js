import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" })); // increased limit for large file extracts

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// health check — also used by frontend keep-alive ping
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "IDE backend", model: "openai/gpt-oss-120b" });
});

// main chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { messages, system } = req.body;

    // basic validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // ensure roles and content are clean strings
    const safeMessages = messages.map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "")
    }));

    // build the full messages array — system prompt goes first if provided
    const fullMessages = [];

    if (system && typeof system === "string" && system.trim().length > 0) {
      fullMessages.push({
        role: "system",
        content: system.trim()
      });
    }

    fullMessages.push(...safeMessages);

    const completion = await client.chat.completions.create({
      model: "deepseek-r1-distill-llama-70b",
      messages: fullMessages,
      temperature: 0.7,     // balanced — creative but not hallucinating
      max_tokens: 2048,     // enough for detailed teaching responses
    });

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I couldn't generate a response.";

    res.json({ reply });
  } catch (error) {
    console.error("Groq error:", error);
    res.status(500).json({ error: "AI backend error", detail: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`IDE backend running on port ${PORT}`);
});
