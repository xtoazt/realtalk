import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateAIResponse(messages: Array<{ role: string; content: string }>) {
  try {
    console.log("[groq] Generating AI response with messages:", messages.length)

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant in a chat application. Be friendly, concise, and helpful. Keep responses under 200 words unless specifically asked for longer content.",
        },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        })),
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response."
    console.log("[groq] Generated response:", response.substring(0, 100) + "...")

    return response
  } catch (error) {
    console.error("[groq] Error generating AI response:", error)
    return "I'm sorry, I'm having trouble responding right now. Please try again later."
  }
}
