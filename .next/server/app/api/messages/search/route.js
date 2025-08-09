"use strict";(()=>{var e={};e.id=3857,e.ids=[3857],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},37818:(e,r,s)=>{s.a(e,async(e,t)=>{try{s.r(r),s.d(r,{GET:()=>u});var a=s(10949),n=s(13122),o=s(19246),i=e([n,o]);async function u(e){try{let r=await (0,n.HW)();if(!r)return a.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:s}=new URL(e.url),t=s.get("q");if(!t||t.trim().length<2)return a.NextResponse.json({messages:[]});let i=await (0,o.P)`
      SELECT m.id, m.content, m.chat_type, m.chat_id, m.message_type, m.created_at,
             u.username, u.name_color, u.has_gold_animation
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE (
        -- Global messages (everyone can see)
        m.chat_type = 'global'
        OR
        -- DM messages where user is involved
        (m.chat_type = 'dm' AND (m.sender_id = ${r.id} OR m.chat_id = ${r.id}))
        OR
        -- Group messages where user is a member
        (m.chat_type = 'group' AND m.chat_id IN (
          SELECT group_chat_id FROM group_chat_members WHERE user_id = ${r.id}
        ))
      )
      AND (
        m.content ILIKE ${`%${t.trim()}%`}
        OR u.username ILIKE ${`%${t.trim()}%`}
      )
      ORDER BY m.created_at DESC
      LIMIT 50
    `;return a.NextResponse.json({messages:i})}catch(e){return console.error("Search messages API error:",e.message),a.NextResponse.json({error:e.message},{status:500})}}[n,o]=i.then?(await i)():i,t()}catch(e){t(e)}})},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},89942:(e,r,s)=>{s.a(e,async(e,t)=>{try{s.r(r),s.d(r,{patchFetch:()=>p,routeModule:()=>m,serverHooks:()=>h,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>c});var a=s(36044),n=s(63409),o=s(9576),i=s(37818),u=e([i]);i=(u.then?(await u)():u)[0];let m=new a.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/messages/search/route",pathname:"/api/messages/search",filename:"route",bundlePath:"app/api/messages/search/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/messages/search/route.ts",nextConfigOutput:"",userland:i}),{workAsyncStorage:d,workUnitAsyncStorage:c,serverHooks:h}=m;function p(){return(0,o.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:c})}t()}catch(e){t(e)}})}};var r=require("../../../../webpack-runtime.js");r.C(e);var s=e=>r(r.s=e),t=r.X(0,[9369,5886,1854,2920,4418],()=>s(89942));module.exports=t})();