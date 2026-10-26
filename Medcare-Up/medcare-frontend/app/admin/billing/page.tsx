"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Activity, CreditCard, Clock } from "lucide-react";

export default function AutomatedBillingDesk() {
  const router = useRouter();
  const [pendingBills, setPendingBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("medcare_token");
    if (!token) { router.push("/login"); return; }
    fetchBills(token);
    const interval = setInterval(() => fetchBills(token), 15000);
    return () => clearInterval(interval);
  }, [router]);

  const fetchBills = async (token: string) => {
    try {
      const response = await axios.get("http://localhost:8000/admin/billing/live-desk", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setPendingBills(response.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handlePay = async (billId: number) => {
    setProcessingId(billId);
    try {
      await axios.post(`http://localhost:8000/bills/${billId}/pay`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("medcare_token")}` }
      });
      setPendingBills(prev => prev.filter(b => b.bill_id !== billId));
    } catch (err) { alert("Payment failed."); } finally { setProcessingId(null); }
  };

  return (
    <div className="p-10 text-slate-200 font-sans">
      <h2 className="text-3xl font-light text-white mb-8 tracking-widest uppercase">
        Live <span className="font-bold text-indigo-500">Billing Desk</span>
      </h2>
      
      {loading ? (
        <div className="py-20 flex justify-center">
          <Activity size={40} className="animate-spin text-indigo-500" />
        </div>
      ) : pendingBills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs uppercase font-mono">
          No pending invoices currently requiring settlement.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pendingBills.map(bill => (
            <div key={bill.bill_id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
              <div className="bg-slate-950 p-5 border-b border-slate-800 flex justify-between items-center">
                <p className="text-sm font-bold text-white font-mono">{bill.bill_number}</p>
                <span className="text-amber-500 text-[9px] font-black uppercase flex items-center gap-1 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-800/40">
                  <Clock size={10}/> Pending
                </span>
              </div>
              <div className="p-6 text-center">
                <p className="text-[10px] text-slate-500 uppercase mb-1">Patient: {bill.patient_name}</p>
                <p className="text-3xl font-black text-indigo-400 font-mono">Rs.{bill.total_amount?.toLocaleString()}</p>
              </div>
              <button 
                onClick={() => handlePay(bill.bill_id)} 
                disabled={processingId === bill.bill_id} 
                className="p-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
              >
                {processingId === bill.bill_id ? <Activity size={16} className="animate-spin" /> : <><CreditCard size={16} /> Mark as Paid</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}