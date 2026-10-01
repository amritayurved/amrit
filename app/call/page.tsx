import type { Metadata } from "next";
import EnquiryForm from "./EnquiryForm";
import "./call.css";
export const metadata: Metadata = {
 title: "मुझे कॉल करें | Amrit Ayurveda",
 description: "प्रोडक्ट की जानकारी के लिए अपना नाम और मोबाइल नंबर भेजें।",
 alternates: { canonical: "/call" },
 openGraph: {title:"मुझे कॉल करें | Amrit Ayurveda",description:"अपना नाम और मोबाइल नंबर भेजें। हमारी टीम आपसे संपर्क करेगी।",url:"https://www.amritayurveda.shop/call",siteName:"Amrit Ayurveda",locale:"hi_IN",type:"website"},
 twitter:{card:"summary",title:"मुझे कॉल करें | Amrit Ayurveda",description:"प्रोडक्ट की जानकारी के लिए संपर्क करें।"}
};
export default function CallPage() { return <EnquiryForm />; }
