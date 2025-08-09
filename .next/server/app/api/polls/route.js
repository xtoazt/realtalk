"use strict";(()=>{var e={};e.id=9536,e.ids=[9536],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},16101:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{GET:()=>i,POST:()=>l});var o=t(10949),a=t(13122),n=t(19246),p=e([a,n]);async function i(){try{let e=await (0,a.HW)();if(!e)return o.NextResponse.json({error:"Unauthorized"},{status:401});let r=await (0,n.P)`
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
    `,t=await Promise.all(r.map(async e=>{let r=await (0,n.P)`
          SELECT selected_option as option_index, COUNT(*) as count
          FROM poll_responses
          WHERE poll_id = ${e.id}
          GROUP BY selected_option
          ORDER BY selected_option
        `,t=await (0,n.P)`
          SELECT COUNT(*) as total
          FROM poll_responses
          WHERE poll_id = ${e.id}
        `,s=Number.parseInt(t[0].total);return{...e,results:r.map(e=>({option_index:e.option_index,count:Number.parseInt(e.count)})),total_responses:s}}));return o.NextResponse.json({polls:t})}catch(e){return console.error("GET polls API error:",e.message),o.NextResponse.json({error:e.message},{status:500})}}async function l(e){try{let r=await (0,a.HW)();if(!r)return o.NextResponse.json({error:"Unauthorized"},{status:401});let{title:t,description:s,options:p,is_public:i,shared_with:l,expires_at:u}=await e.json();if(!t||!p||p.length<2)return o.NextResponse.json({error:"Title and at least 2 options are required"},{status:400});if(i&&"qwea"!==r.signup_code)return o.NextResponse.json({error:"Only special users can create public polls"},{status:403});let d=(await (0,n.P)`
      INSERT INTO polls (creator_id, title, description, options, is_public, expires_at)
      VALUES (${r.id}, ${t}, ${s}, ${p}, ${i||!1}, ${u||null})
      RETURNING *
    `)[0];if(!i&&l&&l.length>0)for(let e of l)await (0,n.P)`
          INSERT INTO poll_shares (poll_id, user_id)
          VALUES (${d.id}, ${e})
          ON CONFLICT (poll_id, user_id) DO NOTHING
        `;return o.NextResponse.json({poll:d})}catch(e){return console.error("POST poll API error:",e.message),o.NextResponse.json({error:e.message},{status:500})}}[a,n]=p.then?(await p)():p,s()}catch(e){s(e)}})},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},70330:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{patchFetch:()=>l,routeModule:()=>u,serverHooks:()=>_,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>c});var o=t(36044),a=t(63409),n=t(9576),p=t(16101),i=e([p]);p=(i.then?(await i)():i)[0];let u=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/polls/route",pathname:"/api/polls",filename:"route",bundlePath:"app/api/polls/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/polls/route.ts",nextConfigOutput:"",userland:p}),{workAsyncStorage:d,workUnitAsyncStorage:c,serverHooks:_}=u;function l(){return(0,n.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:c})}s()}catch(e){s(e)}})}};var r=require("../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[9369,5886,1854,2920,4418],()=>t(70330));module.exports=s})();