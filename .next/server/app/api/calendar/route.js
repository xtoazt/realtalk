"use strict";(()=>{var e={};e.id=1948,e.ids=[1948],e.modules={1070:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{patchFetch:()=>d,routeModule:()=>c,serverHooks:()=>E,workAsyncStorage:()=>l,workUnitAsyncStorage:()=>p});var s=r(36044),n=r(63409),i=r(9576),o=r(57313),u=e([o]);o=(u.then?(await u)():u)[0];let c=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/calendar/route",pathname:"/api/calendar",filename:"route",bundlePath:"app/api/calendar/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/calendar/route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:l,workUnitAsyncStorage:p,serverHooks:E}=c;function d(){return(0,i.patchFetch)({workAsyncStorage:l,workUnitAsyncStorage:p})}a()}catch(e){a(e)}})},3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13122:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.d(t,{HW:()=>p,Hh:()=>w,Jv:()=>h});var s=r(7994),n=r(75025),i=r(15886),o=r(19246),u=r(7673),d=e([o]);o=(d.then?(await d)():d)[0];let _=new TextEncoder().encode(process.env.JWT_SECRET||"fallback-secret-key");async function c(e){return await new s.P(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("24h").sign(_)}async function l(e){let{payload:t}=await (0,n.V)(e,_,{algorithms:["HS256"]});return t}async function p(){let e=await (0,i.UL)(),t=e.get("auth-token")?.value;if(console.log("[auth] getCurrentUser called, token exists:",!!t),!t)return console.log("[auth] No auth token found"),null;try{let e=await l(t);console.log("[auth] Token decrypted successfully, userId:",e.userId);let r=(await (0,o.P)`SELECT * FROM users WHERE id = ${e.userId}`)[0]||null;return console.log("[auth] User found:",!!r),r}catch(e){return console.error("[auth] Error getting current user:",e),null}}async function E(e){return await u.Ay.hash(e,12)}async function w(e,t,r){let a=await E(t),s=null,n=!1;"asdf"===r?s="#6366f1":"qwea"===r&&(n=!0);let i=(await (0,o.P)`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active, ui_mode)
    VALUES (${e}, ${a}, ${r||null}, ${s}, ${n}, 'light', 'blue', false, NOW(), 'full')
    RETURNING *
  `)[0],u=await c({userId:i.id});return{user:i,token:u}}async function h(e,t){let r=(await (0,o.P)`SELECT * FROM users WHERE username = ${e}`)[0];if(!r||!await u.Ay.compare(t,r.password_hash))throw Error("Invalid username or password");let a=await c({userId:r.id});return{user:r,token:a}}a()}catch(e){a(e)}})},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},57313:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{GET:()=>u,POST:()=>d});var s=r(10949),n=r(13122),i=r(19246),o=e([n,i]);async function u(){try{let e=await (0,n.HW)();if(!e)return s.NextResponse.json({error:"Unauthorized"},{status:401});let t=await (0,i.P)`
      SELECT DISTINCT e.*, u.username as creator_username
      FROM calendar_events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.creator_id = ${e.id}
         OR e.id IN (
           SELECT event_id FROM calendar_participants WHERE user_id = ${e.id}
         )
      ORDER BY e.start_time ASC
    `,r=await Promise.all(t.map(async e=>{let t=await (0,i.P)`
          SELECT cp.user_id, cp.status, u.username
          FROM calendar_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.event_id = ${e.id}
        `;return{...e,participants:t}}));return s.NextResponse.json({events:r})}catch(e){return console.error("GET calendar API error:",e.message),s.NextResponse.json({error:e.message},{status:500})}}async function d(e){try{let t=await (0,n.HW)();if(!t)return s.NextResponse.json({error:"Unauthorized"},{status:401});let{title:r,description:a,start_time:o,end_time:u,is_collaborative:d,participants:c}=await e.json();if(!r||!o||!u)return s.NextResponse.json({error:"Title, start time, and end time are required"},{status:400});if(new Date(o)>=new Date(u))return s.NextResponse.json({error:"End time must be after start time"},{status:400});let l="qwea"===t.signup_code||d||!1,p=(await (0,i.P)`
      INSERT INTO calendar_events (creator_id, title, description, start_time, end_time, is_collaborative)
      VALUES (${t.id}, ${r}, ${a}, ${o}, ${u}, ${l})
      RETURNING *
    `)[0];if(l){if("qwea"===t.signup_code)for(let e of(await (0,i.P)`SELECT id FROM users WHERE id != ${t.id}`))await (0,i.P)`
            INSERT INTO calendar_participants (event_id, user_id, status)
            VALUES (${p.id}, ${e.id}, 'accepted')
            ON CONFLICT (event_id, user_id) DO NOTHING
          `;else if(c&&c.length>0)for(let e of c)await (0,i.P)`
            INSERT INTO calendar_participants (event_id, user_id, status)
            VALUES (${p.id}, ${e}, 'pending')
            ON CONFLICT (event_id, user_id) DO NOTHING
          `}return s.NextResponse.json({event:p})}catch(e){return console.error("POST calendar API error:",e.message),s.NextResponse.json({error:e.message},{status:500})}}[n,i]=o.then?(await o)():o,a()}catch(e){a(e)}})},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[7095,2920,5886,1854,5950],()=>r(1070));module.exports=a})();