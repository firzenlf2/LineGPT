const express = require('express');
const line = require('@line/bot-sdk');
const { OpenAI } = require('openai');

const app = express();
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
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
  try {
    const events = req.body.events;
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;

        // Call ChatGPT API
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });

        const replyText = completion.choices[0].message.content;

        // Reply to Line
        const client = new line.Client(lineConfig);
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });
      }
    }
    res.status(200).end();
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
