import { NextResponse } from "next/server";
const CRM = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/abandoned-cart";
export async function POST(request:Request) {
  const reply=(ok:boolean,status=200)=>NextResponse.json({ok},{status,headers:{"Cache-Control":"no-store"}});
  const origin=request.headers.get("origin");
  if(origin && origin!==new URL(request.url).origin) return reply(false,403);
  if(!request.headers.get("content-type")?.includes("application/json")) return reply(false,415);
  try {
    const raw=await request.text();
    if(raw.length>4000) return reply(false,413);
    const input=JSON.parse(raw);
    if(!input || typeof input!=="object" || Array.isArray(input) || input.consent!==true || !/^[6-9]\d{9}$/.test(input.mobile)) return reply(false,400);
    const res=await fetch(CRM,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input),cache:"no-store",signal:AbortSignal.timeout(10000)});
    const result=await res.json().catch(()=>null);
    return reply(res.ok && result?.ok===true,res.ok?200:res.status);
  } catch {return reply(false,502);}
}
