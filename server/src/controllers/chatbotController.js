import asyncHandler from "../middleware/asyncHandler.js";

const fallbackReply = (message) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("weight loss") || normalized.includes("fat loss")) {
    return "For weight loss, focus on a steady calorie deficit, consistent strength training, daily movement, and high-protein meals to stay full and protect muscle.";
  }

  if (normalized.includes("workout")) {
    return "A solid workout week usually includes 3 to 5 training days, compound lifts first, progressive overload, and enough recovery between hard sessions.";
  }

  if (normalized.includes("diet") || normalized.includes("meal") || normalized.includes("nutrition")) {
    return "Keep your diet simple: build meals around protein, vegetables, smart carbs, and hydration. Consistency beats extreme plans.";
  }

  if (normalized.includes("muscle") || normalized.includes("gain")) {
    return "For muscle gain, train with enough intensity, eat in a small calorie surplus, hit your protein target, and prioritize sleep and recovery.";
  }

  if (normalized.includes("streak") || normalized.includes("motivation")) {
    return "Keep the streak going by lowering the barrier to action. A short workout done consistently is more valuable than waiting for the perfect day.";
  }

  return "I can help with workouts, diet planning, fat loss, muscle gain, recovery, and staying consistent. Ask me something specific and I'll guide you.";
};

const tryGenerateWithOpenAI = async (message) => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a concise, encouraging fitness assistant for the PrimePhysique app."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI chatbot request failed.");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
};

export const chatWithBot = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message?.trim()) {
    res.status(400);
    throw new Error("message is required.");
  }

  let reply;
  let source = "fallback";

  try {
    const aiReply = await tryGenerateWithOpenAI(message);

    if (aiReply) {
      reply = aiReply;
      source = "openai";
    }
  } catch (error) {
    reply = null;
  }

  if (!reply) {
    reply = fallbackReply(message);
  }

  res.json({
    source,
    reply
  });
});
