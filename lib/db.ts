import "server-only"
import { neon } from "@neondatabase/serverless"
import { AI_USER_ID } from "@/lib/constants"

const sql = neon(process.env.DATABASE_URL!)

export const query = sql
export const db = sql

// Database helper functions
export async function createUser(username: string, passwordHash: string, signupCode?: string) {
  try {
    let nameColor = null
    const customTitle = null
    let hasGoldAnimation = false

    if (signupCode === "asdf") {
      nameColor = "#6366f1"
    } else if (signupCode === "qwea") {
      hasGoldAnimation = true
    }

    const result = await sql`
      INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, email, last_active, theme, hue)
      VALUES (${username}, ${passwordHash}, ${signupCode}, ${nameColor}, ${hasGoldAnimation}, NULL, NOW(), 'light', 'blue')
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue, profile_picture, bio
    `
    return result[0]
  } catch (err) {
    console.error("[db] createUser error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getUserByUsername(username: string) {
  try {
    const rows = await sql`
      SELECT *
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `
    return rows[0]
  } catch (err) {
    console.error("[db] getUserByUsername error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getUserById(id: string) {
  try {
    const result = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, has_gold_animation, 
             notifications_enabled, theme, hue, profile_picture, bio
      FROM users WHERE id = ${id}
    `
    return result[0]
  } catch (err) {
    console.error("[db] getUserById error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function updateUserActivity(userId: string) {
  try {
    await sql`
      UPDATE users 
      SET last_active = NOW()
      WHERE id = ${userId}
    `
    return true
  } catch (err) {
    console.error("[db] updateUserActivity error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getOnlineUsers(currentUserId: string) {
  try {
    const result = await sql`
      SELECT DISTINCT u.id, u.username, u.name_color, u.has_gold_animation, u.last_active
      FROM users u
      JOIN friendships f ON (
        (f.requester_id = ${currentUserId} AND f.addressee_id = u.id) OR
        (f.addressee_id = ${currentUserId} AND f.requester_id = u.id)
      )
      WHERE u.last_active > NOW() - INTERVAL '10 minutes'
      AND f.status = 'accepted'
      AND u.id != ${currentUserId}
      AND u.id != ${AI_USER_ID}
      ORDER BY u.username
    `
    return result
  } catch (err) {
    console.error("[db] getOnlineUsers error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function searchUsers(searchQuery: string, currentUserId: string) {
  try {
    const result = await sql`
      SELECT id, username, name_color, custom_title, has_gold_animation
      FROM users 
      WHERE username ILIKE ${`%${searchQuery}%`} 
      AND id != ${currentUserId}
      AND id != ${AI_USER_ID}
      LIMIT 10
    `
    return result
  } catch (err) {
    console.error("[db] searchUsers error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getMessages(chatType: string, chatId?: string, userId?: string, limit = 50) {
  try {
    if (chatType === "global") {
      const result = await sql`
        SELECT m.*, u.username, u.name_color, u.custom_title, u.has_gold_animation,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'emoji', mr.emoji,
                     'count', mr.reaction_count,
                     'reacted_by_me', CASE WHEN mr.user_reacted THEN true ELSE false END
                   )
                 ) FILTER (WHERE mr.emoji IS NOT NULL), 
                 '[]'::json
               ) as reactions,
               pm.content AS parent_message_content,
               pu.username AS parent_message_username
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN (
          SELECT 
            message_id,
            emoji,
            COUNT(*) as reaction_count,
            BOOL_OR(user_id = ${userId || null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = 'global'
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
      return result.reverse()
    } else if (chatType === "dm") {
      const result = await sql`
        SELECT m.*, u.username, u.name_color, u.custom_title, u.has_gold_animation,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'emoji', mr.emoji,
                     'count', mr.reaction_count,
                     'reacted_by_me', CASE WHEN mr.user_reacted THEN true ELSE false END
                   )
                 ) FILTER (WHERE mr.emoji IS NOT NULL), 
                 '[]'::json
               ) as reactions,
               pm.content AS parent_message_content,
               pu.username AS parent_message_username
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN (
          SELECT 
            message_id,
            emoji,
            COUNT(*) as reaction_count,
            BOOL_OR(user_id = ${userId || null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = 'dm' 
          AND ((m.sender_id = ${userId} AND m.chat_id = ${chatId}) 
               OR (m.sender_id = ${chatId} AND m.chat_id = ${userId}))
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
      return result.reverse()
    } else {
      const result = await sql`
        SELECT m.*, u.username, u.name_color, u.custom_title, u.has_gold_animation,
               COALESCE(
                 json_agg(
                   json_build_object(
                     'emoji', mr.emoji,
                     'count', mr.reaction_count,
                     'reacted_by_me', CASE WHEN mr.user_reacted THEN true ELSE false END
                   )
                 ) FILTER (WHERE mr.emoji IS NOT NULL), 
                 '[]'::json
               ) as reactions,
               pm.content AS parent_message_content,
               pu.username AS parent_message_username
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN (
          SELECT 
            message_id,
            emoji,
            COUNT(*) as reaction_count,
            BOOL_OR(user_id = ${userId || null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = ${chatType} AND m.chat_id = ${chatId}
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
      return result.reverse()
    }
  } catch (err) {
    console.error("[db] getMessages error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function createMessage(
  senderId: string,
  content: string,
  chatType: string,
  chatId?: string,
  mentions: string[] = [],
  isAiResponse = false,
  parentMessageId?: string,
  messageType = "text",
) {
  try {
    const result = await sql`
      INSERT INTO messages (sender_id, content, chat_type, chat_id, mentions, is_ai_response, parent_message_id, message_type)
      VALUES (${senderId}, ${content}, ${chatType}, ${chatId}, ${mentions}, ${isAiResponse}, ${parentMessageId}, ${messageType})
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createMessage error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function createGroupChat(name: string, creatorId: string, memberIds: string[] = []) {
  try {
    const result = await sql`
      INSERT INTO group_chats (name, creator_id)
      VALUES (${name}, ${creatorId})
      RETURNING *
    `

    await sql`
      INSERT INTO group_chat_members (group_chat_id, user_id)
      VALUES (${result[0].id}, ${creatorId})
    `

    for (const memberId of memberIds) {
      if (memberId !== creatorId) {
        await sql`
          INSERT INTO group_chat_members (group_chat_id, user_id)
          VALUES (${result[0].id}, ${memberId})
          ON CONFLICT (group_chat_id, user_id) DO NOTHING
        `
      }
    }

    return result[0]
  } catch (err) {
    console.error("[db] createGroupChat error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getUserGroupChats(userId: string) {
  try {
    const result = await sql`
      SELECT gc.*, u.username as creator_username
      FROM group_chats gc
      JOIN group_chat_members gcm ON gc.id = gcm.group_chat_id
      JOIN users u ON gc.creator_id = u.id
      WHERE gcm.user_id = ${userId}
      ORDER BY gc.updated_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getUserGroupChats error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function deleteGroupChat(groupId: string, creatorId: string) {
  try {
    const chat = await sql`SELECT creator_id FROM group_chats WHERE id = ${groupId}`
    if (!chat[0] || chat[0].creator_id !== creatorId) {
      throw new Error("Unauthorized to delete this group chat.")
    }

    await sql`BEGIN`
    await sql`DELETE FROM messages WHERE chat_type = 'group' AND chat_id = ${groupId}`
    await sql`DELETE FROM group_chat_members WHERE group_chat_id = ${groupId}`
    await sql`DELETE FROM group_chats WHERE id = ${groupId}`
    await sql`COMMIT`

    return true
  } catch (err) {
    await sql`ROLLBACK`
    console.error("[db] deleteGroupChat error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function createFriendship(requesterId: string, addresseeId: string) {
  try {
    if (requesterId === addresseeId) {
      throw new Error("Cannot send friend request to yourself.")
    }

    const existing = await sql`
      SELECT * FROM friendships
      WHERE (requester_id = ${requesterId} AND addressee_id = ${addresseeId})
         OR (requester_id = ${addresseeId} AND addressee_id = ${requesterId})
      LIMIT 1
    `

    if (existing.length > 0) {
      if (existing[0].status === "pending") {
        throw new Error("Friend request already pending.")
      } else if (existing[0].status === "accepted") {
        throw new Error("Already friends with this user.")
      } else if (existing[0].status === "blocked") {
        throw new Error("Cannot send request due to existing block.")
      }
    }

    const result = await sql`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (${requesterId}, ${addresseeId}, 'pending')
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createFriendship error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function updateFriendshipStatus(friendshipId: string, status: string) {
  try {
    const result = await sql`
      UPDATE friendships 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${friendshipId}
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] updateFriendshipStatus error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getFriendships(userId: string) {
  try {
    const result = await sql`
      SELECT f.*, 
             u1.username as requester_username,
             u2.username as addressee_username,
             u1.name_color as requester_name_color,
             u2.name_color as addressee_name_color,
             u1.has_gold_animation as requester_has_gold,
             u2.has_gold_animation as addressee_has_gold
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.id
      JOIN users u2 ON f.addressee_id = u2.id
      WHERE (f.requester_id = ${userId} OR f.addressee_id = ${userId})
      ORDER BY f.created_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getFriendships error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getAcceptedFriends(userId: string) {
  try {
    const result = await sql`
      SELECT DISTINCT
        CASE 
          WHEN f.requester_id = ${userId} THEN u2.id
          ELSE u1.id
        END as friend_id,
        CASE 
          WHEN f.requester_id = ${userId} THEN u2.username
          ELSE u1.username
        END as friend_username,
        CASE 
          WHEN f.requester_id = ${userId} THEN u2.name_color
          ELSE u1.name_color
        END as friend_name_color,
        CASE 
          WHEN f.requester_id = ${userId} THEN u2.has_gold_animation
          ELSE u1.has_gold_animation
        END as friend_has_gold
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.id
      JOIN users u2 ON f.addressee_id = u2.id
      WHERE (f.requester_id = ${userId} OR f.addressee_id = ${userId})
      AND f.status = 'accepted'
      ORDER BY friend_username
    `
    return result
  } catch (err) {
    console.error("[db] getAcceptedFriends error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getUserDMs(userId: string) {
  try {
    const result = await sql`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = ${userId} THEN m.chat_id
          ELSE m.sender_id
        END as friend_id,
        u.username as friend_username,
        u.name_color as friend_name_color,
        u.has_gold_animation as friend_has_gold,
        MAX(m.created_at) as last_message_at
      FROM messages m
      JOIN users u ON 
        CASE
          WHEN m.sender_id = ${userId} THEN m.chat_id
          ELSE m.sender_id
        END = u.id
      WHERE m.chat_type = 'dm' 
      AND (m.sender_id = ${userId} OR m.chat_id = ${userId})
      AND u.id != ${userId}
      AND u.id != ${AI_USER_ID}
      GROUP BY friend_id, u.username, u.name_color, u.has_gold_animation
      ORDER BY last_message_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getUserDMs error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  chatType?: string,
  chatId?: string,
  senderUsername?: string,
) {
  try {
    const result = await sql`
      INSERT INTO notifications (user_id, title, message, chat_type, chat_id, sender_username)
      VALUES (${userId}, ${title}, ${message}, ${chatType}, ${chatId}, ${senderUsername})
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createNotification error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const result = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId} AND is_read = FALSE
      ORDER BY created_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getUnreadNotifications error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const result = await sql`
      UPDATE notifications
      SET is_read = TRUE, created_at = NOW()
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] markNotificationAsRead error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function addMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    const result = await sql`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${messageId}, ${userId}, ${emoji})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] addMessageReaction error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    await sql`
      DELETE FROM message_reactions
      WHERE message_id = ${messageId}
        AND user_id   = ${userId}
        AND emoji     = ${emoji}
    `
    return true
  } catch (err) {
    console.error("[db] removeMessageReaction error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}

export async function updateUserSettings(userId: string, updates: any) {
  try {
    const allowedFields = ["custom_title", "name_color", "notifications_enabled", "theme", "hue"]
    const validUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      throw new Error("No valid fields to update")
    }

    const setClause = Object.keys(validUpdates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const queryString = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue, profile_picture, bio
    `

    const params = [userId, ...Object.values(validUpdates)]
    const result = await sql.unsafe(queryString, params)

    if (result.length === 0) {
      throw new Error("User not found or no settings updated.")
    }

    return result[0]
  } catch (err) {
    console.error("[db] updateUserSettings error:", err)
    throw new Error("Database error: " + (err as Error).message)
  }
}
