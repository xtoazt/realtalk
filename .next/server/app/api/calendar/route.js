"use strict";(()=>{var e={};e.id=1948,e.ids=[1948],e.modules={1070:(e,r,t)=>{t.a(e,async(e,a)=>{try{t.r(r),t.d(r,{patchFetch:()=>u,routeModule:()=>p,serverHooks:()=>N,workAsyncStorage:()=>c,workUnitAsyncStorage:()=>l});var s=t(36044),n=t(63409),i=t(9576),o=t(57313),d=e([o]);o=(d.then?(await d)():d)[0];let p=new s.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/calendar/route",pathname:"/api/calendar",filename:"route",bundlePath:"app/api/calendar/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/calendar/route.ts",nextConfigOutput:"",userland:o}),{workAsyncStorage:c,workUnitAsyncStorage:l,serverHooks:N}=p;function u(){return(0,i.patchFetch)({workAsyncStorage:c,workUnitAsyncStorage:l})}a()}catch(e){a(e)}})},3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},57313:(e,r,t)=>{t.a(e,async(e,a)=>{try{t.r(r),t.d(r,{GET:()=>d,POST:()=>u});var s=t(10949),n=t(13122),i=t(19246),o=e([n,i]);async function d(){try{let e=await (0,n.HW)();if(!e)return s.NextResponse.json({error:"Unauthorized"},{status:401});let r=await (0,i.P)`
      SELECT DISTINCT e.*, u.username as creator_username
      FROM calendar_events e
      JOIN users u ON e.creator_id = u.id
      WHERE e.creator_id = ${e.id}
         OR e.id IN (
           SELECT event_id FROM calendar_participants WHERE user_id = ${e.id}
         )
      ORDER BY e.start_time ASC
    `,t=await Promise.all(r.map(async e=>{let r=await (0,i.P)`
          SELECT cp.user_id, cp.status, u.username
          FROM calendar_participants cp
          JOIN users u ON cp.user_id = u.id
          WHERE cp.event_id = ${e.id}
        `;return{...e,participants:r}}));return s.NextResponse.json({events:t})}catch(e){return console.error("GET calendar API error:",e.message),s.NextResponse.json({error:e.message},{status:500})}}async function u(e){try{let r=await (0,n.HW)();if(!r)return s.NextResponse.json({error:"Unauthorized"},{status:401});let{title:t,description:a,start_time:o,end_time:d,is_collaborative:u,participants:p}=await e.json();if(!t||!o||!d)return s.NextResponse.json({error:"Title, start time, and end time are required"},{status:400});if(new Date(o)>=new Date(d))return s.NextResponse.json({error:"End time must be after start time"},{status:400});let c="qwea"===r.signup_code||u||!1,l=(await (0,i.P)`
      INSERT INTO calendar_events (creator_id, title, description, start_time, end_time, is_collaborative)
      VALUES (${r.id}, ${t}, ${a}, ${o}, ${d}, ${c})
      RETURNING *
    `)[0];if(c){if("qwea"===r.signup_code)for(let e of(await (0,i.P)`SELECT id FROM users WHERE id != ${r.id}`))await (0,i.P)`
            INSERT INTO calendar_participants (event_id, user_id, status)
            VALUES (${l.id}, ${e.id}, 'accepted')
            ON CONFLICT (event_id, user_id) DO NOTHING
          `;else if(p&&p.length>0)for(let e of p)await (0,i.P)`
            INSERT INTO calendar_participants (event_id, user_id, status)
            VALUES (${l.id}, ${e}, 'pending')
            ON CONFLICT (event_id, user_id) DO NOTHING
          `}return s.NextResponse.json({event:l})}catch(e){return console.error("POST calendar API error:",e.message),s.NextResponse.json({error:e.message},{status:500})}}[n,i]=o.then?(await o)():o,a()}catch(e){a(e)}})},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),a=r.X(0,[9369,5886,1854,2920,4418],()=>t(1070));module.exports=a})();