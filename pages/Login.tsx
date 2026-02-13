
import React, { useState } from 'react';
import { Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Login: React.FC<{ onLogin: (user: any) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        alert(error.message);
        setLoading(false);
      } else {
        // Redirection is handled by the auth state listener in App.tsx
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } }
      });
      if (error) {
        alert(error.message);
        setLoading(false);
      } else {
        // Many Supabase setups auto-login after signup, App.tsx will catch it.
        // If not, we show a success message.
        if (!data.session) {
          alert('Bespoke account created. Please confirm your email to activate your silhouette vault.');
          setIsLogin(true);
          setLoading(false);
        }
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-in fade-in duration-1000">
      <div className="bg-white w-full max-w-xl rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 group-hover:h-3 transition-all" />
        <div className="p-12 md:p-20 relative">
          <div className="text-center mb-14">
            <h2 className="text-5xl font-serif font-bold text-slate-900 mb-4">{isLogin ? 'The Atelier Vault' : 'Join the Collective'}</h2>
            <p className="text-slate-400 font-light italic text-lg leading-relaxed">{isLogin ? 'Sign in to review your bespoke portfolio.' : 'Create your secure profile for handcrafted tailoring.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {!isLogin && (
              <div className="relative group/field">
                <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-600 transition-colors" size={20} />
                <input type="text" required placeholder="Full Name" className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div className="relative group/field">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-600 transition-colors" size={20} />
              <input type="email" required placeholder="Email Address" className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="relative group/field">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/field:text-indigo-600 transition-colors" size={20} />
              <input type="password" required placeholder="Security Password" className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-bold" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-bold flex items-center justify-center gap-4 hover:bg-indigo-600 shadow-2xl shadow-slate-900/10 transition-all disabled:opacity-50 active:scale-95 text-xs uppercase tracking-widest">
              {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <>{isLogin ? 'Enter Atelier' : 'Forge Account'} <ArrowRight size={20} /></>}
            </button>
          </form>
          <div className="mt-12 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-slate-400 font-bold hover:text-indigo-600 transition-colors text-xs uppercase tracking-widest">
              {isLogin ? "No vault access? Request Membership" : "Already a member? Secure Entrance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
