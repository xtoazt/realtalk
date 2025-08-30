"use strict";(()=>{var e={};e.id=3857,e.ids=[3857],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13122:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.d(t,{HW:()=>p,Hh:()=>h,Jv:()=>g});var a=r(7994),n=r(75025),o=r(15886),u=r(19246),i=r(7673),c=e([u]);u=(c.then?(await c)():c)[0];let w=new TextEncoder().encode(process.env.JWT_SECRET||"fallback-secret-key");async function l(e){return await new a.P(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("24h").sign(w)}async function d(e){let{payload:t}=await (0,n.V)(e,w,{algorithms:["HS256"]});return t}async function p(){let e=await (0,o.UL)(),t=e.get("auth-token")?.value;if(console.log("[auth] getCurrentUser called, token exists:",!!t),!t)return console.log("[auth] No auth token found"),null;try{let e=await d(t);console.log("[auth] Token decrypted successfully, userId:",e.userId);let r=(await (0,u.P)`SELECT * FROM users WHERE id = ${e.userId}`)[0]||null;return console.log("[auth] User found:",!!r),r}catch(e){return console.error("[auth] Error getting current user:",e),null}}async function m(e){return await i.Ay.hash(e,12)}async function h(e,t,r){let s=await m(t),a=null,n=!1;"asdf"===r?a="#6366f1":"qwea"===r&&(n=!0);let o=(await (0,u.P)`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active, ui_mode)
    VALUES (${e}, ${s}, ${r||null}, ${a}, ${n}, 'light', 'blue', false, NOW(), 'full')
    RETURNING *
  `)[0],i=await l({userId:o.id});return{user:o,token:i}}async function g(e,t){let r=(await (0,u.P)`SELECT * FROM users WHERE username = ${e}`)[0];if(!r||!await i.Ay.compare(t,r.password_hash))throw Error("Invalid username or password");let s=await l({userId:r.id});return{user:r,token:s}}s()}catch(e){s(e)}})},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},37818:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{GET:()=>i});var a=r(10949),n=r(13122),o=r(19246),u=e([n,o]);async function i(e){try{let t=await (0,n.HW)();if(!t)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:r}=new URL(e.url),s=r.get("q");if(!s||s.trim().length<2)return a.NextResponse.json({messages:[]});let u=await (0,o.P)`
      SELECT m.id, m.content, m.chat_type, m.chat_id, m.message_type, m.created_at,
             u.username, u.name_color, u.has_gold_animation
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (
        -- Global messages (everyone can see)
        m.chat_type = 'global'
        OR
        -- DM messages where user is involved
        (m.chat_type = 'dm' AND (m.sender_id = ${t.id} OR m.chat_id = ${t.id}))
        OR
        -- Group messages where user is a member
        (m.chat_type = 'group' AND m.chat_id IN (
          SELECT group_chat_id FROM group_chat_members WHERE user_id = ${t.id}
        ))
      )
      AND (
        m.content ILIKE ${`%${s.trim()}%`}
        OR u.username ILIKE ${`%${s.trim()}%`}
      )
      ORDER BY m.created_at DESC
      LIMIT 50
    `;return a.NextResponse.json({messages:u})}catch(e){return console.error("Search messages API error:",e.message),a.NextResponse.json({error:e.message},{status:500})}}[n,o]=u.then?(await u)():u,s()}catch(e){s(e)}})},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},89942:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{patchFetch:()=>c,routeModule:()=>l,serverHooks:()=>m,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>p});var a=r(36044),n=r(63409),o=r(9576),u=r(37818),i=e([u]);u=(i.then?(await i)():i)[0];let l=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/messages/search/route",pathname:"/api/messages/search",filename:"route",bundlePath:"app/api/messages/search/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/messages/search/route.ts",nextConfigOutput:"",userland:u}),{workAsyncStorage:d,workUnitAsyncStorage:p,serverHooks:m}=l;function c(){return(0,o.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:p})}s()}catch(e){s(e)}})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[7095,2920,5886,1854,5950],()=>r(89942));module.exports=s})();