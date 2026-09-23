import Link from "next/link";

export const metadata = {
  title: "Policies | Amrit Ayurveda",
  description: "Amrit Ayurveda privacy, shipping, refund, terms and contact information.",
};

const sectionStyle = {
  padding: "28px 0",
  borderBottom: "1px solid #e3ded4",
} as const;

export default function PoliciesPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#fffdf8", color: "#18231b", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "min(900px, calc(100% - 32px))", margin: "0 auto", padding: "28px 0 70px" }}>
        <Link href="/" style={{ color: "#275f3b", fontWeight: 800, textDecoration: "none" }}>
          ← Amrit Ayurveda
        </Link>

        <h1 style={{ margin: "28px 0 8px", fontFamily: "Georgia, serif", fontSize: "clamp(2.4rem,7vw,4.6rem)", color: "#173d27" }}>
          Amrit Ayurveda Policies
        </h1>
        <p style={{ color: "#697169", lineHeight: 1.7 }}>
          नीचे हमारी website और order process से जुड़ी मुख्य जानकारी दी गई है।
        </p>

        <section id="privacy" style={sectionStyle}>
          <h2>Privacy Policy</h2>
          <p>
            Order पूरा करने के लिए हम customer का नाम, mobile number, PIN code, delivery address, selected product,
            payment preference और order-related technical information collect कर सकते हैं। इस data का उपयोग order
            processing, delivery, customer support, fraud prevention और service improvement के लिए किया जाता है।
          </p>
          <p>
            हम customer information को अनावश्यक रूप से public नहीं करते। Delivery और payment processing के लिए जरूरी
            service providers के साथ आवश्यक data साझा किया जा सकता है।
          </p>
        </section>

        <section id="shipping" style={sectionStyle}>
          <h2>Shipping Policy</h2>
          <p>
            Orders serviceable PIN codes पर dispatch किए जाते हैं। Delivery time location, courier availability और
            operational conditions पर निर्भर कर सकता है। COD availability PIN code के अनुसार बदल सकती है।
          </p>
        </section>

        <section id="refund" style={sectionStyle}>
          <h2>Cancellation & Refund</h2>
          <p>
            Dispatch से पहले cancellation request customer support के माध्यम से की जा सकती है। Delivered product के
            refund/return requests product condition, packaging, applicable consumer rules और hygiene/safety
            requirements के अनुसार review किए जाते हैं।
          </p>
        </section>

        <section id="terms" style={sectionStyle}>
          <h2>Terms & Conditions</h2>
          <p>
            Website पर product information सामान्य wellness information के लिए है। यह किसी बीमारी का diagnosis,
            treatment, prevention या cure करने का दावा नहीं करती। Product का उपयोग label directions के अनुसार करें।
            किसी medical condition या ongoing medication की स्थिति में qualified healthcare professional से सलाह लें।
          </p>
          <p>
            Prices, delivery availability और offers समय-समय पर बदल सकते हैं। Order submit करते समय दिखाया गया amount
            उस order record के लिए लागू होगा।
          </p>
        </section>

        <section id="contact" style={{ ...sectionStyle, borderBottom: 0 }}>
          <h2>Contact</h2>
          <p>
            Order या delivery सहायता के लिए Amrit Ayurveda customer support से संपर्क करें। Website पर उपलब्ध
            WhatsApp/phone support channel का उपयोग करें और अपना Order ID साथ रखें।
          </p>
        </section>
      </div>
    </main>
  );
}
