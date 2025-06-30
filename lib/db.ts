/** ----------------------------------------------------------------
 * lib/db.ts  –  robust Neon initialiser with SSL & WebSocket fallbacks
 * ----------------------------------------------------------------*/
import "server-only"
import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless"
import { AI_USER_ID } from "@/lib/constants" // Import AI_USER_ID

/*------------------------------------------------------------------
 * 0 • Pretty log helpers
 * ----------------------------------------------------------------*/
const c = (clr: string) => (txt: string) => `\x1b[${clr}m${txt}\x1b[0m`
const info = (...m: any[]) => console.log(c("36")("[db]"), ...m)
const warn = (...m: any[]) => console.warn(c("33")("[db]"), ...m)
const err = (...m: any[]) => console.error(c("31")("[db]"), ...m)

/*------------------------------------------------------------------
 * 1 • Pick & normalise a Postgres URL
 * ----------------------------------------------------------------*/
function pickUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL_NO_SSL,
    process.env.POSTGRES_PRISMA_URL,
  ].filter(Boolean) as string[]

  if (candidates.length === 0)
    throw new Error(
      "No Postgres connection string found.\n" +
        "Add DATABASE_URL in Vercel → Project → Settings → Environment Variables.",
    )

  let url = candidates.sort((a, b) => a.length - b.length)[0]!.trim()

  if (!url.startsWith("postgres://"))
    throw new Error(
      `Postgres URL looks wrong: "${url.slice(0, 40)}…".\n` + "Neon HTTP URLs must start with postgres://",
    )

  /* Ensure ssl + connection_limit params (Neon's HTTP driver needs them) */
  const u = new URL(url)
  u.searchParams.set("sslmode", "require")
  if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "1")
  url = u.toString()

  info("Using database host:", c("35")(u.host))
  return url
}

/*------------------------------------------------------------------
 * 2 • Web-Socket fallback (for local/preview envs w/o HTTPS egress)
 * ----------------------------------------------------------------*/
if (process.env.NEON_WS_PROXY) {
  neonConfig.wsProxy = (host) => `${process.env.NEON_WS_PROXY.replace(/\/$/g, "")}/v1/${host}`
  info("WS proxy enabled →", process.env.NEON_WS_PROXY)
}

/* Disable stale socket cache – gives us fresh HTTPS each retry */
neonConfig.fetchConnectionCache = false

/*------------------------------------------------------------------
 * 3 • Initialise client (lives in a global to survive Next.js HMR)
 * ----------------------------------------------------------------*/
const g = globalThis as unknown as { __sql?: NeonQueryFunction<any[]> }
if (!g.__sql) {
  info("Initialising Neon client …")
  g.__sql = neon(pickUrl())
}
export const sql = g.__sql!

/*------------------------------------------------------------------
 * 4 • Resilient query() helper
 * ----------------------------------------------------------------*/
export async function query<T = any>(strings: TemplateStringsArray | string, ...params: any[]): Promise<T[]> {
  const MAX_RETRIES = 5
  let delay = 250 /* ms */

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // @ts-ignore – same tagged-template signature
      return await (sql as any)(strings, ...params)
    } catch (e: any) {
      const fetchFail = e instanceof TypeError && /fetch/i.test(e.message || "")
      if (fetchFail && attempt < MAX_RETRIES) {
        warn(`Fetch failed (attempt ${attempt + 1}/${MAX_RETRIES}) – retrying in ${delay} ms …`)
        await new Promise((r) => setTimeout(r, delay))
        delay *= 2
        /* fresh client each time (sidesteps stale DNS / keep-alive sockets) */
        g.__sql = neon(pickUrl())
        continue
      }
      err("Query failed →", e)
      throw new Error("Error connecting to database: " + e.message)
    }
  }
  throw new Error("Database unreachable after multiple retries.")
}
/*------------------------------------------------------------------
 * 5 • Cold-start health check (fail fast during build / first request)
 * ----------------------------------------------------------------*/
;(async () => {
  try {
    await sql`SELECT 1`
    info("Startup check ✅  database reachable.")
  } catch (e: any) {
    err("Startup check ❌  could not reach database →", e.message)
    throw e
  }
})()

/*───────────────────────────────────────────────────────────────────────────┐
│ 6.  Database helper functions                                             │
└───────────────────────────────────────────────────────────────────────────*/

