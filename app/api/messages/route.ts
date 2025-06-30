import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { createMessage, getMessages, getUserById, createNotification, getUserByUsername } from "@/lib/db"
import { generateAIResponse } from "@/lib/groq"
import { AI_USER_ID, AI_USERNAME } from "@/lib/constants" // Import AI constants

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const chatType = searchParams.get("chatType") || "global"
    const chatId = searchParams.get("chatId")

    const messages = await getMessages(chatType, chatId)
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

    const { content, chatType, chatId } = await request.json()

    if (!content || !chatType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Handle dedicated AI chat
    if (chatType === "dm" && chatId === AI_USER_ID) {
      // Create user's message to AI
      await createMessage(user.id, content, chatType, chatId, [], false)

      // Generate and send AI response
      const aiResponseContent = await generateAIResponse(content, `User ${user.username} is chatting with you.`)
      await createMessage(AI_USER_ID, aiResponseContent, chatType, user.id, [], true) // AI sends to user
      return NextResponse.json({ success: true })
    }

    // Extract mentions for non-AI dedicated chats
    const mentions = content.match(/@(\w+)/g)?.map((mention: string) => mention.slice(1)) || []
    const hasAIMention = mentions.includes("ai") || mentions.includes(AI_USERNAME.toLowerCase()) // Check for "real.ai" mention

    // Create user message
    const message = await createMessage(user.id, content, chatType, chatId, mentions)

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
        if (mentionedUsername === "ai" || mentionedUsername === AI_USERNAME.toLowerCase()) continue // AI handled separately
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

    // Generate AI response if mentioned in non-dedicated AI chat
    if (hasAIMention && chatType !== "dm" && chatId !== AI_USER_ID) {
      const aiResponseContent = await generateAIResponse(
        content,
        `User ${user.username} mentioned you in ${chatType} chat`,
      )
      await createMessage(AI_USER_ID, aiResponseContent, chatType, chatId, [], true)
    }

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error("POST messages API error:", error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
