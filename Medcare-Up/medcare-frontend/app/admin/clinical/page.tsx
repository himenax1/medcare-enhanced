'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

const API_BASE = 'http://localhost:8000';

type ModuleType = 'overview' | 'ddi' | 'lab' | 'medicine' | 'blockchain';

export default function ClinicalHubPage() {
  const router = useRouter();
  const [activeModule, setActiveModule] = useState<ModuleType>('overview');
  const [token, setToken] = useState<string>('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // --- DDI State ---
  const [ddiRules, setDdiRules] = useState<any[]>([]);
  const [drugA, setDrugA] = useState('');
  const [drugB, setDrugB] = useState('');
  const [ruleName, setRuleName] = useState('');
  const [riskLevel, setRiskLevel] = useState('🔴 LETHAL / CRITICAL');
  const [details, setDetails] = useState('');
  const [fdaLoading, setFdaLoading] = useState(false);

  // --- Lab Catalog State ---
  const [labTests, setLabTests] = useState<any[]>([]);
  const [newTestName, setNewTestName] = useState('');
  const [newTestPrice, setNewTestPrice] = useState('');
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  // --- Renal Formulary State (External Pharmacy - No Stock/Price) ---
  const [medicines, setMedicines] = useState<any[]>([]);
  const [medBrand, setMedBrand] = useState('');
  const [medGeneric, setMedGeneric] = useState('');
  const [medCategory, setMedCategory] = useState('Nephrology');

  // --- Blockchain State ---
  const [blockchainLogs, setBlockchainLogs] = useState<any[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('medcare_token') || localStorage.getItem('token') || '';
    if (!savedToken) { router.push("/login"); return; }
    setToken(savedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;
    if (activeModule === 'ddi') fetchDDIRules();
    if (activeModule === 'lab') fetchLabCatalog();
    if (activeModule === 'medicine') fetchMedicines();
    if (activeModule === 'blockchain') fetchBlockchainLogs();
  }, [activeModule, token]);

  const showNotif = (text: string, type: 'success' | 'error' = 'success') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  // --- API FETCHERS ---
  const fetchDDIRules = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/ddi-rules`, { headers: getHeaders() });
      if (res.ok) setDdiRules(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchLabCatalog = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/lab-catalog`, { headers: getHeaders() });
      if (res.ok) setLabTests(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchMedicines = async () => {
    try {
      const res = await fetch(`${API_BASE}/medicines`, { headers: getHeaders() });
      if (res.ok) setMedicines(await res.json());
    } catch (e) { console.error(e); }
  };

  const fetchBlockchainLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/blockchain-logs`, { headers: getHeaders() });
      if (res.ok) setBlockchainLogs(await res.json());
    } catch (e) { console.error(e); }
  };

  // --- DDI HANDLERS ---
  const fetchFdaInfo = async () => {
    if (!drugA || !drugB) return showNotif('Enter Drug A & Drug B first.', 'error');
    setFdaLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/ddi/fetch-fda-info?drug_a=${encodeURIComponent(drugA)}&drug_b=${encodeURIComponent(drugB)}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.found) {
        setRuleName(data.suggested_rule || `${drugA} + ${drugB}`);
        setDetails(data.suggested_details || '');
        setRiskLevel(data.risk_level || '🔴 HIGH RISK');
        showNotif('Fetched interaction details from openFDA!', 'success');
      } else {
        showNotif(data.message || 'No record found on openFDA.', 'error');
      }
    } catch (e) { showNotif('openFDA lookup failed.', 'error'); }
    finally { setFdaLoading(false); }
  };

  const handleCreateDDI = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/ddi-rules`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ drug_a: drugA, drug_b: drugB, rule_name: ruleName, risk_level: riskLevel, details })
    });
    if (res.ok) {
      showNotif('DDI Rule created & logged to Sepolia Blockchain!', 'success');
      setDrugA(''); setDrugB(''); setRuleName(''); setDetails('');
      fetchDDIRules();
    } else { showNotif('Failed to create DDI Rule', 'error'); }
  };

  const handleToggleRule = async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/ddi-rules/${id}/toggle`, { method: 'PUT', headers: getHeaders() });
    if (res.ok) { fetchDDIRules(); showNotif('Status updated and logged to Blockchain!', 'success'); }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm('Delete this DDI rule?')) return;
    const res = await fetch(`${API_BASE}/admin/ddi-rules/${id}`, { method: 'DELETE', headers: getHeaders() });
    if (res.ok) { fetchDDIRules(); showNotif('Rule deleted.', 'success'); }
  };

  // --- LAB HANDLERS ---
  const handleAddLabTest = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/lab-catalog`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ test_name: newTestName, price: parseFloat(newTestPrice) })
    });
    if (res.ok) {
      showNotif('Lab test added to catalog!', 'success');
      setNewTestName(''); setNewTestPrice('');
      fetchLabCatalog();
    }
  };

  const handleUpdateLabPrice = async (id: number) => {
    const res = await fetch(`${API_BASE}/admin/lab-catalog/${id}?price=${parseFloat(editPriceValue)}`, { method: 'PUT', headers: getHeaders() });
    if (res.ok) { showNotif('Price updated for future orders!', 'success'); setEditingPriceId(null); fetchLabCatalog(); }
  };

  const handleDeleteLabTest = async (id: number) => {
    if (!confirm('Are you sure you want to remove this test from the hospital catalog?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/lab-catalog/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showNotif('Lab test removed from catalog successfully.', 'success');
        fetchLabCatalog();
      } else {
        const data = await res.json();
        showNotif(data.detail || 'Failed to delete lab test.', 'error');
      }
    } catch (e) {
      showNotif('Network error while deleting lab test.', 'error');
    }
  };

