"use strict";(()=>{var e={};e.id=7602,e.ids=[7602],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},13122:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.d(t,{HW:()=>d,Hh:()=>E,Jv:()=>_});var a=r(7994),n=r(75025),o=r(15886),i=r(19246),l=r(7673),u=e([i]);i=(u.then?(await u)():u)[0];let w=new TextEncoder().encode(process.env.JWT_SECRET||"fallback-secret-key");async function p(e){return await new a.P(e).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("24h").sign(w)}async function c(e){let{payload:t}=await (0,n.V)(e,w,{algorithms:["HS256"]});return t}async function d(){let e=await (0,o.UL)(),t=e.get("auth-token")?.value;if(console.log("[auth] getCurrentUser called, token exists:",!!t),!t)return console.log("[auth] No auth token found"),null;try{let e=await c(t);console.log("[auth] Token decrypted successfully, userId:",e.userId);let r=(await (0,i.P)`SELECT * FROM users WHERE id = ${e.userId}`)[0]||null;return console.log("[auth] User found:",!!r),r}catch(e){return console.error("[auth] Error getting current user:",e),null}}async function h(e){return await l.Ay.hash(e,12)}async function E(e,t,r){let s=await h(t),a=null,n=!1;"asdf"===r?a="#6366f1":"qwea"===r&&(n=!0);let o=(await (0,i.P)`
    INSERT INTO users (username, password_hash, signup_code, name_color, has_gold_animation, theme, hue, notifications_enabled, last_active, ui_mode)
    VALUES (${e}, ${s}, ${r||null}, ${a}, ${n}, 'light', 'blue', false, NOW(), 'full')
    RETURNING *
  `)[0],l=await p({userId:o.id});return{user:o,token:l}}async function _(e,t){let r=(await (0,i.P)`SELECT * FROM users WHERE username = ${e}`)[0];if(!r||!await l.Ay.compare(t,r.password_hash))throw Error("Invalid username or password");let s=await p({userId:r.id});return{user:r,token:s}}s()}catch(e){s(e)}})},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43982:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{patchFetch:()=>u,routeModule:()=>p,serverHooks:()=>h,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>d});var a=r(36044),n=r(63409),o=r(9576),i=r(44847),l=e([i]);i=(l.then?(await l)():l)[0];let p=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/polls/recent/route",pathname:"/api/polls/recent",filename:"route",bundlePath:"app/api/polls/recent/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/polls/recent/route.ts",nextConfigOutput:"",userland:i}),{workAsyncStorage:c,workUnitAsyncStorage:d,serverHooks:h}=p;function u(){return(0,o.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:d})}s()}catch(e){s(e)}})},44847:(e,t,r)=>{r.a(e,async(e,s)=>{try{r.r(t),r.d(t,{GET:()=>l});var a=r(10949),n=r(13122),o=r(19246),i=e([n,o]);async function l(e){try{let e=await (0,n.HW)();if(!e)return a.NextResponse.json({error:"Unauthorized"},{status:401});let t=await (0,o.P)`
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
      LIMIT 1
    `;if(0===t.length)return a.NextResponse.json({poll:null});let r=t[0],s=await (0,o.P)`
      SELECT selected_option as option_index, COUNT(*) as count
      FROM poll_responses
      WHERE poll_id = ${r.id}
      GROUP BY selected_option
    `,i=await (0,o.P)`
      SELECT COUNT(*) as total
      FROM poll_responses
      WHERE poll_id = ${r.id}
    `;return a.NextResponse.json({poll:{...r,results:s.map(e=>({option_index:e.option_index,count:Number.parseInt(e.count)})),total_responses:Number.parseInt(i[0].total)}})}catch(e){return console.error("Recent poll API error:",e.message),a.NextResponse.json({error:e.message},{status:500})}}[n,o]=i.then?(await i)():i,s()}catch(e){s(e)}})},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[7095,2920,5886,1854,5950],()=>r(43982));module.exports=s})();