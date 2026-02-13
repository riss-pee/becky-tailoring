
import React from 'react';
import { ArrowRight, Star, Clock, Ruler } from 'lucide-react';

const Home: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 scale-105 animate-[pulse_8s_infinite]">
          <img 
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&q=80&w=2000" 
            alt="Tailoring" 
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </div>
        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-tight animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
            Artistry in Every <span className="italic text-indigo-400">Stitch.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light mb-12 text-slate-200 tracking-wide animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 ease-out">
            Bespoke tailoring that fits your body, reflects your personality, and lasts a lifetime.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-in fade-in slide-in-from-bottom-20 duration-1000 delay-500 ease-out">
            <button 
              onClick={() => onNavigate('shop')}
              className="bg-indigo-600 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-indigo-700 transition-all hover:scale-110 shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center gap-3 active:scale-95"
            >
              Explore Collection <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('appointments')}
              className="bg-white/10 backdrop-blur-md text-white border border-white/30 px-10 py-5 rounded-full font-bold text-lg hover:bg-white/20 transition-all hover:scale-105 active:scale-95"
            >
              Book a Fitting
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        <div className="space-y-6 group p-8 rounded-[2.5rem] transition-all duration-500 hover:bg-white hover:shadow-[0_40px_80px_rgba(15,23,42,0.05)] border border-transparent hover:border-slate-100 animate-in fade-in zoom-in duration-700 delay-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-6 group-hover:scale-110">
            <Ruler size={36} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-800">Perfect Fit</h3>
          <p className="text-slate-500 leading-relaxed">We store your measurements securely so every order is custom-made to your unique silhouette.</p>
        </div>
        <div className="space-y-6 group p-8 rounded-[2.5rem] transition-all duration-500 hover:bg-white hover:shadow-[0_40px_80px_rgba(15,23,42,0.05)] border border-transparent hover:border-slate-100 animate-in fade-in zoom-in duration-700 delay-200">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:bg-amber-600 group-hover:text-white group-hover:-rotate-6 group-hover:scale-110">
            <Star size={36} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-800">Premium Quality</h3>
          <p className="text-slate-500 leading-relaxed">Only the finest silk, linen, and wool sourced from traditional textile mills around the world.</p>
        </div>
        <div className="space-y-6 group p-8 rounded-[2.5rem] transition-all duration-500 hover:bg-white hover:shadow-[0_40px_80px_rgba(15,23,42,0.05)] border border-transparent hover:border-slate-100 animate-in fade-in zoom-in duration-700 delay-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto transition-all duration-500 group-hover:bg-emerald-600 group-hover:text-white group-hover:rotate-6 group-hover:scale-110">
            <Clock size={36} />
          </div>
          <h3 className="text-2xl font-serif font-bold text-slate-800">Timely Delivery</h3>
          <p className="text-slate-500 leading-relaxed">Stay informed with live updates on your order's journey from drawing board to pickup.</p>
        </div>
      </section>

      {/* Showcase Image */}
      <section className="bg-slate-900 text-white overflow-hidden rounded-[4rem] mx-4 md:mx-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 py-24 px-12 md:px-24 space-y-8">
            <span className="text-indigo-400 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">The Process</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold leading-tight">Meticulously Crafted by Hand</h2>
            <p className="text-lg text-slate-400 leading-relaxed font-light">
              Every garment starts as a blank canvas. From the first chalk mark on the fabric to the final press of the seams, 
              our lead seamstress Elena brings years of expertise in haute couture to every single stitch.
            </p>
            <button 
              onClick={() => onNavigate('shop')}
              className="group text-white border-b-2 border-indigo-500/30 pb-2 hover:border-indigo-400 transition-all inline-flex items-center gap-3 font-bold text-lg"
            >
              View the Collection <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <div className="lg:w-1/2 h-[700px] w-full relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&q=80&w=1200" 
              alt="Tailor working" 
              className="w-full h-full object-cover transition-transform duration-[10s] hover:scale-125"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
