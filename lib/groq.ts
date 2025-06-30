import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function generateAIResponse(message: string, context?: string) {
  try {
    const systemPrompt = `You are a helpful AI assistant in a chat app called "real.". Keep responses concise and friendly. ${context ? `Context: ${context}` : ""}`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 500,
    })

    return completion.choices[0]?.message?.content || "Sorry, I could not generate a response."
  } catch (error) {
    console.error("Groq API error:", error)
    return "Sorry, I am currently unavailable. Please try again later."
  }
}
