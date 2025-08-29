"use strict";(()=>{var e={};e.id=9536,e.ids=[9536],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13122:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.d(t,{HW:()=>c,Hh:()=>h,Jv:()=>_});var a=r(7994),o=r(75025),n=r(15886),i=r(19246),l=r(7673),u=e([i]);i=(u.then?(await u)():u)[0];let R=new TextEncoder().encode(process.env.JWT_SECRET||"fallback-secret-key");async function p(e){return await new a.P(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("24h").sign(R)}async function d(e){let{payload:t}=await (0,o.V)(e,R,{algorithms:["HS256"]});return t}async function c(){let e=await (0,n.UL)(),t=e.get("auth-token")?.value;if(console.log("[auth] getCurrentUser called, token exists:",!!t),!t)return console.log("[auth] No auth token found"),null;try{let e=await d(t);console.log("[auth] Token decrypted successfully, userId:",e.userId);let r=(await (0,i.P)`SELECT * FROM users WHERE id = ${e.userId}`)[0]||null;return console.log("[auth] User found:",!!r),r}catch(e){return console.error("[auth] Error getting current user:",e),null}}async function E(e){return await l.Ay.hash(e,12)}async function h(e,t,r){let s=await E(t),a=null,o=!1;"asdf"===r?a="#6366f1":"qwea"===r&&(o=!0);let n=(await (0,i.P)`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active, ui_mode)
    VALUES (${e}, ${s}, ${r||null}, ${a}, ${o}, 'light', 'blue', false, NOW(), 'full')
    RETURNING *
  `)[0],l=await p({userId:n.id});return{user:n,token:l}}async function _(e,t){let r=(await (0,i.P)`SELECT * FROM users WHERE username = ${e}`)[0];if(!r||!await l.Ay.compare(t,r.password_hash))throw Error("Invalid username or password");let s=await p({userId:r.id});return{user:r,token:s}}s()}catch(e){s(e)}})},16101:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{GET:()=>l,POST:()=>u});var a=r(10949),o=r(13122),n=r(19246),i=e([o,n]);async function l(){try{let e=await (0,o.HW)();if(!e)return a.NextResponse.json({error:"Unauthorized"},{status:401});let t=await (0,n.P)`
      SELECT DISTINCT p.*, u.username as creator_username,
             pr.selected_option as user_response
      FROM polls p
      JOIN users u ON p.creator_id = u.id
      LEFT JOIN poll_responses pr ON p.id = pr.poll_id AND pr.user_id = ${e.id}
      WHERE p.is_public = true
         OR p.creator_id = ${e.id}
         OR p.id IN (
           SELECT poll_id FROM poll_shares WHERE user_id = ${e.id}
         )
      ORDER BY p.created_at DESC
    `,r=await Promise.all(t.map(async e=>{let t=await (0,n.P)`
          SELECT selected_option as option_index, COUNT(*) as count
          FROM poll_responses
          WHERE poll_id = ${e.id}
          GROUP BY selected_option
          ORDER BY selected_option
        `,r=await (0,n.P)`
          SELECT COUNT(*) as total
          FROM poll_responses
          WHERE poll_id = ${e.id}
        `,s=Number.parseInt(r[0].total);return{...e,results:t.map(e=>({option_index:e.option_index,count:Number.parseInt(e.count)})),total_responses:s}}));return a.NextResponse.json({polls:r})}catch(e){return console.error("GET polls API error:",e.message),a.NextResponse.json({error:e.message},{status:500})}}async function u(e){try{let t=await (0,o.HW)();if(!t)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{title:r,description:s,options:i,is_public:l,shared_with:u,expires_at:p}=await e.json();if(!r||!i||i.length<2)return a.NextResponse.json({error:"Title and at least 2 options are required"},{status:400});if(l&&"qwea"!==t.signup_code)return a.NextResponse.json({error:"Only special users can create public polls"},{status:403});let d=(await (0,n.P)`
      INSERT INTO polls (creator_id, title, description, options, is_public, expires_at)
      VALUES (${t.id}, ${r}, ${s}, ${i}, ${l||!1}, ${p||null})
      RETURNING *
    `)[0];if(!l&&u&&u.length>0)for(let e of u)await (0,n.P)`
          INSERT INTO poll_shares (poll_id, user_id)
          VALUES (${d.id}, ${e})
          ON CONFLICT (poll_id, user_id) DO NOTHING
        `;return a.NextResponse.json({poll:d})}catch(e){return console.error("POST poll API error:",e.message),a.NextResponse.json({error:e.message},{status:500})}}[o,n]=i.then?(await i)():i,s()}catch(e){s(e)}})},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70330:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{patchFetch:()=>u,routeModule:()=>p,serverHooks:()=>E,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>c});var a=r(36044),o=r(63409),n=r(9576),i=r(16101),l=e([i]);i=(l.then?(await l)():l)[0];let p=new a.AppRouteRouteModule({definition:{kind:o.RouteKind.APP_ROUTE,page:"/api/polls/route",pathname:"/api/polls",filename:"route",bundlePath:"app/api/polls/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/polls/route.ts",nextConfigOutput:"",userland:i}),{workAsyncStorage:d,workUnitAsyncStorage:c,serverHooks:E}=p;function u(){return(0,n.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:c})}s()}catch(e){s(e)}})}};var t=require("../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[7095,2920,5886,1854,5950],()=>r(70330));module.exports=s})();