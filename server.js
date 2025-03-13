const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 10000; // Render is listening on this port

// LINE SDK config
const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

// OpenAI config
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use raw body for /webhook to let LINE SDK validate signature
app.post('/webhook', express.raw({ type: 'application/json' }), line.middleware(lineConfig), (req, res) => {
  console.log('Incoming webhook event:', JSON.stringify(req.body, null, 2)); // Log event for debugging

  res.sendStatus(200); // Respond immediately

  const events = req.body.events;
  const client = new line.Client(lineConfig);

  events.forEach(async (event) => {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        console.log('User message:', userMessage); // Debug log

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });

        const replyText = completion.choices[0].message.content;
        console.log('Reply from GPT:', replyText); // Debug log

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

// Start server on 0.0.0.0 for Render compatibility
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});