import Image from "next/image";
import "./store.css";

const whatsapp = "https://wa.me/918290695226?text=" + encodeURIComponent("नमस्ते, मुझे TAKAT POWER X के बारे में जानकारी चाहिए।");
const checkout = "/checkout?product=takat-power-x&qty=1";

const herbs = [
  ["Ashwagandha", "Traditional Ayurvedic wellness ingredient"],
  ["Shilajit", "Daily vitality and wellness support"],
  ["Safed Musli", "Traditionally used in men's wellness routines"],
  ["Kaunch Beej", "Selected herbal ingredient"],
  ["Gokshura", "Traditional Ayurvedic herb"],
  ["African Herbs", "Part of the premium herbal blend"],
];

const benefits = [
  ["Daily Wellness", "रोज़ की wellness routine में आसानी से शामिल करें।"],
  ["Herbal Blend", "चुनी हुई पारंपरिक herbs और Shilajit वाला formula।"],
  ["Easy Routine", "पैक पर दिए उपयोग निर्देशों के अनुसार सेवन करें।"],
  ["Private Delivery", "सादा और सुरक्षित parcel packing उपलब्ध।"],
];

const faqs = [
  ["TAKAT POWER X क्या है?", "यह adult men के लिए Ayurvedic daily wellness support product है।"],
  ["इसे कैसे लेना है?", "Product label पर दिए directions को प्राथमिकता दें। वेबसाइट पर दी मात्रा से अधिक सेवन न करें।"],
  ["क्या Cash on Delivery है?", "हाँ, serviceable PIN codes पर Cash on Delivery उपलब्ध है।"],
  ["Payment कैसे कर सकते हैं?", "Checkout पर COD और supported UPI payment options उपलब्ध हैं।"],
  ["क्या यह किसी बीमारी का इलाज है?", "नहीं। इसे general wellness support के रूप में प्रस्तुत किया गया है; यह किसी बीमारी के diagnosis, treatment या cure का दावा नहीं करता।"],
];

export const metadata = {
  title: "TAKAT POWER X | Amrit Ayurveda",
  description: "Ayurvedic men's daily wellness support, ingredients, price and online ordering information.",
};

