const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai');

const app = express(); // <<< Define app here

const port = process.env.PORT || 3000;

// Line SDK config
const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

// OpenAI config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middleware to parse JSON
app.use(express.json());

// Webhook endpoint
app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  console.log('Incoming webhook event:', JSON.stringify(req.body, null, 2)); // Log webhook event

  res.sendStatus(200); // Respond immediately to LINE

  const events = req.body.events;
  const client = new line.Client(lineConfig);

  events.forEach(async (event) => {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });

        const replyText = completion.choices[0].message.content;

        // Reply to LINE
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });
      }
    } catch (err) {
      console.error('Error handling event:', err);
    }
  });
});

// Start server, listening on 0.0.0.0 for Render compatibility
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});