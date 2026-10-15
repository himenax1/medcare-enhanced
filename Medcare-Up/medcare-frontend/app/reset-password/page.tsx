'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { ShieldCheck, Lock, ArrowLeft, Activity } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Missing reset token in URL! Please use the link from your email.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post("http://localhost:8000/auth/reset-password", {
        reset_token: token,
        new_password: newPassword,
      });

      setSuccess(response.data.message);
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Failed to reset password. Link may be invalid or expired.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-[2rem] p-10 shadow-2xl w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center mb-6 relative group">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-lg group-hover:bg-cyan-500/30 transition-all"></div>
          <ShieldCheck className="w-8 h-8 text-cyan-400 relative z-10" />
        </div>
        <h1 className="text-2xl font-light tracking-widest uppercase text-white mb-2 text-center">
          Set New <span className="font-bold text-cyan-400">Password</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase text-center">
          {token ? `Token detected: ${token.substring(0, 8)}...` : "⚠️ No Token Found in URL!"}
        </p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-cyan-950/20 border border-cyan-900/50 rounded-xl text-center">
          <p className="text-xs text-cyan-400 leading-relaxed font-mono">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-3">
          <Activity className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-red-200 leading-relaxed uppercase tracking-widest">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Lock size={12} /> New Password
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-slate-800 hover:bg-cyan-900 border border-slate-700 hover:border-cyan-800 text-white hover:text-cyan-400 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-lg disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <Link href="/login" className="absolute top-8 left-8 inline-flex items-center gap-2 text-slate-500 hover:text-cyan-400 text-xs font-bold uppercase tracking-widest transition-colors z-20">
        <ArrowLeft size={14} /> Back to Login
      </Link>

      <div className="w-full max-w-md p-8 relative z-10">
        <Suspense fallback={<div className="text-white text-center font-mono text-xs">Loading token...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}