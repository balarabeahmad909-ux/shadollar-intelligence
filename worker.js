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
              role: "**Current Economic Situation in Nigeria:**

1. **Fiscal Deficit:** Nigeria's fiscal deficit has been rising, reaching N5.6 trillion (approximately $13.5 billion USD) in 2022. This is largely due to a decline in oil revenue, which accounts for about 70% of the country's revenue.
2. **Inflation:** Nigeria's inflation rate has been high, averaging around 15.6% in 2022. This is mainly due to a combination of factors, including a decline in agricultural productivity, a rise in food prices, and a devaluation of the naira.
3. **Exchange Rate:** The naira has been devalued, with the official exchange rate standing at around N430 per USD in 2022. This has led to a decrease in purchasing power for ordinary citizens.
4. **Unemployment:** Nigeria's unemployment rate has been high, with estimates suggesting that around 33% of the labor force is unemployed.
5. **Poverty:** Nigeria has one of the highest poverty rates in the world, with an estimated 40% of the population living below the poverty line.

**Implications for Ordinary Citizens:**

1. **Increased Prices:** The high inflation rate and devaluation of the",
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
