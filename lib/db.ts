/** ----------------------------------------------------------------
 * lib/db.ts  –  fault-tolerant Neon initialiser + fast-fail URL check
 * ----------------------------------------------------------------*/
import "server-only"
import { neon, neonConfig, type NeonQueryFunction } from "@neondatabase/serverless"
import { AI_USER_ID } from "@/lib/constants" // Import AI_USER_ID

/*------------------------------------------------------------------
 * 0 • Pretty log helpers
 * ----------------------------------------------------------------*/
const cyan = (x: string) => `\x1b[36m${x}\x1b[0m`
const yellow = (x: string) => `\x1b[33m${x}\x1b[0m`
const red = (x: string) => `\x1b[31m${x}\x1b[0m`
const log = (...msg: any[]) => console.log(cyan("[db]"), ...msg)
const warn = (...msg: any[]) => console.warn(yellow("[db]"), ...msg)
const err = (...msg: any[]) => console.error(red("[db]"), ...msg)

// ---- 0·1  Disable the global fetch connection cache  -----------------
neonConfig.fetchConnectionCache = false // ← critical: prevents stale sockets

/*------------------------------------------------------------------
 * 1 • Pick the first Postgres URL we can find
 * ----------------------------------------------------------------*/
function pickUrl(): string {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
    process.env.POSTGRES_URL_NO_SSL,
    process.env.POSTGRES_PRISMA_URL,
  ].filter(Boolean) as string[]

  if (candidates.length === 0) {
    throw new Error(
      "No Postgres connection string found. \n" +
        "Add DATABASE_URL (or POSTGRES_URL…) in Vercel → Settings → Environment Variables.",
    )
  }

  // use the shortest – avoids accidentally choosing prisma-style pooling URLs first
  const picked = candidates.sort((a, b) => a.length - b.length)[0]!.trim()

  if (!picked.startsWith("postgres://")) {
    throw new Error(
      `Postgres URL looks wrong: “${picked.slice(0, 40)}…”.\n` + "Neon HTTP URLs must start with postgres://",
    )
  }

  return picked
}

/*------------------------------------------------------------------
 * 2 • Bootstrap Neon client with fetch-cache
 * ----------------------------------------------------------------*/
let sqlClient: NeonQueryFunction<any[]>

function init() {
  log("Initialising Neon client …")
  sqlClient = neon(pickUrl())
  log("Neon client ready.")
}
init()

/*------------------------------------------------------------------
 * 3 • Run a 1-row “SELECT 1;” the very first time we import this file
 *    so we explode early if the URL / network is broken.
 * ----------------------------------------------------------------*/
;(async () => {
  try {
    await sqlClient`SELECT 1`
    log("Startup check ✅  database reachable.")
  } catch (e: any) {
    err("Startup check ❌  could not reach database →", e.message)
    throw new Error("Neon connection failed on cold-start. \n" + "Check DATABASE_URL and your network egress.")
  }
})()

/*------------------------------------------------------------------
 * 4 • Query wrapper with one reconnect-retry on fetch errors
 * ----------------------------------------------------------------*/
export async function query<T = any>(strings: TemplateStringsArray | string, ...params: any[]): Promise<T[]> {
  const MAX = 1
  for (let i = 0; i <= MAX; i++) {
    try {
      // @ts-ignore – same signature as the tagged template
      return await (sqlClient as any)(strings, ...params)
    } catch (e: any) {
      const fetchFail = e instanceof TypeError && /fetch/i.test(e.message || "")

      if (fetchFail && i < MAX) {
        warn("Stale HTTP socket – creating a NEW Neon client and retrying…")
        init() // ← creates a brand-new client each time
        continue
      }

      err("Query failed →", e)
      throw new Error("Error connecting to database: " + e.message)
    }
  }
  throw new Error("Unreachable")
}

// Re-export sqlClient for direct access to methods like .unsafe
export const sql = sqlClient

/* ---------- Existing helper functions ----------
   Everything below is unchanged *except* that they
   now call the new `query` wrapper instead of the raw one.
----------------------------------------------- */

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
  const rows = await query`
    SELECT *
    FROM users
    WHERE username = ${username}
    LIMIT 1
  `
  return rows[0]
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

export async function searchUsers(query: string, currentUserId: string) {
  try {
    const result = await query`
      SELECT id, username, name_color, custom_title, has_gold_animation
      FROM users 
      WHERE username ILIKE ${`%${query}%`} AND id != ${currentUserId}
      LIMIT 10
    `
    return result
  } catch (err) {
    console.error("[db] searchUsers error:", err)
    throw new Error("Error connecting to database: " + (err as Error).message)
  }
}

export async function getMessages(chatType: string, chatId?: string, limit = 50) {
  try {
    let result
    if (chatType === "global") {
      result = await query`
        SELECT m.*, u.username, u.name_color, u.custom_title, u.has_gold_animation
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_type = 'global'
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `
    } else {
      result = await query`
        SELECT m.*, u.username, u.name_color, u.custom_title, u.has_gold_animation
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.chat_type = ${chatType} AND m.chat_id = ${chatId}
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
) {
  try {
    const result = await query`
      INSERT INTO messages (sender_id, content, chat_type, chat_id, mentions, is_ai_response)
      VALUES (${senderId}, ${content}, ${chatType}, ${chatId}, ${mentions}, ${isAiResponse})
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
