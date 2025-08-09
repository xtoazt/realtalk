"use strict";(()=>{var e={};e.id=7602,e.ids=[7602],e.modules={3295:e=>{e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10762:e=>{e.exports=import("@neondatabase/serverless")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},43982:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{patchFetch:()=>l,routeModule:()=>u,serverHooks:()=>x,workAsyncStorage:()=>d,workUnitAsyncStorage:()=>c});var o=t(36044),a=t(63409),n=t(9576),p=t(44847),i=e([p]);p=(i.then?(await i)():i)[0];let u=new o.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/polls/recent/route",pathname:"/api/polls/recent",filename:"route",bundlePath:"app/api/polls/recent/route"},resolvedPagePath:"/Users/rohan/code/realtalk/app/api/polls/recent/route.ts",nextConfigOutput:"",userland:p}),{workAsyncStorage:d,workUnitAsyncStorage:c,serverHooks:x}=u;function l(){return(0,n.patchFetch)({workAsyncStorage:d,workUnitAsyncStorage:c})}s()}catch(e){s(e)}})},44847:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{GET:()=>i});var o=t(10949),a=t(13122),n=t(19246),p=e([a,n]);async function i(e){try{let e=await (0,a.HW)();if(!e)return o.NextResponse.json({error:"Unauthorized"},{status:401});let r=await (0,n.P)`
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
    `;if(0===r.length)return o.NextResponse.json({poll:null});let t=r[0],s=await (0,n.P)`
      SELECT selected_option as option_index, COUNT(*) as count
      FROM poll_responses
      WHERE poll_id = ${t.id}
      GROUP BY selected_option
    `,p=await (0,n.P)`
      SELECT COUNT(*) as total
      FROM poll_responses
      WHERE poll_id = ${t.id}
    `;return o.NextResponse.json({poll:{...t,results:s.map(e=>({option_index:e.option_index,count:Number.parseInt(e.count)})),total_responses:Number.parseInt(p[0].total)}})}catch(e){return console.error("Recent poll API error:",e.message),o.NextResponse.json({error:e.message},{status:500})}}[a,n]=p.then?(await p)():p,s()}catch(e){s(e)}})},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:e=>{e.exports=require("crypto")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")}};var r=require("../../../../webpack-runtime.js");r.C(e);var t=e=>r(r.s=e),s=r.X(0,[9369,5886,1854,2920,4418],()=>t(43982));module.exports=s})();