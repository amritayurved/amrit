export const dynamic = "force-dynamic";
const endpoint = "https://amrit-ayurveda-crm-new.amritayurveda.chatgpt.site/api/enquiry";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ok:false},403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ok:false},415);
  try {
    const raw = await request.text();
    if (raw.length > 2000) return reply({ok:false},413);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) return reply({ok:false},400);
    const response = await fetch(endpoint, {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({name:body.name,phone:body.phone,consent:body.consent,website:body.website}),
      cache: "no-store", signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();
    if (!response.ok || data.ok !== true) return reply({ok:false,error:data.error || "जानकारी सेव नहीं हुई। दोबारा कोशिश करें।"},response.ok ? 503 : response.status);
    return reply({ok:true});
  } catch (error) {
    return reply({ok:false,error:error instanceof SyntaxError ? "कृपया दोबारा कोशिश करें।" : "कनेक्शन जाँचकर दोबारा कोशिश करें।"},error instanceof SyntaxError ? 400 : 503);
  }
}
