"use client";

import { useEffect, useState } from "react";

type SuccessOrder = {
  id: string;
  customerName?: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  payment: "COD" | "Prepaid";
  upiUrl?: string;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(Number(value || 0)) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

export default function OrderSuccessPage() {
  const [order, setOrder] = useState<SuccessOrder | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("amrit-order-success");
    try {
      setOrder(raw ? JSON.parse(raw) as SuccessOrder : null);
    } catch {
      setOrder(null);
    }
  }, []);

  const close = () => window.location.assign("/");

  return (
    <main style={{minHeight:"100vh",background:"radial-gradient(circle at 50% 12%,#1c3b29 0,#0b0b0d 52%,#050505 100%)",fontFamily:"Arial,sans-serif"}}>
      <div className="orderSuccessOverlay" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
        <section className="orderSuccessCard">
          <button className="orderSuccessClose" type="button" aria-label="ऑर्डर पुष्टि बंद करें" onClick={close}>×</button>
          <span className="orderSuccessCheck" aria-hidden="true">✓</span>
          <p className="sectionKicker center">AMRIT AYURVEDA</p>
          <h2 id="order-success-title">ऑर्डर कन्फर्म! 🎉</h2>

          {order ? (
            <>
              <p className="orderCustomerThanks">धन्यवाद, <strong>{order.customerName || "Customer"} जी</strong> 🙏</p>
              <p className="orderSuccessMessage">आपका {order.payment} ऑर्डर सफलतापूर्वक प्राप्त हो गया है।</p>
              <div className="confirmedOrderSummary">
                <p><strong>{order.quantity} {order.quantity === 1 ? "Pack" : "Packs"}</strong><span>₹{money(order.total)}</span></p>
                <small>{order.productName}</small>
              </div>
              <p className="orderConfirmationCode"><span>ऑर्डर आईडी / ORDER ID</span><strong>{order.id}</strong></p>

              {order.payment === "Prepaid" && order.upiUrl ? (
                <a href={order.upiUrl} style={{display:"block",margin:"0 0 12px",padding:"14px 18px",borderRadius:12,background:"#16883f",color:"#fff",textDecoration:"none",fontWeight:900}}>
                  UPI PAYMENT खोलें
                </a>
              ) : (
                <div className="orderContactMessage">
                  <strong>📞 हमारी टीम आज या अगले कार्यदिवस में आपके दिए गए मोबाइल नंबर पर ऑर्डर की पुष्टि के लिए कॉल करेगी।</strong>
                  <p>कृपया अपना फोन उपलब्ध रखें।</p>
                </div>
              )}

              <p className="orderDispatchMessage">📦 ऑर्डर की पुष्टि होने के बाद ही आपका parcel सुरक्षित तरीके से pack करके भेजा जाएगा।</p>
              <div className="orderTrustRow"><span>📦 100% गोपनीय पैकेजिंग</span><span>🛡️ सुरक्षित डिलीवरी</span></div>
            </>
          ) : (
            <p className="orderSuccessMessage">आपका ऑर्डर सुरक्षित रूप से प्राप्त हो गया है।</p>
          )}

          <button className="redButton" type="button" onClick={close}>ठीक है ✓</button>
          <small className="orderHelpNote">यदि आपको तुरंत सहायता चाहिए तो कॉल करें: <a href="tel:+918290695226">+91 82906 95226</a></small>
        </section>
      </div>
    </main>
  );
}
