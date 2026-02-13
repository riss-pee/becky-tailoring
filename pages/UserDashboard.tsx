
import React, { useState } from 'react';
import { User, Order, Measurements } from '../types';
import { Ruler, Package, Save, Sparkles, Edit2, Settings, Lock, ChevronRight } from 'lucide-react';
import { generateStyleAdvice } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface UserDashboardProps {
  user: User;
  orders: Order[];
  onUpdateMeasurements: (userId: string, measurements: Measurements) => void;
  onUpdateProfile: (name: string, phone: string) => Promise<void>;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, orders, onUpdateMeasurements, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'measurements' | 'profile'>('orders');
  const [editMeasurements, setEditMeasurements] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  
  const [measurements, setMeasurements] = useState<Measurements>(user.measurements || {
    bust: 0, waist: 0, hips: 0, inseam: 0, shoulder: 0, height: 0
  });

  const [profileData, setProfileData] = useState({
    name: user.name,
    phone: user.phone || ''
  });

  const [advice, setAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleSaveMeasurements = () => {
    onUpdateMeasurements(user.id, measurements);
    setEditMeasurements(false);
  };

  const handleSaveProfile = async () => {
    await onUpdateProfile(profileData.name, profileData.phone);
    setEditProfile(false);
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(user.email);
    if (error) alert(error.message);
    else alert('A secure password reset link has been dispatched to your email.');
  };

  const getStyleAdvice = async () => {
    if (measurements.bust === 0 && measurements.waist === 0) {
      alert('Please provide your measurements to receive personalized style counsel.');
      return;
    }
    setLoadingAdvice(true);
    const result = await generateStyleAdvice(measurements, "Classic Elegant");
    setAdvice(result);
    setLoadingAdvice(false);
  };

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    sewing: 'bg-blue-100 text-blue-700 border-blue-200',
    ready: 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white p-12 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-4xl font-serif font-bold shadow-2xl shadow-slate-200">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-4xl font-serif font-bold text-slate-900 mb-1">{user.name}</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Sparkles size={12} className="text-indigo-600" /> Bespoke Client Member
            </p>
          </div>
        </div>
        <div className="flex bg-slate-50 p-2 rounded-[1.5rem] border border-slate-100">
          {['orders', 'measurements', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200 border border-slate-100' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[60vh] transition-all duration-700">
        {activeTab === 'orders' && (
          <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-10 flex items-center gap-4">
              <Package className="text-indigo-600" />
              Tailoring Journey Portfolio
            </h2>
            {orders.length === 0 ? (
              <div className="py-32 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mx-auto border border-dashed border-slate-200">
                  <Package size={40} />
                </div>
                <p className="text-slate-400 font-serif italic text-xl">Your wardrobe awaits its first masterpiece.</p>
                <button onClick={() => window.location.hash = 'shop'} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-all">Explore Designs</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {orders.map((order, idx) => (
                  <div 
                    key={order.id} 
                    className="p-8 rounded-[2rem] border border-slate-100 hover:bg-slate-50 hover:shadow-xl transition-all duration-500 flex justify-between items-center group animate-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-lg mb-1">{order.productName}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Reference #{order.id.slice(0, 12)}</p>
                      <p className="text-xs text-slate-500 mt-2">{new Date(order.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                      <ChevronRight size={18} className="text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'measurements' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-8">
            <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-4">
                  <Ruler className="text-indigo-600" />
                  Your Unique Fit
                </h2>
                <button 
                  onClick={() => editMeasurements ? handleSaveMeasurements() : setEditMeasurements(true)}
                  className={`p-4 rounded-2xl transition-all shadow-lg ${editMeasurements ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                >
                  {editMeasurements ? <Save size={20} /> : <Edit2 size={20} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-10">
                {Object.entries(measurements).map(([key, val]) => (
                  <div key={key} className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{key}</label>
                    {editMeasurements ? (
                      <div className="relative">
                        <input 
                          type="number" 
                          className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-indigo-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-bold text-lg"
                          value={val}
                          onChange={(e) => setMeasurements({...measurements, [key]: Number(e.target.value)})}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-300">CM</span>
                      </div>
                    ) : (
                      <p className="text-4xl font-serif font-bold text-slate-900">{val || '—'}<span className="text-xs text-slate-400 ml-2 font-sans font-normal uppercase tracking-widest">cm</span></p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-900 text-white rounded-[3rem] p-16 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl transition-transform duration-[3s] group-hover:scale-150" />
               <Sparkles className="text-indigo-400 mb-8 animate-pulse" size={60} />
               <h3 className="text-3xl font-serif font-bold mb-6 relative">AI Fit Consultant</h3>
               <p className="text-indigo-200 mb-12 max-w-sm text-lg leading-relaxed font-light italic relative">
                 "Our intelligence analyzes your proportions to suggest the most flattering cuts from our upcoming collections."
               </p>
               {advice && (
                 <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl text-left border border-white/10 mb-10 animate-in fade-in zoom-in duration-700">
                   <p className="text-sm italic text-indigo-100 leading-relaxed">{advice}</p>
                 </div>
               )}
               <button 
                 onClick={getStyleAdvice}
                 disabled={loadingAdvice}
                 className="bg-white text-indigo-900 px-12 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
               >
                 {loadingAdvice ? <div className="w-4 h-4 border-2 border-indigo-900/30 border-t-indigo-900 rounded-full animate-spin" /> : <><Sparkles size={16} /> Analyze Silhouette</>}
               </button>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-3xl mx-auto bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-8">
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-12 flex items-center gap-4">
              <Settings className="text-indigo-600" />
              Vault Credentials
            </h2>
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Full Legal Name</label>
                  <input 
                    type="text" 
                    readOnly={!editProfile}
                    className={`w-full px-8 py-5 rounded-[1.5rem] border outline-none transition-all duration-500 font-bold ${editProfile ? 'bg-slate-50 border-indigo-200 ring-4 ring-indigo-500/5 shadow-inner' : 'bg-transparent border-transparent cursor-default'}`}
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Primary Phone</label>
                  <input 
                    type="tel" 
                    readOnly={!editProfile}
                    placeholder="+1 000 000 0000"
                    className={`w-full px-8 py-5 rounded-[1.5rem] border outline-none transition-all duration-500 font-bold ${editProfile ? 'bg-slate-50 border-indigo-200 ring-4 ring-indigo-500/5 shadow-inner' : 'bg-transparent border-transparent cursor-default'}`}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-8 border-t border-slate-50 flex flex-wrap gap-4">
                {editProfile ? (
                  <button onClick={handleSaveProfile} className="bg-indigo-600 text-white px-10 py-5 rounded-[1.2rem] font-bold text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-100 flex items-center gap-2 hover:bg-slate-900 transition-all"><Save size={16} /> Commit Updates</button>
                ) : (
                  <button onClick={() => setEditProfile(true)} className="bg-slate-900 text-white px-10 py-5 rounded-[1.2rem] font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200"><Edit2 size={16} /> Edit Credentials</button>
                )}
                <button 
                  onClick={handlePasswordReset}
                  className="bg-white text-slate-500 border border-slate-200 px-10 py-5 rounded-[1.2rem] font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  <Lock size={16} /> Dispatch Reset Link
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
