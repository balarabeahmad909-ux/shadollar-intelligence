// ShaDollar Intelligence Worker v3
export default {
  async fetch(request, env) {
    try {
      if (request.method === "POST") {
        const update = await request.json();
        const message = update.message;

        if (!message) return new Response("OK");

        const chatId = message.chat.id;
        const text = message.text || "";

        const reply =
          "🤖 ShaDollar Intelligence\n\n" +
          "I received your message:\n\n" +
          `"${text}"\n\n` +
          "The bot is connected and ready.";

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