// --- RENAL FORMULARY HANDLER ---
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API_BASE}/admin/medicines`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ brand_name: medBrand, generic_name: medGeneric, category: medCategory, unit_price: 0, stock_quantity: 9999 })
    });
    if (res.ok) {
      showNotif('Renal drug added to hospital formulary!', 'success');
      setMedBrand(''); setMedGeneric('');
      fetchMedicines();
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    if (!confirm('Are you sure you want to remove this drug from the hospital formulary?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/medicines/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        showNotif('Drug removed from formulary successfully.', 'success');
        fetchMedicines();
      } else {
        showNotif('Failed to delete drug.', 'error');
      }
    } catch (e) {
      showNotif('Network error while deleting drug.', 'error');
    }
  };

  return (
    <div className="p-10 text-slate-200 font-sans">
      {msg && (
        <div className={`mb-6 p-4 rounded-xl font-semibold text-sm ${msg.type === 'success' ? 'bg-emerald-950 text-emerald-200 border border-emerald-500' : 'bg-rose-950 text-rose-200 border border-rose-500'}`}>
          {msg.text}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-light tracking-widest uppercase text-white mb-1">
            CLINICAL <span className="font-bold text-indigo-500">CONTROL CENTER</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Manage renal safety rules, diagnostic test pricing, approved drug formulary, and Sepolia blockchain logs.</p>
        </div>

        {activeModule !== 'overview' && (
          <button
            onClick={() => setActiveModule('overview')}
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-indigo-400 px-4 py-2 rounded-xl text-xs font-bold uppercase border border-slate-800 transition"
          >
            <span>←</span> <span>Back to Modules</span>
          </button>
        )}
      </div>

      {/* 4 CUBES GRID */}
      {activeModule === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
          <div onClick={() => setActiveModule('ddi')} className="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 p-8 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 bg-indigo-950 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 border border-indigo-800/40 group-hover:scale-110 transition-transform">🧬</div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-wider">DYNAMIC DDI & OPENFDA</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Configure renal drug interaction safety rules, query live openFDA guidance, and log lethal hazard changes to blockchain.</p>
          </div>

          <div onClick={() => setActiveModule('lab')} className="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 p-8 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 bg-emerald-950 text-emerald-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 border border-emerald-800/40 group-hover:scale-110 transition-transform">🔬</div>
            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors uppercase tracking-wider">LAB CATALOG & PRICING</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Manage hospital diagnostic catalog, update renal test pricing (LKR), and register new diagnostic protocols.</p>
          </div>

          <div onClick={() => setActiveModule('medicine')} className="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-8 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 bg-amber-950 text-amber-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 border border-amber-800/40 group-hover:scale-110 transition-transform">💊</div>
            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors uppercase tracking-wider">RENAL DRUG FORMULARY</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Manage approved prescription drugs for external pharmacies. Map brand and generic names for doctor selection.</p>
          </div>

          <div onClick={() => setActiveModule('blockchain')} className="group cursor-pointer bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 p-8 rounded-3xl transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="w-14 h-14 bg-cyan-950 text-cyan-400 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 border border-cyan-800/40 group-hover:scale-110 transition-transform">🔗</div>
            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-wider">BLOCKCHAIN AUDIT LEDGER</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed">Inspect immutable Sepolia Ethereum transactions, SHA-256 hashes, and verified clinical override logs.</p>
          </div>
        </div>
      )}

      {/* DDI MODULE */}
      {activeModule === 'ddi' && (
        <div className="space-y-6 max-w-6xl">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold text-indigo-400 mb-4 uppercase tracking-wider">Create Renal Interaction Rule</h3>
            <form onSubmit={handleCreateDDI} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={drugA} onChange={e => setDrugA(e.target.value)} placeholder="Drug A (e.g. Losartan)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-indigo-500" required />
                <input type="text" value={drugB} onChange={e => setDrugB(e.target.value)} placeholder="Drug B (e.g. Potassium Citrate)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-indigo-500" required />
              </div>
              <button type="button" onClick={fetchFdaInfo} disabled={fdaLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-xl font-bold transition">
                {fdaLoading ? 'Querying openFDA...' : '🔍 Fetch openFDA Guidance'}
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="Rule Name (e.g. ARB + Potassium Supplement)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-indigo-500" required />
                <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-indigo-500">
                  <option value="🔴 LETHAL / CRITICAL">🔴 LETHAL / CRITICAL</option>
                  <option value="🔴 HIGH RISK">🔴 HIGH RISK</option>
                  <option value="🟠 MODERATE RISK">🟠 MODERATE RISK</option>
                  <option value="🟡 MILD / CAUTION">🟡 MILD / CAUTION</option>
                </select>
              </div>
              <textarea value={details} onChange={e => setDetails(e.target.value)} rows={3} placeholder="Nephrology Hazard Explanation..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none focus:border-indigo-500" required />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-xs uppercase tracking-wider">Save Rule & Push to Blockchain</button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Active Rules ({ddiRules.length})</div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase text-[10px]">
                <tr><th className="p-4">Rule</th><th className="p-4">Drugs</th><th className="p-4">Risk</th><th className="p-4">Details</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {ddiRules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-850">
                    <td className="p-4 font-bold text-indigo-400">{r.rule_name}</td>
                    <td className="p-4">{r.drug_a} + {r.drug_b}</td>
                    <td className="p-4 font-bold">{r.risk_level}</td>
                    <td className="p-4 max-w-xs truncate">{r.details}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-md text-[10px] font-bold ${r.is_active ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{r.is_active ? 'ACTIVE' : 'DISABLED'}</span></td>
                    <td className="p-4 text-right space-x-2">
                      <button onClick={() => handleToggleRule(r.id)} className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-200">{r.is_active ? 'Disable' : 'Enable'}</button>
                      <button onClick={() => handleDeleteRule(r.id)} className="bg-red-950 text-red-300 hover:bg-red-900 px-3 py-1 rounded-lg">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LAB MODULE */}
      {activeModule === 'lab' && (
        <div className="space-y-6 max-w-6xl">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 mb-4 uppercase tracking-wider">Add Diagnostic Test</h3>
            <form onSubmit={handleAddLabTest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" value={newTestName} onChange={e => setNewTestName(e.target.value)} placeholder="e.g. Serum Creatinine" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none" required />
              <input type="number" step="0.01" value={newTestPrice} onChange={e => setNewTestPrice(e.target.value)} placeholder="Price (LKR)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none" required />
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider py-3">Add Test</button>
            </form>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Catalog Prices ({labTests.length})</div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase text-[10px]">
                <tr><th className="p-4">ID</th><th className="p-4">Test Name</th><th className="p-4">Price (LKR)</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {labTests.map(t => (
                  <tr key={t.id} className="hover:bg-slate-850">
                    <td className="p-4 font-mono">{t.id}</td>
                    <td className="p-4 font-semibold text-slate-200">{t.test_name}</td>
                    <td className="p-4 text-emerald-400 font-bold font-mono">LKR {t.price?.toLocaleString()}</td>
                    <td className="p-4 text-right">
                      {editingPriceId === t.id ? (
                        <div className="flex justify-end space-x-2">
                          <input type="number" value={editPriceValue} onChange={e => setEditPriceValue(e.target.value)} className="bg-slate-950 border border-slate-700 px-2 py-1 w-24 text-xs rounded-lg text-white" />
                          <button onClick={() => handleUpdateLabPrice(t.id)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded-lg text-white text-xs font-bold">Save</button>
                          <button onClick={() => setEditingPriceId(null)} className="bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-lg text-slate-400 text-xs">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex justify-end space-x-2">
                          <button onClick={() => { setEditingPriceId(t.id); setEditPriceValue(t.price?.toString()); }} className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-semibold">Edit Price</button>
                          <button onClick={() => handleDeleteLabTest(t.id)} className="bg-red-950/80 hover:bg-red-900 border border-red-900/50 px-3 py-1.5 rounded-lg text-red-300 font-semibold">Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FORMULARY MODULE (EXTERNAL PHARMACY) */}
      {activeModule === 'medicine' && (
        <div className="space-y-6 max-w-6xl">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
            <h3 className="text-sm font-bold text-amber-400 mb-4 uppercase tracking-wider">Add Drug to Renal Formulary</h3>
            <form onSubmit={handleAddMedicine} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" value={medBrand} onChange={e => setMedBrand(e.target.value)} placeholder="Brand Name (e.g. Cozaar)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none" required />
              <input type="text" value={medGeneric} onChange={e => setMedGeneric(e.target.value)} placeholder="Generic Name (e.g. Losartan)" className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none" required />
              <select value={medCategory} onChange={e => setMedCategory(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs outline-none">
                <option value="Nephrology">Nephrology</option>
                <option value="Immunosuppressant">Immunosuppressant</option>
                <option value="Antihypertensive">Antihypertensive</option>
                <option value="Phosphate Binder">Phosphate Binder</option>
                <option value="Diuretic">Diuretic</option>
                <option value="Antibiotic">Antibiotic</option>
              </select>
              <div className="md:col-span-3">
                <button type="submit" className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider">Add to Approved Drug List</button>
              </div>
            </form>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase tracking-wider text-slate-300">Renal Drug List ({medicines.length})</div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase text-[10px]">
                <tr><th className="p-4">Brand</th><th className="p-4">Generic</th><th className="p-4">Category</th><th className="p-4">Fulfillment</th><th className="p-4 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {medicines.map(m => (
                  <tr key={m.id} className="hover:bg-slate-850">
                    <td className="p-4 font-bold text-amber-400">{m.brand_name}</td>
                    <td className="p-4">{m.generic_name}</td>
                    <td className="p-4 text-slate-400">{m.category || 'Nephrology'}</td>
                    <td className="p-4 text-slate-500 italic">External Pharmacy</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteMedicine(m.id)} className="bg-red-950/80 hover:bg-red-900 border border-red-900/50 px-3 py-1.5 rounded-lg text-red-300 font-semibold text-xs transition">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BLOCKCHAIN MODULE */}
      {activeModule === 'blockchain' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden max-w-6xl">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">Ethereum Sepolia Audit Ledger</h3>
              <p className="text-[10px] text-slate-500">Cryptographically immutable transaction entries</p>
            </div>
            <button onClick={fetchBlockchainLogs} className="bg-slate-800 hover:bg-slate-700 text-xs px-3 py-1.5 rounded-xl font-bold">🔄 Refresh</button>
          </div>
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 uppercase text-[10px]">
              <tr><th className="p-4">Timestamp</th><th className="p-4">Actor</th><th className="p-4">Action</th><th className="p-4">Sepolia TxID</th><th className="p-4 font-sans">Details</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {blockchainLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-850">
                  <td className="p-4 text-slate-500">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="p-4 text-indigo-400">{l.actor_role} ({l.actor_id})</td>
                  <td className="p-4 text-cyan-400 font-bold">{l.action_type}</td>
                  <td className="p-4 text-cyan-300">
                    {l.tx_id?.startsWith('0x') ? (
                      <a href={`https://sepolia.etherscan.io/tx/${l.tx_id}`} target="_blank" rel="noreferrer" className="underline">{l.tx_id.substring(0, 14)}...</a>
                    ) : <span className="text-slate-600">{l.tx_id}</span>}
                  </td>
                  <td className="p-4 font-sans text-slate-300">{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}