const OpenAI = require("openai");
const marked = require("marked");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handleChat(req, res) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: req.body.prompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const rawReply = response.choices[0].message.content;

    // Convert markdown to HTML
    const formattedReply = marked.parse(rawReply);
    res.send({ message: formattedReply });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).send({ message: error.message });
  }
};