export async function createUser(username: string, passwordHash: string, signupCode?: string) {
  try {
    let nameColor = null
    const customTitle = null
    let hasGoldAnimation = false

    if (signupCode === "asdf") {
      nameColor = "#6366f1" // Default indigo color, user can change later
    } else if (signupCode === "qwer") {
      hasGoldAnimation = true
    }

    const result = await query`
      INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, email)
      VALUES (${username}, ${passwordHash}, ${signupCode}, ${nameColor}, ${hasGoldAnimation}, NULL)
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme
    `
    return result[0]
  } catch (err) {
    console.error("[db] createUser error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getUserByUsername(username: string) {
  try {
    const rows = await query`
      SELECT *
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `
    return rows[0]
  } catch (err) {
    console.error("[db] getUserByUsername error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getUserById(id: string) {
  try {
    const result = await query`
      SELECT id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme
      FROM users WHERE id = ${id}
    `
    return result[0]
  } catch (err) {
    console.error("[db] getUserById error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function searchUsers(searchQuery: string, currentUserId: string) {
  try {
    const result = await query`
      SELECT id, username, name_color, custom_title, has_gold_animation
      FROM users 
      WHERE username ILIKE ${`%${searchQuery}%`} AND id != ${currentUserId}
      LIMIT 10
    `
    return result
  } catch (err) {
    console.error("[db] searchUsers error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getMessages(chatType: string, chatId?: string, userId?: string, limit = 50) {
  try {
    let result
    if (chatType === "global") {
      result = await query`
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
               ) as reactions
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN (
          SELECT 
            message_id,
            emoji,
            COUNT(*) as reaction_count,
            BOOL_OR(user_id = ${userId || "NULL"}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        WHERE m.chat_type = 'global'
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
    } else {
      result = await query`
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
               ) as reactions
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        LEFT JOIN (
          SELECT 
            message_id,
            emoji,
            COUNT(*) as reaction_count,
            BOOL_OR(user_id = ${userId || "NULL"}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        WHERE m.chat_type = ${chatType} AND m.chat_id = ${chatId}
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
    }
    return result.reverse() // Return in chronological order
  } catch (err) {
    console.error("[db] getMessages error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
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
) {
  try {
    const result = await query`
      INSERT INTO messages (sender_id, content, chat_type, chat_id, mentions, is_ai_response, parent_message_id)
      VALUES (${senderId}, ${content}, ${chatType}, ${chatId}, ${mentions}, ${isAiResponse}, ${parentMessageId})
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createMessage error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function createGroupChat(name: string, creatorId: string, memberIds: string[] = []) {
  try {
    const result = await query`
      INSERT INTO group_chats (name, creator_id)
      VALUES (${name}, ${creatorId})
      RETURNING *
    `

    // Add creator as member
    await query`
      INSERT INTO group_chat_members (group_chat_id, user_id)
      VALUES (${result[0].id}, ${creatorId})
    `

    // Add selected members
    for (const memberId of memberIds) {
      if (memberId !== creatorId) {
        await query`
          INSERT INTO group_chat_members (group_chat_id, user_id)
          VALUES (${result[0].id}, ${memberId})
          ON CONFLICT (group_chat_id, user_id) DO NOTHING
        `
      }
    }

    return result[0]
  } catch (err) {
    console.error("[db] createGroupChat error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getUserGroupChats(userId: string) {
  try {
    const result = await query`
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
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function createFriendship(requesterId: string, addresseeId: string) {
  try {
    // Prevent self-friending
    if (requesterId === addresseeId) {
      throw new Error("Cannot send friend request to yourself.")
    }

    // Check for existing pending/accepted request in either direction
    const existing = await query`
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

    const result = await query`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (${requesterId}, ${addresseeId}, 'pending')
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createFriendship error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function updateFriendshipStatus(friendshipId: string, status: string) {
  try {
    const result = await query`
      UPDATE friendships 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${friendshipId}
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] updateFriendshipStatus error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getFriendships(userId: string) {
  try {
    const result = await query`
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
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getAcceptedFriends(userId: string) {
  try {
    const result = await query`
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
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getUserDMs(userId: string) {
  try {
    const result = await query`
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
      AND u.id != ${userId} -- Exclude self in DMs list
      AND u.id != ${AI_USER_ID} -- Exclude AI from DMs list
      GROUP BY friend_id, u.username, u.name_color, u.has_gold_animation
      ORDER BY last_message_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getUserDMs error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
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
    const result = await query`
      INSERT INTO notifications (user_id, title, message, chat_type, chat_id, sender_username)
      VALUES (${userId}, ${title}, ${message}, ${chatType}, ${chatId}, ${senderUsername})
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] createNotification error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getUnreadNotifications(userId: string) {
  try {
    const result = await query`
      SELECT * FROM notifications
      WHERE user_id = ${userId} AND is_read = FALSE
      ORDER BY created_at DESC
    `
    return result
  } catch (err) {
    console.error("[db] getUnreadNotifications error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    const result = await query`
      UPDATE notifications
      SET is_read = TRUE, created_at = NOW() -- Using created_at for updated_at-like functionality for simplicity
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] markNotificationAsRead error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

/*───────────────────────────────────────────────────────────────┐
│  Reactions helpers                                            │
└───────────────────────────────────────────────────────────────*/
export async function addMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    const result = await query`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${messageId}, ${userId}, ${emoji})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
      RETURNING *
    `
    return result[0]
  } catch (err) {
    console.error("[db] addMessageReaction error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function removeMessageReaction(messageId: string, userId: string, emoji: string) {
  try {
    await query`
      DELETE FROM message_reactions
      WHERE message_id = ${messageId}
        AND user_id   = ${userId}
        AND emoji     = ${emoji}
    `
    return true
  } catch (err) {
    console.error("[db] removeMessageReaction error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function updateUserSettings(userId: string, updates: any) {
  try {
    const allowedFields = ["custom_title", "name_color", "notifications_enabled", "theme"]
    const validUpdates: any = {}

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        validUpdates[key] = value
      }
    }

    if (Object.keys(validUpdates).length === 0) {
      throw new Error("No valid fields to update")
    }

    const setParts: string[] = []
    const params: any[] = [userId] // First parameter is userId for WHERE clause
    let paramIndex = 2 // Start indexing for dynamic SET values from $2

    for (const key of Object.keys(validUpdates)) {
      setParts.push(`${key} = $${paramIndex}`)
      params.push(validUpdates[key])
      paramIndex++
    }
    const setClause = setParts.join(", ")

    const queryString = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme
    `

    // Execute the query using sql.unsafe directly
    const result = await sql.unsafe(queryString, params)

    return result[0]
  } catch (err) {
    console.error("[db] updateUserSettings error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}
