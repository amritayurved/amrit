import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clean Leads | Amrit Ayurveda",
  description: "Amrit Ayurveda Google Sheet view",
  alternates: { canonical: "https://amrit-kohl.vercel.app/leads" },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

const sheetUrl = "https://docs.google.com/spreadsheets/d/1oWFN3j-xwNR4ILgMVWNTtpt04EqiH1AQUxhW9J9LyUA";
const tabId = "137902641";

// Google checks the viewer's own Google session and spreadsheet permissions.
// Do not publish this spreadsheet, proxy its data, or embed connector credentials.
const embedUrl = `${sheetUrl}/htmlembed?gid=${tabId}&single=true&range=A%3AC&widget=false&headers=false&chrome=false`;
const openUrl = `${sheetUrl}/edit#gid=${tabId}`;

export default function LeadsPage() {
  return (
    <main style={{ minHeight: "100dvh", background: "#f3f6f4", color: "#173e2b", padding: "clamp(16px, 3vw, 36px)" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <a href="/" style={{ color: "#315d46", fontSize: 14 }}>Amrit Ayurveda</a>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", lineHeight: 1.3, margin: "8px 0" }}>Clean Leads</h1>
            <p style={{ fontSize: 16, margin: 0 }}>Name · Phone Number · Address</p>
          </div>
          <nav aria-label="Sheet controls" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href={openUrl} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "12px 18px", background: "#173e2b", color: "#fff", borderRadius: 8, fontSize: 16 }}>
              Google Sheet खोलें
            </a>
            <form action="/leads" method="get">
              <button type="submit" style={{ padding: "12px 18px", border: "1px solid #557561", background: "#fff", color: "#173e2b", borderRadius: 8, font: "inherit", cursor: "pointer" }}>
                Refresh
              </button>
            </form>
          </nav>
        </header>
        <p style={{ fontSize: 16, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 900 }}>
          डेटा देखने के लिए उसी Google account में sign in रहें जिसे इस Sheet का access है।
          अगर नीचे sign-in या खाली स्क्रीन दिखे, “Google Sheet खोलें” पर जाएँ और फिर यहाँ Refresh करें।
        </p>
        <iframe
          src={embedUrl}
          title="Clean Leads — Name, Phone Number, Address"
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ display: "block", width: "100%", height: "75dvh", minHeight: 480, border: "1px solid #c5d2c9", borderRadius: 12, background: "#fff" }}
        />
        <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 12 }}>
          Sheet के नए बदलाव देखने के लिए Refresh करें। डेटा की visibility Google Sheet की sharing settings से नियंत्रित होती है।
        </p>
      </div>
    </main>
  );
}
