// ShaDollar Intelligence Worker v4
export default {
  async fetch(request, env) {
    try {
      if (request.method === "POST") {
        const update = await request.json();
        const message = update.message;

        if (!message) return new Response("OK");

        const chatId = message.chat.id;
        const text = message.text || "";

        const aiResponse = await env.AI.run(
          "@cf/meta/llama-3.1-8b-instruct-fast",
          {
            messages: [
              {
                role: "system",
                content:
                  "You are ShaDollar Intelligence, a careful analytical assistant. " +
                  "Answer clearly and simply. Separate facts from interpretation. " +
                  "When information is uncertain, say so. Do not invent facts."
              },
              {
                role: "user",
                content: text
              }
            ]
          }
        );

        const reply =
          aiResponse?.response ||
          "I could not generate an analysis right now.";

        await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: reply
            })
          }
        );

        return new Response("OK");
      }

      return new Response("🚀 ShaDollar Intelligence is running.");
    } catch (error) {
      return new Response("Error: " + error.message, {
        status: 500
      });
    }
  }
};
