"use client";

import { useState } from "react";
import axios from "axios";
import { 
  Fingerprint, ShieldAlert, Upload, Activity, 
  CheckCircle2 
} from "lucide-react";

export default function DigitalForensicsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setResult(null); 
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("medcare_token");
      
      const response = await axios.post("http://localhost:8000/admin/forensics/decrypt", formData, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Forensic analysis failed. Invalid file or system error.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-8 md:p-10 max-w-4xl w-full mx-auto font-sans text-slate-200">
      
      <div className="mb-8 border-b border-slate-800 pb-6">
        <h2 className="text-3xl font-light tracking-widest uppercase text-white mb-1">
          Digital <span className="font-bold text-red-500">Forensics</span>
        </h2>
        <p className="text-[10px] text-slate-400 tracking-widest uppercase font-mono">MILITARY-GRADE DATA LEAK TRACING</p>
      </div>

      {/* Upload Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="border-2 border-dashed border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-red-500 transition-colors bg-slate-950/50"
             onClick={() => document.getElementById('fileInput')?.click()}>
          <Upload size={40} className="text-slate-600 mb-4" />
          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Upload Leaked Report (.PNG or .PDF)</p>
          <input id="fileInput" type="file" className="hidden" onChange={handleFileChange} accept=".png,.pdf,image/png,application/pdf" />
          <p className="text-[10px] text-sky-400 mt-3 font-mono font-bold">{file ? file.name : "Click to select file"}</p>
        </div>
        
        <button 
          onClick={handleAnalyze}
          disabled={!file || analyzing}
          className="w-full mt-6 py-4 bg-red-900/50 hover:bg-red-800 border border-red-700 text-red-100 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_0_15px_rgba(220,38,38,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {analyzing ? <><Activity size={16} className="animate-spin" /> Running Decryption Algorithms...</> : <><Fingerprint size={16} /> Decrypt & Analyze Source</>}
        </button>
      </div>

      {/* Results Area */}
      {error && (
        <div className="p-5 rounded-2xl border bg-slate-900 border-red-900/50 text-red-400 flex items-start gap-3 shadow-lg">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          <div className="text-xs font-mono leading-relaxed">{error}</div>
        </div>
      )}

      {result && (
        <div className="bg-slate-900 border-2 border-red-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-5 mb-6">
            <div className="w-10 h-10 bg-red-950/50 border border-red-900 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-red-500" />
            </div>
            <div>
              <h3 className="text-sm font-black text-red-500 uppercase tracking-widest mb-1">
                Forensic Decryption Result
              </h3>
              <p className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">{result.status || "Leak Source Identified"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs text-slate-300">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Source IP Address</span>
              <span className="text-white text-sm">{result.source_ip}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Handler ID</span>
              <span className="text-white text-sm">{result.handler_id}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Handler Name</span>
              <span className="text-white text-sm">{result.handler_name}</span>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Timestamp</span>
              <span className="text-white text-sm">{result.timestamp}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}