// ShaDollar Intelligence Worker v5
export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("🚀 ShaDollar Intelligence is running.");
    }

    let update;

    try {
      update = await request.json();
    } catch {
      return new Response("Invalid request", { status: 400 });
    }

    const message = update.message;

    if (!message?.chat?.id || !message.text) {
      return new Response("OK");
    }

    const chatId = message.chat.id;
    let reply;

    try {
      if (!env.AI) {
        throw new Error("Workers AI binding AI is missing.");
      }

      const result = await env.AI.run(
        "@cf/meta/llama-3.1-8b-instruct-fast",
        {
          messages: [
            {
              role: "system",
              content:
                "You are ShaDollar Intelligence. " +
                "Answer clearly and simply. Separate facts " +
                "from interpretation. Admit uncertainty and " +
                "never invent facts."
            },
            {
              role: "user",
              content: message.text
            }
          ]
        }
      );

      reply =
        result?.response ||
        "The AI returned no answer. Please try again.";
    } catch (error) {
      console.error("ShaDollar AI error:", error);

      reply =
        "ShaDollar diagnostic: AI request failed. " +
        (error?.message || "Unknown error").slice(0, 700);
    }

    try {
      const telegramResponse = await fetch(
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

      if (!telegramResponse.ok) {
        console.error(
          "Telegram sendMessage error:",
          await telegramResponse.text()
        );
      }
    } catch (error) {
      console.error("Telegram connection error:", error);
    }

    return new Response("OK");
  }
};
