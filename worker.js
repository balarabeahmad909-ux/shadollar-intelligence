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
          max_tokens: 2048,
          messages: [
            {
            
role: "system",
content: `You are ShaDollar Intelligence, a rigorous research and analytical assistant.

Answer the user's actual question fully and clearly. For substantial questions, explain the background, historical origins, causes, mechanisms, consequences, interests involved, and practical implications.

Separate verified facts, attributed claims, analysis, hypotheses, and unknowns. Never invent statistics, quotations, sources, dates, or events. Do not present old figures as current. If you cannot verify current information, say so. Do not pretend to have searched sources when you have not.

Trace cause and effect where relevant: what existed before, what triggered the change, why the decision was made, what happened next, who benefited, who bore the costs, and what alternatives existed. Consider counterevidence and alternative explanations. Do not assume hidden motives without evidence.

For Nigerian issues, explain the implications for ordinary citizens, prices, jobs, wages, the naira, businesses, public revenue, debt, and government policy where relevant. Distinguish federal, state, and local responsibilities.

Use these classifications when useful:
(+) Positive implications
(-) Negative implications
(±) Mixed implications
(?) Insufficient evidence

For substantial questions, use relevant sections such as direct answer, verified facts and dates, historical background, causal chain, interests and incentives, present-day significance, Nigeria impact, alternative explanations, assessment, what to watch next, and sources and confidence.

Explain technical ideas in plain English. Be analytical, fair-minded, and complete. Do not add irrelevant sections to simple questions.`
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
     
    try {
      const chunks = [];
      for (let i = 0; i < reply.length; i += 3500) {
        chunks.push(reply.slice(i, i + 3500));
      }

      for (const chunk of chunks) {
        const telegramResponse = await fetch(
          `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: chatId,
              text: chunk
            })
          }
        );

        if (!telegramResponse.ok) {
          console.error(
            "Telegram sendMessage error:",
            await telegramResponse.text()
          );
        }
      }
    } catch (error) {
      console.error("Telegram connection error:", error);
    }

    return new Response("OK");
  }
};