export default function StorePage() {
  return (
    <main className="prakritiStore">
      <div className="topOffer">FREE DELIVERY • CASH ON DELIVERY AVAILABLE • AMRIT AYURVEDA</div>

      <header className="storeHeader">
        <a className="brand" href="#home">
          <span className="brandLeaf">✦</span>
          <span><strong>AMRIT</strong><small>AYURVEDA</small></span>
        </a>
        <nav>
          <a href="#product">Product</a>
          <a href="#ingredients">Ingredients</a>
          <a href="#benefits">Benefits</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="headerOrder" href={checkout}>ORDER NOW</a>
      </header>

      <section className="hero" id="home">
        <div className="heroCopy">
          <span className="eyebrow">AYURVEDIC MEN&apos;S DAILY WELLNESS</span>
          <h1>TAKAT <em>POWER X</em></h1>
          <p className="heroLead">Selected Ayurvedic herbs और Shilajit के साथ बनाया गया premium daily wellness blend.</p>
          <div className="heroBadges">
            <span>25 Herbal Ingredients</span>
            <span>150g Pack</span>
            <span>COD Available</span>
          </div>
          <div className="priceRow">
            <span><s>₹1,500</s><strong>₹999</strong></span>
            <small>Limited online offer</small>
          </div>
          <div className="heroActions">
            <a className="primaryBtn" href={checkout}>BUY NOW • ₹999</a>
            <a className="secondaryBtn" href={whatsapp} target="_blank" rel="noreferrer">WHATSAPP</a>
          </div>
          <p className="micro">Secure checkout • Private packing • India delivery</p>
        </div>

        <div className="heroVisual">
          <div className="leafShape leafOne" />
          <div className="leafShape leafTwo" />
          <div className="productHalo" />
          <Image src="/takat-power-x.jpg" alt="TAKAT POWER X Ayurvedic wellness product" width={620} height={720} priority className="heroProduct" />
          <div className="floatingCard cardOne"><b>25</b><span>HERBAL<br/>INGREDIENTS</span></div>
          <div className="floatingCard cardTwo"><b>COD</b><span>AVAILABLE</span></div>
        </div>
      </section>

      <section className="trustStrip">
        <div><b>AYURVEDIC</b><span>Traditional herbal approach</span></div>
        <div><b>QUALITY PACK</b><span>150g sealed product</span></div>
        <div><b>PRIVATE</b><span>Discreet parcel packing</span></div>
        <div><b>SUPPORT</b><span>WhatsApp assistance</span></div>
      </section>

      <section className="productSection" id="product">
        <div className="sectionVisual">
          <div className="creamDisc" />
          <Image src="/takat-power-x.jpg" alt="TAKAT POWER X 150g bottle" width={520} height={620} className="sectionProduct" />
        </div>
        <div className="sectionCopy">
          <span className="sectionEyebrow">AMRIT AYURVEDA</span>
          <h2>Simple daily wellness,<br/><em>Ayurvedic way.</em></h2>
          <p>TAKAT POWER X को men&apos;s daily wellness routine के लिए तैयार किया गया है। इसमें चुनी हुई herbs और Shilajit का blend है।</p>
          <ul>
            <li>150g premium pack</li>
            <li>Selected herbal ingredients</li>
            <li>Easy daily routine</li>
            <li>Cash on Delivery option</li>
          </ul>
          <a className="primaryBtn dark" href={checkout}>ORDER TAKAT POWER X</a>
        </div>
      </section>

      <section className="ingredientsSection" id="ingredients">
        <div className="sectionHeading">
          <span className="sectionEyebrow">INSIDE THE FORMULA</span>
          <h2>Selected <em>Ayurvedic ingredients</em></h2>
          <p>यह section ingredients की जानकारी के लिए है; किसी disease treatment या guaranteed result का दावा नहीं करता।</p>
        </div>
        <div className="ingredientGrid">
          {herbs.map(([name, text], index) => (
            <article key={name}>
              <span className="ingredientNo">{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{name}</h3><p>{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="benefitsSection" id="benefits">
        <div className="sectionHeading light">
          <span className="sectionEyebrow">WHY CHOOSE AMRIT AYURVEDA</span>
          <h2>Wellness made <em>straightforward</em></h2>
        </div>
        <div className="benefitGrid">
          {benefits.map(([title, text], index) => (
            <article key={title}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="orderBand">
        <div>
          <span>LIMITED ONLINE OFFER</span>
          <h2>TAKAT POWER X • 150g</h2>
          <p><s>₹1,500</s> <strong>₹999</strong> • Cash on Delivery available</p>
        </div>
        <a className="goldBtn" href={checkout}>BUY NOW</a>
      </section>

      <section className="faqSection" id="faq">
        <div className="sectionHeading">
          <span className="sectionEyebrow">NEED TO KNOW</span>
          <h2>Frequently asked <em>questions</em></h2>
        </div>
        <div className="faqList">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span>+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="storeFooter">
        <div className="footerBrand">
          <strong>AMRIT AYURVEDA</strong>
          <p>Ayurvedic men&apos;s daily wellness support.</p>
        </div>
        <div>
          <b>QUICK LINKS</b>
          <a href="#product">Product</a>
          <a href="#ingredients">Ingredients</a>
          <a href="#faq">FAQ</a>
        </div>
        <div>
          <b>SUPPORT</b>
          <a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a>
          <a href="tel:+918290695226">+91 82906 95226</a>
        </div>
        <small>Disclaimer: This product is presented for general wellness support and is not intended to diagnose, treat, cure, or prevent any disease.</small>
      </footer>

      <a className="stickyOrder" href={checkout}>BUY NOW • ₹999</a>
    </main>
  );
}
