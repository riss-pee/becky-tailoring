
import React from 'react';
import { User, Role } from '../types';
import { Scissors, ShoppingBag, User as UserIcon, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems: { name: string; path: string; icon: React.ReactNode }[] = [];

  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin Dashboard', path: 'admin-dashboard', icon: <LayoutDashboard size={18} /> });
  } else {
    // Non-admin or guest
    navItems.push({ name: 'Shop', path: 'shop', icon: <ShoppingBag size={18} /> });
    navItems.push({ name: 'Appointments', path: 'appointments', icon: <Scissors size={18} /> });
    if (user) {
      navItems.push({ name: 'My Profile', path: 'user-dashboard', icon: <UserIcon size={18} /> });
    }
  }

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
                <Scissors className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 font-serif">Elegance Stitch</span>
            </button>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentPage === item.path ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}
            {!user ? (
              <button
                onClick={() => onNavigate('login')}
                className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-shadow hover:shadow-lg"
              >
                Sign In
              </button>
            ) : (
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-slate-600 hover:text-red-600 transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                onNavigate(item.path);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            >
              {item.icon}
              {item.name}
            </button>
          ))}
          {!user ? (
            <button
              onClick={() => {
                onNavigate('login');
                setIsOpen(false);
              }}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-xl font-medium shadow-md active:scale-[0.98] transition-transform"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full mt-4 flex items-center justify-center gap-3 text-red-600 py-3 rounded-xl border border-red-100 hover:bg-red-50"
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
