app.post('/webhook', line.middleware(lineConfig), (req, res) => {
  console.log('Incoming webhook event:', JSON.stringify(req.body, null, 2)); // Log incoming LINE event

  res.sendStatus(200); // Always respond 200 OK quickly

  const events = req.body.events;
  const client = new line.Client(lineConfig);

  events.forEach(async (event) => {
    try {
      if (event.type === 'message' && event.message.type === 'text') {
        const userMessage = event.message.text;
        console.log('User message:', userMessage); // Log user message

        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: userMessage }],
        });

        const replyText = completion.choices[0].message.content;
        console.log('Reply from GPT:', replyText); // Log AI reply

        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: replyText,
        });
      }
    } catch (err) {
      console.error('Processing error:', err); // Log any processing error
    }
  });
});