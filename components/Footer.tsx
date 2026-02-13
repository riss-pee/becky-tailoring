
import React from 'react';
import { Scissors, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Scissors className="text-indigo-400" size={24} />
              <span className="text-2xl font-serif font-bold text-white italic">Elegance Stitch</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Timeless designs, handcrafted measurements, and the finest fabrics in the world. 
              Your style, our craft.
            </p>
          </div>
          <div className="text-center">
            <h4 className="text-white font-semibold mb-4 uppercase tracking-widest text-xs">Quick Links</h4>
            <div className="flex justify-center space-x-6">
              <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-indigo-400 transition-colors">Contact</a>
            </div>
          </div>
          <div className="md:text-right text-sm">
            <p className="flex items-center md:justify-end gap-1 mb-2">
              Made with <Heart size={14} className="text-red-500 fill-red-500" /> for bespoke fashion.
            </p>
            <p>&copy; 2024 Elegance Stitch Atelier. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
