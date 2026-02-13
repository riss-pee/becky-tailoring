
import React, { useState } from 'react';
import { Product } from '../types';
import { ShoppingCart, Search, Loader2, Check } from 'lucide-react';

interface ShopProps {
  products: Product[];
  onBuy: (product: Product) => Promise<void>;
}

const Shop: React.FC<ShopProps> = ({ products, onBuy }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const categories = ['All', 'Dress', 'Suit', 'Shirt', 'Other'];

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'All' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOrder = async (product: Product) => {
    setLoadingId(product.id);
    try {
      await onBuy(product);
      setSuccessId(product.id);
      setTimeout(() => setSuccessId(null), 3000);
    } catch (error) {
      console.error("Order failed:", error);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="mb-16 text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">The Collection</h1>
        <p className="text-slate-500 text-lg md:text-xl font-light max-w-2xl mx-auto italic">Exquisite pieces ready for your personal measurements and individual silhouette.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-16">
        <div className="relative flex-grow group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-600" size={20} />
          <input 
            type="text" 
            placeholder="Search our atelier designs..."
            className="w-full pl-14 pr-6 py-5 rounded-[1.5rem] bg-white border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-xl shadow-slate-200/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 no-scrollbar items-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-4 rounded-2xl font-bold transition-all whitespace-nowrap active:scale-95 ${
                filter === cat 
                ? 'bg-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.3)]' 
                : 'bg-white text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredProducts.map((product, idx) => (
          <div 
            key={product.id} 
            className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.03)] hover:shadow-[0_40px_100px_rgba(15,23,42,0.08)] transition-all duration-700 border border-slate-100 flex flex-col animate-in slide-in-from-bottom-12"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="relative aspect-[4/5] overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-115"
              />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl font-serif font-bold text-xl text-indigo-600 shadow-xl shadow-indigo-900/10">
                ${product.price}
              </div>
              <div className="absolute inset-0 bg-indigo-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="p-10 flex-grow flex flex-col">
              <span className="text-indigo-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">{product.category}</span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">{product.name}</h3>
              <p className="text-slate-500 mb-8 line-clamp-2 text-sm leading-relaxed font-light">{product.description}</p>
              <button 
                onClick={() => handleOrder(product)}
                disabled={loadingId === product.id}
                className={`mt-auto w-full flex items-center justify-center gap-3 py-5 rounded-[1.2rem] font-bold transition-all shadow-xl active:scale-95 disabled:opacity-75 ${
                  successId === product.id 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-900 text-white hover:bg-indigo-600'
                }`}
              >
                {loadingId === product.id ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : successId === product.id ? (
                  <Check size={20} />
                ) : (
                  <ShoppingCart size={20} />
                )}
                {loadingId === product.id ? 'Processing...' : successId === product.id ? 'Order Placed' : 'Order Bespoke Fit'}
              </button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-32 text-center animate-in zoom-in duration-500">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
              <Search size={40} />
            </div>
            <p className="text-slate-400 text-xl font-serif italic">No silhouettes found matching your request.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
