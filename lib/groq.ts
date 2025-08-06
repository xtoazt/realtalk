import { createGroq } from "@ai-sdk/groq"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateAIResponse(message: string, context?: string) {
  try {
    console.log("[groq] Generating AI response for message:", message.substring(0, 100))

    const systemPrompt = `You are real.AI, a helpful AI assistant in the chat app "real.". Keep responses concise, friendly, and conversational. You can help with general questions, provide information, or just chat casually. ${context ? `Context: ${context}` : ""}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || "Sorry, I could not generate a response."
    console.log("[groq] AI response generated successfully")
    return response
  } catch (error) {
    console.error("[groq] API error:", error)
    return "Sorry, I am currently unavailable. Please try again later."
  }
}
