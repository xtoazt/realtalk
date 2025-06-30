import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createMessage, getMessages, getUserById, createNotification, getUserByUsername } from "@/lib/db"
import { generateAIResponse } from "@/lib/groq"
import { AI_USER_ID } from "@/lib/constants"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatType = searchParams.get("chatType") || "global"
    const chatId = searchParams.get("chatId")

    const messages = await getMessages(chatType, chatId, user.id)
    return NextResponse.json({ messages })
  } catch (error: any) {
    console.error("GET messages API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, chatType, chatId, parentMessageId } = await request.json()

    if (!content || !chatType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle dedicated AI chat - this is the separate AI chatbot
    if (chatType === "dm" && chatId === AI_USER_ID) {
      console.log("[messages-api] AI chat detected, creating user message and AI response")

      // Create user's message to AI
      await createMessage(user.id, content, chatType, chatId, [], false, parentMessageId)

      // Generate and send AI response with better context
      const aiContext = `You are real.AI, the helpful AI assistant for the real. chat app. 
      You're chatting directly with ${user.username}. Be friendly, helpful, and conversational. 
      Keep responses concise but informative. You can help with general questions, chat about topics, 
      or assist with using the real. app features.`

      const aiResponseContent = await generateAIResponse(content, aiContext)
      await createMessage(AI_USER_ID, aiResponseContent, chatType, user.id, [], true)

      return NextResponse.json({ success: true })
    }

    // Extract mentions for non-AI dedicated chats
    const mentions = content.match(/@(\w+)/g)?.map((mention: string) => mention.slice(1)) || []
    const hasAIMention = mentions.includes("ai") || mentions.includes("real.ai") || mentions.includes("realai")

    // Create user message
    const message = await createMessage(user.id, content, chatType, chatId, mentions, false, parentMessageId)

    // Handle DM notification for the recipient (if not AI chat)
    if (chatType === "dm" && chatId && chatId !== user.id && chatId !== AI_USER_ID) {
      const recipientUser = await getUserById(chatId)
      if (recipientUser && recipientUser.notifications_enabled) {
        await createNotification(
          recipientUser.id,
          `New DM from @${user.username}`,
          content,
          chatType,
          chatId,
          user.username,
        )
      }
    }

    // Handle notifications for mentions in group/global chats
    if (chatType !== "dm" && mentions.length > 0) {
      for (const mentionedUsername of mentions) {
        if (mentionedUsername === "ai" || mentionedUsername === "real.ai" || mentionedUsername === "realai") continue
        const mentionedUser = await getUserByUsername(mentionedUsername)
        if (mentionedUser && mentionedUser.id !== user.id && mentionedUser.notifications_enabled) {
          await createNotification(
            mentionedUser.id,
            `You were mentioned by @${user.username}`,
            content,
            chatType,
            chatId,
            user.username,
          )
        }
      }
    }

    // Generate AI response if mentioned in global/group chat (not dedicated AI chat)
    if (hasAIMention && (chatType === "global" || chatType === "group")) {
      console.log("[messages-api] AI mentioned in", chatType, "chat, generating response")

      const aiContext = `You are real.AI, responding to a mention in ${chatType} chat. 
      ${user.username} mentioned you. Be helpful and conversational. 
      Keep responses appropriate for public chat.`

      const aiResponseContent = await generateAIResponse(content, aiContext)
      await createMessage(AI_USER_ID, aiResponseContent, chatType, chatId, [], true)
    }

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error("POST messages API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
