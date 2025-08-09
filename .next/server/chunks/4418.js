exports.id=4418,exports.ids=[4418],exports.modules={13122:(e,r,a)=>{"use strict";a.a(e,async(e,s)=>{try{a.d(r,{HW:()=>_,Hh:()=>l,Jv:()=>N});var t=a(7994),o=a(75025),n=a(15886),i=a(19246),u=a(7673),d=e([i]);i=(d.then?(await d)():d)[0];let g=new TextEncoder().encode(process.env.JWT_SECRET||"fallback-secret-key");async function m(e){return await new t.P(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("24h").sign(g)}async function c(e){let{payload:r}=await (0,o.V)(e,g,{algorithms:["HS256"]});return r}async function _(){let e=await (0,n.UL)(),r=e.get("auth-token")?.value;if(!r)return null;try{let e=await c(r);return(await (0,i.P)`SELECT * FROM users WHERE id = ${e.userId}`)[0]||null}catch{return null}}async function E(e){return await u.Ay.hash(e,12)}async function l(e,r,a){let s=await E(r),t=null,o=!1;"asdf"===a?t="#6366f1":"qwea"===a&&(o=!0);let n=(await (0,i.P)`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active)
    VALUES (${e}, ${s}, ${a||null}, ${t}, ${o}, 'light', 'blue', false, NOW())
    RETURNING *
  `)[0],u=await m({userId:n.id});return{user:n,token:u}}async function N(e,r){let a=(await (0,i.P)`SELECT * FROM users WHERE username = ${e}`)[0];if(!a||!await u.Ay.compare(r,a.password_hash))throw Error("Invalid username or password");let s=await m({userId:a.id});return{user:a,token:s}}s()}catch(e){s(e)}})},19246:(e,r,a)=>{"use strict";a.a(e,async(e,s)=>{try{a.d(r,{BR:()=>p,Eu:()=>l,G_:()=>T,JE:()=>i,Nf:()=>L,P:()=>D,UI:()=>f,VL:()=>_,Y1:()=>I,db:()=>w,fU:()=>g,j_:()=>O,kl:()=>u,mJ:()=>S,mL:()=>N,oH:()=>E,qO:()=>m,s4:()=>R,uf:()=>d,x5:()=>c,yW:()=>h});var t=a(10762),o=a(72903),n=e([t]);t=(n.then?(await n)():n)[0];let $=(0,t.neon)(process.env.DATABASE_URL),D=$,w=$;async function i(e){try{return(await $`
      SELECT *
      FROM users
      WHERE username = ${e}
      LIMIT 1
    `)[0]}catch(e){throw console.error("[db] getUserByUsername error:",e),Error("Database error: "+e.message)}}async function u(e){try{return(await $`
      SELECT id, username, email, signup_code, name_color, custom_title, has_gold_animation, 
             notifications_enabled, theme, hue, profile_picture, bio
      FROM users WHERE id = ${e}
    `)[0]}catch(e){throw console.error("[db] getUserById error:",e),Error("Database error: "+e.message)}}async function d(e){try{return await $`
      UPDATE users 
      SET last_active = NOW()
      WHERE id = ${e}
    `,!0}catch(e){throw console.error("[db] updateUserActivity error:",e),Error("Database error: "+e.message)}}async function m(e){try{return await $`
      SELECT DISTINCT u.id, u.username, u.name_color, u.has_gold_animation, u.last_active
      FROM users u
      JOIN friendships f ON (
        (f.requester_id = ${e} AND f.addressee_id = u.id) OR
        (f.addressee_id = ${e} AND f.requester_id = u.id)
      )
      WHERE u.last_active > NOW() - INTERVAL '10 minutes'
      AND f.status = 'accepted'
      AND u.id != ${e}
      AND u.id != ${o.x}
      ORDER BY u.username
    `}catch(e){throw console.error("[db] getOnlineUsers error:",e),Error("Database error: "+e.message)}}async function c(e,r){try{return await $`
      SELECT id, username, name_color, custom_title, has_gold_animation
      FROM users 
      WHERE username ILIKE ${`%${e}%`} 
      AND id != ${r}
      AND id != ${o.x}
      LIMIT 10
    `}catch(e){throw console.error("[db] searchUsers error:",e),Error("Database error: "+e.message)}}async function _(e,r,a,s=50){try{if("global"===e)return(await $`
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
            BOOL_OR(user_id = ${a||null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = 'global'
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${s}
      `).reverse();if("dm"===e)return(await $`
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
            BOOL_OR(user_id = ${a||null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = 'dm' 
          AND ((m.sender_id = ${a} AND m.chat_id = ${r}) 
               OR (m.sender_id = ${r} AND m.chat_id = ${a}))
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${s}
      `).reverse();if("channel"===e)return(await $`
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
            BOOL_OR(user_id = ${a||null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = 'channel' AND m.chat_id = ${r}
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${s}
      `).reverse();else return(await $`
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
            BOOL_OR(user_id = ${a||null}) as user_reacted
          FROM message_reactions
          GROUP BY message_id, emoji
        ) mr ON m.id = mr.message_id
        LEFT JOIN messages pm ON m.parent_message_id = pm.id
        LEFT JOIN users pu ON pm.sender_id = pu.id
        WHERE m.chat_type = ${e} AND m.chat_id = ${r}
        GROUP BY m.id, u.username, u.name_color, u.custom_title, u.has_gold_animation, pm.content, pu.username
        ORDER BY m.created_at DESC
        LIMIT ${s}
      `).reverse()}catch(e){throw console.error("[db] getMessages error:",e),Error("Database error: "+e.message)}}async function E(e,r,a,s,t=[],o=!1,n,i="text"){try{return(await $`
      INSERT INTO messages (sender_id, content, chat_type, chat_id, mentions, is_ai_response, parent_message_id, message_type)
      VALUES (${e}, ${r}, ${a}, ${s}, ${t}, ${o}, ${n}, ${i})
      RETURNING *
    `)[0]}catch(e){throw console.error("[db] createMessage error:",e),Error("Database error: "+e.message)}}async function l(e,r,a=[]){try{let s=await $`
      INSERT INTO group_chats (name, creator_id)
      VALUES (${e}, ${r})
      RETURNING *
    `;for(let e of(await $`
      INSERT INTO group_chat_members (group_chat_id, user_id)
      VALUES (${s[0].id}, ${r})
    `,a))e!==r&&await $`
          INSERT INTO group_chat_members (group_chat_id, user_id)
          VALUES (${s[0].id}, ${e})
          ON CONFLICT (group_chat_id, user_id) DO NOTHING
        `;return s[0]}catch(e){throw console.error("[db] createGroupChat error:",e),Error("Database error: "+e.message)}}async function N(e){try{return await $`
      SELECT gc.*, u.username as creator_username
      FROM group_chats gc
      JOIN group_chat_members gcm ON gc.id = gcm.group_chat_id
      JOIN users u ON gc.creator_id = u.id
      WHERE gcm.user_id = ${e}
      ORDER BY gc.updated_at DESC
    `}catch(e){throw console.error("[db] getUserGroupChats error:",e),Error("Database error: "+e.message)}}async function g(e,r){try{let a=await $`SELECT creator_id FROM group_chats WHERE id = ${e}`;if(!a[0]||a[0].creator_id!==r)throw Error("Unauthorized to delete this group chat.");return await $`BEGIN`,await $`DELETE FROM messages WHERE chat_type = 'group' AND chat_id = ${e}`,await $`DELETE FROM group_chat_members WHERE group_chat_id = ${e}`,await $`DELETE FROM group_chats WHERE id = ${e}`,await $`COMMIT`,!0}catch(e){throw await $`ROLLBACK`,console.error("[db] deleteGroupChat error:",e),Error("Database error: "+e.message)}}async function O(e,r){try{if(e===r)throw Error("Cannot send friend request to yourself.");let a=await $`
      SELECT * FROM friendships
      WHERE (requester_id = ${e} AND addressee_id = ${r})
         OR (requester_id = ${r} AND addressee_id = ${e})
      LIMIT 1
    `;if(a.length>0){if("pending"===a[0].status)throw Error("Friend request already pending.");if("accepted"===a[0].status)throw Error("Already friends with this user.");if("blocked"===a[0].status)throw Error("Cannot send request due to existing block.")}return(await $`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (${e}, ${r}, 'pending')
      RETURNING *
    `)[0]}catch(e){throw console.error("[db] createFriendship error:",e),Error("Database error: "+e.message)}}async function h(e,r){try{return(await $`
      UPDATE friendships 
      SET status = ${r}, updated_at = NOW()
      WHERE id = ${e}
      RETURNING *
    `)[0]}catch(e){throw console.error("[db] updateFriendshipStatus error:",e),Error("Database error: "+e.message)}}async function R(e){try{return await $`
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
      WHERE (f.requester_id = ${e} OR f.addressee_id = ${e})
      ORDER BY f.created_at DESC
    `}catch(e){throw console.error("[db] getFriendships error:",e),Error("Database error: "+e.message)}}async function p(e){try{return await $`
      SELECT DISTINCT
        CASE 
          WHEN f.requester_id = ${e} THEN u2.id
          ELSE u1.id
        END as friend_id,
        CASE 
          WHEN f.requester_id = ${e} THEN u2.username
          ELSE u1.username
        END as friend_username,
        CASE 
          WHEN f.requester_id = ${e} THEN u2.name_color
          ELSE u1.name_color
        END as friend_name_color,
        CASE 
          WHEN f.requester_id = ${e} THEN u2.has_gold_animation
          ELSE u1.has_gold_animation
        END as friend_has_gold
      FROM friendships f
      JOIN users u1 ON f.requester_id = u1.id
      JOIN users u2 ON f.addressee_id = u2.id
      WHERE (f.requester_id = ${e} OR f.addressee_id = ${e})
      AND f.status = 'accepted'
      ORDER BY friend_username
    `}catch(e){throw console.error("[db] getAcceptedFriends error:",e),Error("Database error: "+e.message)}}async function T(e){try{return await $`
      SELECT DISTINCT
        CASE
          WHEN m.sender_id = ${e} THEN m.chat_id
          ELSE m.sender_id
        END as friend_id,
        u.username as friend_username,
        u.name_color as friend_name_color,
        u.has_gold_animation as friend_has_gold,
        MAX(m.created_at) as last_message_at
      FROM messages m
      JOIN users u ON 
        CASE
          WHEN m.sender_id = ${e} THEN m.chat_id
          ELSE m.sender_id
        END = u.id
      WHERE m.chat_type = 'dm' 
      AND (m.sender_id = ${e} OR m.chat_id = ${e})
      AND u.id != ${e}
      AND u.id != ${o.x}
      GROUP BY friend_id, u.username, u.name_color, u.has_gold_animation
      ORDER BY last_message_at DESC
    `}catch(e){throw console.error("[db] getUserDMs error:",e),Error("Database error: "+e.message)}}async function f(e,r,a,s,t,o){try{return(await $`
      INSERT INTO notifications (user_id, title, message, chat_type, chat_id, sender_username)
      VALUES (${e}, ${r}, ${a}, ${s}, ${t}, ${o})
      RETURNING *
    `)[0]}catch(e){throw console.error("[db] createNotification error:",e),Error("Database error: "+e.message)}}async function I(e,r,a){try{return(await $`
      INSERT INTO message_reactions (message_id, user_id, emoji)
      VALUES (${e}, ${r}, ${a})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
      RETURNING *
    `)[0]}catch(e){throw console.error("[db] addMessageReaction error:",e),Error("Database error: "+e.message)}}async function L(e,r,a){try{return await $`
      DELETE FROM message_reactions
      WHERE message_id = ${e}
        AND user_id   = ${r}
        AND emoji     = ${a}
    `,!0}catch(e){throw console.error("[db] removeMessageReaction error:",e),Error("Database error: "+e.message)}}async function S(e,r){try{let a=["custom_title","name_color","notifications_enabled","theme","hue"],s={};for(let[e,t]of Object.entries(r))a.includes(e)&&(s[e]=t);if(0===Object.keys(s).length)throw Error("No valid fields to update");let t=Object.keys(s).map((e,r)=>`${e} = $${r+2}`).join(", "),o=`
      UPDATE users 
      SET ${t}, updated_at = NOW()
      WHERE id = $1
      RETURNING id, username, email, signup_code, name_color, custom_title, has_gold_animation, notifications_enabled, theme, hue, profile_picture, bio
    `,n=[e,...Object.values(s)],i=await $.unsafe(o,n);if(0===i.length)throw Error("User not found or no settings updated.");return i[0]}catch(e){throw console.error("[db] updateUserSettings error:",e),Error("Database error: "+e.message)}}s()}catch(e){s(e)}})},30496:()=>{},43648:()=>{},72903:(e,r,a)=>{"use strict";a.d(r,{x:()=>s});let s="00000000-0000-0000-0000-00000000000a"}};