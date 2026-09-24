export default function HomePage() {
  return (
    <main className="tpx-page">
      <div className="shipping-strip">
        <span>🌿 Free Shipping on All Orders</span>
        <span>Cash on Delivery Available</span>
        <span>100% Ayurvedic</span>
      </div>

      <header className="site-header">
        <div className="menu" aria-hidden="true">☰</div>
        <div className="brand">
          <div className="brand-mark">🌿</div>
          <div>
            <strong>AMRIT AYURVEDA</strong>
            <small>Natural Wellness</small>
          </div>
        </div>
        <a className="top-order" href="/checkout?product=takat-power-x&qty=1&payment=COD">
          अभी ऑर्डर करें
        </a>
      </header>

      <section className="landing-shell">
        <section className="hero-card">
          <img
            className="hero-photo"
            src="/hero-couple.webp"
            alt="TAKAT POWER X के साथ adult wellness lifestyle"
          />
          <div className="hero-shade" />

          <div className="hero-copy">
            <p className="hindi-kicker">आयुर्वेदिक शक्ति<br />रोज़ की एनर्जी के लिए</p>
            <h1>TAKAT<br />POWER X</h1>
            <div className="gold-label">Ayurvedic Vitality<br />Support for Men</div>
            <p className="support-copy">Supports Daily Stamina<br />Promotes Physical Energy</p>

            <div className="benefit-list">
              <div><b>🌿 25+</b><span>SUPER HERBS</span></div>
              <div><b>🥣 100%</b><span>AYURVEDIC WELLNESS</span></div>
              <div><b>🍃 NATURAL</b><span>INGREDIENT FOCUS</span></div>
              <div><b>✓ QUALITY</b><span>FOCUSED FORMULA</span></div>
            </div>
          </div>

          <div className="hero-product-card">
            <img src="/takat-power-x.jpg" alt="TAKAT POWER X product bottle" />
          </div>

          <div className="feature-row">
            <div><b>25+</b><span>SUPER<br />HERBS</span></div>
            <div><b>100%</b><span>AYURVEDIC<br />WELLNESS</span></div>
            <div><b>🌿</b><span>NATURAL<br />FOCUS</span></div>
            <div><b>✓</b><span>QUALITY<br />FOCUSED</span></div>
          </div>
        </section>

        <section className="purchase-panel" id="order">
          <h2>TAKAT POWER X — रोज़ की वेलनेस के लिए आयुर्वेदिक सपोर्ट</h2>
          <div className="price-line">
            <strong>Rs. 999.00</strong>
            <del>Rs. 1,500.00</del>
          </div>
          <p className="taxes">Taxes included.</p>

          <a className="buy-btn cod" href="/checkout?product=takat-power-x&qty=1&payment=COD">
            🛒 अभी ऑर्डर करें — Cash on Delivery
          </a>
          <a className="buy-btn prepaid" href="/checkout?product=takat-power-x&qty=1&payment=Prepaid">
            ▱ Pay Online &amp; Get 10% Extra Discount
          </a>
          <p className="payment-note">UPI / Debit Card / Credit Card / Net Banking</p>

          <div className="sale-copy">
            <strong>Hurry up! Limited Offer</strong>
            <span>TAKAT POWER X ₹999 COD</span>
          </div>
        </section>
      </section>

      <a className="sticky-order" href="/checkout?product=takat-power-x&qty=1&payment=COD">
        अभी ऑर्डर करें ₹999 COD
      </a>

      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { margin: 0; background: #fff7df; }
        .tpx-page {
          min-height: 100vh;
          background: #fff7df;
          color: #141414;
          font-family: Arial, Helvetica, sans-serif;
          padding-bottom: 86px;
        }
        .shipping-strip {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 7px 12px;
          font-size: 12px;
          background: #ffffff;
          border-bottom: 1px solid #ece7d9;
          color: #4d4d4d;
          text-align: center;
        }
        .shipping-strip span + span::before {
          content: "|";
          margin-right: 10px;
          color: #a9a9a9;
        }
        .site-header {
          height: 78px;
          display: grid;
          grid-template-columns: 80px 1fr 150px;
          align-items: center;
          padding: 0 18px;
          background: #fff;
          border-bottom: 1px solid #ebe7da;
        }
        .menu {
          font-size: 26px;
          color: #363636;
        }
        .brand {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 8px;
          text-align: left;
        }
        .brand-mark {
          width: 42px;
          height: 42px;
          border: 2px solid #2f6b3a;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 24px;
          background: #fffdf4;
        }
        .brand strong {
          display: block;
          color: #244d2d;
          letter-spacing: .7px;
          font-size: 15px;
        }
        .brand small {
          display: block;
          margin-top: 2px;
          color: #8b6c24;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .top-order {
          justify-self: end;
          text-decoration: none;
          color: #fff;
          background: #37643f;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }
        .landing-shell {
          width: min(100%, 930px);
          margin: 0 auto;
          padding: 34px 14px 0;
        }
        .hero-card {
          position: relative;
          min-height: 1030px;
          overflow: hidden;
          border-radius: 12px;
          background: #0a0908;
          box-shadow: 0 8px 26px rgba(37, 24, 0, .14);
        }
        .hero-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: 64% center;
          opacity: .98;
        }
        .hero-shade {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0,0,0,.98) 0%, rgba(0,0,0,.9) 29%, rgba(0,0,0,.48) 55%, rgba(0,0,0,.08) 78%),
            linear-gradient(0deg, rgba(0,0,0,.68) 0%, transparent 38%);
        }
        .hero-copy {
          position: relative;
          z-index: 2;
          width: 54%;
          padding: 54px 30px 220px 48px;
          color: #fff;
        }
        .hindi-kicker {
          margin: 0 0 12px;
          font-size: 30px;
          line-height: 1.22;
          font-weight: 800;
          color: #f5f0e6;
        }
        .hero-copy h1 {
          margin: 0 0 12px;
          font-size: clamp(68px, 9vw, 112px);
          line-height: .84;
          letter-spacing: -3px;
          color: #e0a222;
          font-weight: 1000;
          text-shadow: 0 3px 14px rgba(0,0,0,.25);
        }
        .gold-label {
          display: inline-block;
          margin-top: 10px;
          padding: 13px 20px 15px;
          border-radius: 10px;
          background: linear-gradient(180deg,#d9a82b,#b87c13);
          color: #111;
          font-size: 24px;
          line-height: 1.18;
          font-weight: 900;
        }
        .support-copy {
          margin: 28px 0;
          font-size: 21px;
          line-height: 1.55;
          font-weight: 700;
        }
        .benefit-list {
          display: grid;
          gap: 0;
          margin-top: 26px;
          max-width: 360px;
        }
        .benefit-list > div {
          display: grid;
          grid-template-columns: 112px 1fr;
          align-items: center;
          gap: 8px;
          min-height: 78px;
          border-bottom: 1px dotted rgba(224,162,34,.6);
        }
        .benefit-list b {
          color: #e4b348;
          font-size: 18px;
        }
        .benefit-list span {
          font-size: 15px;
          line-height: 1.25;
          font-weight: 700;
          letter-spacing: .4px;
        }
        .hero-product-card {
          position: absolute;
          z-index: 3;
          right: 28px;
          bottom: 175px;
          width: 260px;
          border-radius: 22px;
          overflow: hidden;
          border: 2px solid rgba(226,168,42,.85);
          background: #fff;
          box-shadow: 0 18px 45px rgba(0,0,0,.38);
          transform: rotate(-1deg);
        }
        .hero-product-card img {
          display: block;
          width: 100%;
          height: auto;
        }
        .feature-row {
          position: absolute;
          z-index: 4;
          left: 28px;
          right: 28px;
          bottom: 24px;
          min-height: 128px;
          border: 1px solid rgba(218,166,52,.55);
          border-radius: 13px;
          background: rgba(7,7,7,.82);
          backdrop-filter: blur(3px);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
        }
        .feature-row > div {
          display: grid;
          place-items: center;
          align-content: center;
          gap: 6px;
          text-align: center;
          color: #f8f4e7;
          padding: 14px 8px;
          border-right: 1px solid rgba(218,166,52,.35);
        }
        .feature-row > div:last-child { border-right: 0; }
        .feature-row b {
          color: #dfad3b;
          font-size: 26px;
        }
        .feature-row span {
          font-size: 13px;
          font-weight: 800;
          line-height: 1.2;
        }
        .purchase-panel {
          text-align: center;
          padding: 0 2px 34px;
        }
        .purchase-panel h2 {
          margin: 6px 0 16px;
          font-size: 28px;
          line-height: 1.28;
          font-weight: 900;
        }
        .price-line {
          display: flex;
          justify-content: center;
          align-items: baseline;
          gap: 12px;
        }
        .price-line strong { font-size: 22px; }
        .price-line del { color: #a6a6a6; font-size: 16px; }
        .taxes {
          margin: 6px 0 20px;
          color: #a0a0a0;
          letter-spacing: 1px;
          font-size: 11px;
        }
        .buy-btn {
          min-height: 56px;
          border-radius: 999px;
          margin: 16px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 7px 16px rgba(0,0,0,.13);
        }
        .buy-btn.cod {
          background: #050505;
          color: #fff;
        }
        .buy-btn.prepaid {
          background: linear-gradient(90deg,#efd667,#d7b53f);
          color: #2a260f;
        }
        .payment-note {
          margin: 11px 0 34px;
          font-size: 10px;
          color: #8d8d8d;
        }
        .sale-copy {
          display: grid;
          gap: 14px;
          font-size: 17px;
        }
        .sale-copy span {
          display: block;
          background: #090909;
          color: #fff;
          border-radius: 8px;
          padding: 15px;
          font-weight: 900;
        }
        .sticky-order {
          position: fixed;
          z-index: 9998;
          left: 10px;
          right: 10px;
          bottom: 10px;
          min-height: 54px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #060606;
          color: #fff;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 6px 20px rgba(0,0,0,.3);
        }
        @media (max-width: 680px) {
          .shipping-strip {
            gap: 5px;
            padding: 6px 4px;
            font-size: 9px;
          }
          .shipping-strip span + span::before {
            margin-right: 5px;
          }
          .site-header {
            height: 64px;
            grid-template-columns: 38px 1fr 104px;
            padding: 0 8px;
          }
          .menu { font-size: 20px; }
          .brand { gap: 5px; }
          .brand-mark { width: 34px; height: 34px; font-size: 19px; }
          .brand strong { font-size: 11px; }
          .brand small { font-size: 8px; }
          .top-order { padding: 8px 10px; font-size: 10px; }
          .landing-shell { padding: 18px 10px 0; }
          .hero-card {
            min-height: 860px;
            border-radius: 9px;
          }
          .hero-photo {
            object-position: 67% center;
          }
          .hero-shade {
            background:
              linear-gradient(90deg, rgba(0,0,0,.98) 0%, rgba(0,0,0,.86) 31%, rgba(0,0,0,.35) 66%, rgba(0,0,0,.04) 90%),
              linear-gradient(0deg, rgba(0,0,0,.83) 0%, transparent 38%);
          }
          .hero-copy {
            width: 65%;
            padding: 36px 10px 190px 20px;
          }
          .hindi-kicker { font-size: 19px; }
          .hero-copy h1 {
            font-size: clamp(50px, 16vw, 76px);
            letter-spacing: -2px;
          }
          .gold-label {
            padding: 9px 11px;
            font-size: 16px;
          }
          .support-copy {
            margin: 18px 0;
            font-size: 14px;
            line-height: 1.48;
          }
          .benefit-list { max-width: 220px; }
          .benefit-list > div {
            grid-template-columns: 82px 1fr;
            min-height: 59px;
          }
          .benefit-list b { font-size: 13px; }
          .benefit-list span { font-size: 10px; }
          .hero-product-card {
            right: 12px;
            bottom: 145px;
            width: 145px;
            border-radius: 13px;
          }
          .feature-row {
            left: 12px;
            right: 12px;
            bottom: 14px;
            min-height: 106px;
            border-radius: 9px;
          }
          .feature-row b { font-size: 19px; }
          .feature-row span { font-size: 9px; }
          .purchase-panel h2 {
            margin-top: 5px;
            font-size: 21px;
          }
          .buy-btn { min-height: 50px; font-size: 13px; }
          .sticky-order { min-height: 50px; font-size: 13px; }
        }
        @media (max-width: 390px) {
          .hero-card { min-height: 800px; }
          .hero-copy { width: 68%; padding-left: 15px; }
          .hero-copy h1 { font-size: 48px; }
          .hero-product-card { width: 130px; right: 8px; }
          .feature-row span { font-size: 8px; }
        }
      `}</style>
    </main>
  );
}
