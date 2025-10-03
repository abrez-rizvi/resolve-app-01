const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = "AIzaSyCXmEx12sKqnKeAUbljyGJjUCs4IBFxDG8";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY;

// Default system prompt for Gemini
const SYSTEM_PROMPT = "You are a mental health specialist helping someone struggling with masturbation/porn addiction. Answer with empathy and expertise.";

app.post('/gemini', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const payload = {
    contents: [
      { parts: [{ text: SYSTEM_PROMPT }] },
      { parts: [{ text: userMessage }] }
    ]
  };

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, Gemini did not return a response.";
    res.json({ answer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to connect to Gemini API.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
});
