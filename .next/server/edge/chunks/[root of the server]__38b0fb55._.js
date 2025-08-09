(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["chunks/[root of the server]__38b0fb55._.js", {

"[externals]/node:async_hooks [external] (node:async_hooks, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}}),
"[externals]/node:buffer [external] (node:buffer, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}}),
"[project]/lib/constants.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// lib/constants.ts
__turbopack_context__.s({
    "AI_USERNAME": (()=>AI_USERNAME),
    "AI_USER_ID": (()=>AI_USER_ID)
});
const AI_USER_ID = "00000000-0000-0000-0000-00000000000a" // Example UUID for AI user
;
const AI_USERNAME = "real.AI";
}}),
"[project]/lib/db.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "addMessageReaction": (()=>addMessageReaction),
    "createFriendship": (()=>createFriendship),
    "createGroupChat": (()=>createGroupChat),
    "createMessage": (()=>createMessage),
    "createNotification": (()=>createNotification),
    "createUser": (()=>createUser),
    "db": (()=>db),
    "deleteGroupChat": (()=>deleteGroupChat),
    "getAcceptedFriends": (()=>getAcceptedFriends),
    "getFriendships": (()=>getFriendships),
    "getMessages": (()=>getMessages),
    "getOnlineUsers": (()=>getOnlineUsers),
    "getUnreadNotifications": (()=>getUnreadNotifications),
    "getUserById": (()=>getUserById),
    "getUserByUsername": (()=>getUserByUsername),
    "getUserDMs": (()=>getUserDMs),
    "getUserGroupChats": (()=>getUserGroupChats),
    "markNotificationAsRead": (()=>markNotificationAsRead),
    "query": (()=>query),
    "removeMessageReaction": (()=>removeMessageReaction),
    "searchUsers": (()=>searchUsers),
    "updateFriendshipStatus": (()=>updateFriendshipStatus),
    "updateUserActivity": (()=>updateUserActivity),
    "updateUserSettings": (()=>updateUserSettings)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/compiled/server-only/empty.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$1$2e$0$2e$1$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/@neondatabase+serverless@1.0.1/node_modules/@neondatabase/serverless/index.mjs [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/constants.ts [middleware-edge] (ecmascript)");
;
;
;
const sql = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f40$neondatabase$2b$serverless$40$1$2e$0$2e$1$2f$node_modules$2f40$neondatabase$2f$serverless$2f$index$2e$mjs__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["neon"])(process.env.DATABASE_URL);
const query = sql;
const db = sql;
async function createUser(username, passwordHash, signupCode) {
    try {
        let nameColor = null;
        const customTitle = null;
        let hasGoldAnimation = false;
        if (signupCode === "asdf") {
            nameColor = "#6366f1";
        } else if (signupCode === "qwea") {
            hasGoldAnimation = true;
        }
        const result = await sql`
      INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, email, last_active, theme, hue)
      VALUES (${username}, ${passwordHash}, ${signupCode}, ${nameColor}, ${hasGoldAnimation}, NULL, NOW(), 'light', 'blue')
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue, profile_picture, bio
    `;
        return result[0];
    } catch (err) {
        console.error("[db] createUser error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getUserByUsername(username) {
    try {
        const rows = await sql`
      SELECT *
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;
        return rows[0];
    } catch (err) {
        console.error("[db] getUserByUsername error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getUserById(id) {
    try {
        const result = await sql`
      SELECT id, username, email, signup_code, name_color, custom_title, has_gold_animation, 
             notifications_enabled, theme, hue, profile_picture, bio
      FROM users WHERE id = ${id}
    `;
        return result[0];
    } catch (err) {
        console.error("[db] getUserById error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function updateUserActivity(userId) {
    try {
        await sql`
      UPDATE users 
      SET last_active = NOW()
      WHERE id = ${userId}
    `;
        return true;
    } catch (err) {
        console.error("[db] updateUserActivity error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getOnlineUsers(currentUserId) {
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
      AND u.id != ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AI_USER_ID"]}
      ORDER BY u.username
    `;
        return result;
    } catch (err) {
        console.error("[db] getOnlineUsers error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function searchUsers(searchQuery, currentUserId) {
    try {
        const result = await sql`
      SELECT id, username, name_color, custom_title, has_gold_animation
      FROM users 
      WHERE username ILIKE ${`%${searchQuery}%`} 
      AND id != ${currentUserId}
      AND id != ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AI_USER_ID"]}
      LIMIT 10
    `;
        return result;
    } catch (err) {
        console.error("[db] searchUsers error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getMessages(chatType, chatId, userId, limit = 50) {
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
      `;
            return result.reverse();
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
      `;
            return result.reverse();
        } else if (chatType === "channel") {
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
        WHERE m.chat_type = 'channel' AND m.chat_id = ${chatId}
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${limit}
      `;
            return result.reverse();
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
      `;
            return result.reverse();
        }
    } catch (err) {
        console.error("[db] getMessages error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function createMessage(senderId, content, chatType, chatId, mentions = [], isAiResponse = false, parentMessageId, messageType = "text") {
    try {
        const result = await sql`
      INSERT INTO messages (sender_id, content, chat_type, chat_id, mentions, is_ai_response, parent_message_id, message_type)
      VALUES (${senderId}, ${content}, ${chatType}, ${chatId}, ${mentions}, ${isAiResponse}, ${parentMessageId}, ${messageType})
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] createMessage error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function createGroupChat(name, creatorId, memberIds = []) {
    try {
        const result = await sql`
      INSERT INTO group_chats (name, creator_id)
      VALUES (${name}, ${creatorId})
      RETURNING *
    `;
        await sql`
      INSERT INTO group_chat_members (group_chat_id, user_id)
      VALUES (${result[0].id}, ${creatorId})
    `;
        for (const memberId of memberIds){
            if (memberId !== creatorId) {
                await sql`
          INSERT INTO group_chat_members (group_chat_id, user_id)
          VALUES (${result[0].id}, ${memberId})
          ON CONFLICT (group_chat_id, user_id) DO NOTHING
        `;
            }
        }
        return result[0];
    } catch (err) {
        console.error("[db] createGroupChat error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getUserGroupChats(userId) {
    try {
        const result = await sql`
      SELECT gc.*, u.username as creator_username
      FROM group_chats gc
      JOIN group_chat_members gcm ON gc.id = gcm.group_chat_id
      JOIN users u ON gc.creator_id = u.id
      WHERE gcm.user_id = ${userId}
      ORDER BY gc.updated_at DESC
    `;
        return result;
    } catch (err) {
        console.error("[db] getUserGroupChats error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function deleteGroupChat(groupId, creatorId) {
    try {
        const chat = await sql`SELECT creator_id FROM group_chats WHERE id = ${groupId}`;
        if (!chat[0] || chat[0].creator_id !== creatorId) {
            throw new Error("Unauthorized to delete this group chat.");
        }
        await sql`BEGIN`;
        await sql`DELETE FROM messages WHERE chat_type = 'group' AND chat_id = ${groupId}`;
        await sql`DELETE FROM group_chat_members WHERE group_chat_id = ${groupId}`;
        await sql`DELETE FROM group_chats WHERE id = ${groupId}`;
        await sql`COMMIT`;
        return true;
    } catch (err) {
        await sql`ROLLBACK`;
        console.error("[db] deleteGroupChat error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function createFriendship(requesterId, addresseeId) {
    try {
        if (requesterId === addresseeId) {
            throw new Error("Cannot send friend request to yourself.");
        }
        const existing = await sql`
      SELECT * FROM friendships
      WHERE (requester_id = ${requesterId} AND addressee_id = ${addresseeId})
         OR (requester_id = ${addresseeId} AND addressee_id = ${requesterId})
      LIMIT 1
    `;
        if (existing.length > 0) {
            if (existing[0].status === "pending") {
                throw new Error("Friend request already pending.");
            } else if (existing[0].status === "accepted") {
                throw new Error("Already friends with this user.");
            } else if (existing[0].status === "blocked") {
                throw new Error("Cannot send request due to existing block.");
            }
        }
        const result = await sql`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (${requesterId}, ${addresseeId}, 'pending')
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] createFriendship error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function updateFriendshipStatus(friendshipId, status) {
    try {
        const result = await sql`
      UPDATE friendships 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${friendshipId}
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] updateFriendshipStatus error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getFriendships(userId) {
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
    `;
        return result;
    } catch (err) {
        console.error("[db] getFriendships error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getAcceptedFriends(userId) {
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
    `;
        return result;
    } catch (err) {
        console.error("[db] getAcceptedFriends error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getUserDMs(userId) {
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
      AND u.id != ${__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$constants$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["AI_USER_ID"]}
      GROUP BY friend_id, u.username, u.name_color, u.has_gold_animation
      ORDER BY last_message_at DESC
    `;
        return result;
    } catch (err) {
        console.error("[db] getUserDMs error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function createNotification(userId, title, message, chatType, chatId, senderUsername) {
    try {
        const result = await sql`
      INSERT INTO notifications (user_id, title, message, chat_type, chat_id, sender_username)
      VALUES (${userId}, ${title}, ${message}, ${chatType}, ${chatId}, ${senderUsername})
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] createNotification error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function getUnreadNotifications(userId) {
    try {
        const result = await sql`
      SELECT * FROM notifications
      WHERE user_id = ${userId} AND is_read = FALSE
      ORDER BY created_at DESC
    `;
        return result;
    } catch (err) {
        console.error("[db] getUnreadNotifications error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function markNotificationAsRead(notificationId, userId) {
    try {
        const result = await sql`
      UPDATE notifications
      SET is_read = TRUE, created_at = NOW()
      WHERE id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] markNotificationAsRead error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function addMessageReaction(messageId, userId, emoji) {
    try {
        const result = await sql`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${messageId}, ${userId}, ${emoji})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
      RETURNING *
    `;
        return result[0];
    } catch (err) {
        console.error("[db] addMessageReaction error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function removeMessageReaction(messageId, userId, emoji) {
    try {
        await sql`
      DELETE FROM message_reactions
      WHERE message_id = ${messageId}
        AND user_id   = ${userId}
        AND emoji     = ${emoji}
    `;
        return true;
    } catch (err) {
        console.error("[db] removeMessageReaction error:", err);
        throw new Error("Database error: " + err.message);
    }
}
async function updateUserSettings(userId, updates) {
    try {
        const allowedFields = [
            "custom_title",
            "name_color",
            "notifications_enabled",
            "theme",
            "hue"
        ];
        const validUpdates = {};
        for (const [key, value] of Object.entries(updates)){
            if (allowedFields.includes(key)) {
                validUpdates[key] = value;
            }
        }
        if (Object.keys(validUpdates).length === 0) {
            throw new Error("No valid fields to update");
        }
        const setClause = Object.keys(validUpdates).map((key, index)=>`${key} = $${index + 2}`).join(", ");
        const queryString = `
      UPDATE users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue, profile_picture, bio
    `;
        const params = [
            userId,
            ...Object.values(validUpdates)
        ];
        const result = await sql.unsafe(queryString, params);
        if (result.length === 0) {
            throw new Error("User not found or no settings updated.");
        }
        return result[0];
    } catch (err) {
        console.error("[db] updateUserSettings error:", err);
        throw new Error("Database error: " + err.message);
    }
}
}}),
"[project]/lib/auth.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "decrypt": (()=>decrypt),
    "encrypt": (()=>encrypt),
    "getCurrentUser": (()=>getCurrentUser),
    "hashPassword": (()=>hashPassword),
    "signIn": (()=>signIn),
    "signUp": (()=>signUp),
    "verifyToken": (()=>verifyToken)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jose$40$6$2e$0$2e$12$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jose@6.0.12/node_modules/jose/dist/webapi/jwt/sign.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jose$40$6$2e$0$2e$12$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/jose@6.0.12/node_modules/jose/dist/webapi/jwt/verify.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$headers$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/esm/api/headers.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/esm/server/request/cookies.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/db.ts [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$2$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/bcryptjs@3.0.2/node_modules/bcryptjs/index.js [middleware-edge] (ecmascript)");
;
;
;
;
const key = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key");
async function encrypt(payload) {
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jose$40$6$2e$0$2e$12$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: "HS256"
    }).setIssuedAt().setExpirationTime("24h").sign(key);
}
async function decrypt(input) {
    const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$jose$40$6$2e$0$2e$12$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["jwtVerify"])(input, key, {
        algorithms: [
            "HS256"
        ]
    });
    return payload;
}
async function verifyToken(token) {
    try {
        return await decrypt(token);
    } catch  {
        return null;
    }
}
async function getCurrentUser() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$request$2f$cookies$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["cookies"])();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;
    try {
        const payload = await decrypt(token);
        const users = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["query"]`SELECT * FROM users WHERE id = ${payload.userId}`;
        return users[0] || null;
    } catch  {
        return null;
    }
}
async function hashPassword(password) {
    return await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$2$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].hash(password, 12);
}
async function signUp(username, password, signupCode) {
    const hashedPassword = await hashPassword(password);
    // Set default values based on signup code
    let nameColor = null;
    let hasGoldAnimation = false;
    if (signupCode === "asdf") {
        nameColor = "#6366f1" // Default indigo color
        ;
    } else if (signupCode === "qwea") {
        hasGoldAnimation = true;
    }
    const users = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["query"]`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active)
    VALUES (${username}, ${hashedPassword}, ${signupCode || null}, ${nameColor}, ${hasGoldAnimation}, 'light', 'blue', false, NOW())
    RETURNING *
  `;
    const user = users[0];
    const token = await encrypt({
        userId: user.id
    });
    return {
        user,
        token
    };
}
async function signIn(username, password) {
    const users = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$db$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["query"]`SELECT * FROM users WHERE username = ${username}`;
    const user = users[0];
    if (!user) {
        throw new Error("Invalid username or password");
    }
    const isValid = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$bcryptjs$40$3$2e$0$2e$2$2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"].compare(password, user.password_hash);
    if (!isValid) {
        throw new Error("Invalid username or password");
    }
    const token = await encrypt({
        userId: user.id
    });
    return {
        user,
        token
    };
}
}}),
"[project]/middleware.ts [middleware-edge] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "config": (()=>config),
    "middleware": (()=>middleware)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.2.4_react-dom@19.0.0_react@19.0.0__react@19.0.0/node_modules/next/dist/esm/server/web/spec-extension/response.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/auth.ts [middleware-edge] (ecmascript)");
;
;
function middleware(request) {
    // Add console logs to trace the middleware execution
    console.log("[middleware] Request URL:", request.url);
    const { pathname } = request.nextUrl;
    console.log("[middleware] Pathname:", pathname);
    const token = request.cookies.get("auth-token")?.value;
    console.log("[middleware] Auth token found:", !!token);
    // Public routes that don't require authentication
    const publicRoutes = [
        "/auth",
        "/"
    ];
    const isPublicRoute = publicRoutes.includes(pathname);
    // If no token and trying to access protected route
    if (!token && !isPublicRoute) {
        console.log("[middleware] No token, redirecting to /auth");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/auth", request.url));
    }
    // If token exists, verify it
    if (token) {
        const decoded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$auth$2e$ts__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["verifyToken"])(token);
        console.log("[middleware] Token decoded:", !!decoded);
        // If token is invalid and trying to access protected route
        if (!decoded && !isPublicRoute) {
            console.log("[middleware] Invalid token, redirecting to /auth and deleting cookie.");
            const response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/auth", request.url));
            response.cookies.delete("auth-token");
            return response;
        }
        // If token is valid and trying to access auth page, redirect to dashboard
        if (decoded && pathname === "/auth") {
            console.log("[middleware] Token valid, on /auth page, redirecting to /dashboard.");
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL("/dashboard", request.url));
        }
        if (decoded && !isPublicRoute) {
            console.log("[middleware] Token valid, accessing protected route.");
        }
    }
    console.log("[middleware] Proceeding to next response.");
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$2$2e$4_react$2d$dom$40$19$2e$0$2e$0_react$40$19$2e$0$2e$0_$5f$react$40$19$2e$0$2e$0$2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$spec$2d$extension$2f$response$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next();
}
const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico).*)"
    ]
};
}}),
}]);

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__38b0fb55._.js.map