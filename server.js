require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/bot.html');
});

app.post('/chat', async (req, res) => {
  const userMessage = req.body.message?.trim();
  console.log("User message:", userMessage);

  if (!userMessage) return res.json({ message: "Please type a message." });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.json({ message: "Server error: API key missing." });

  const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: userMessage }]
          }
        ]
      }),
    });

    const data = await response.json();
    console.log("Gemini API response:", JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("Gemini API Error:", data.error);
      return res.json({ message: `Error: ${data.error.message}` });
    }

    const botMessage =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from bot.";

    res.json({ message: botMessage });

  } catch (error) {
    console.error("Error fetching bot response:", error);
    res.status(500).json({ message: "Server error: failed to fetch response." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
