
import React, { useState, useEffect } from 'react';
import { AuthState, User, Product, Order, Appointment, Role, Measurements, AppNotification } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Shop from './pages/Shop';
import Appointments from './pages/Appointments';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [auth, setAuth] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<{title: string, msg: string} | null>(null);

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      await fetchProducts();
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, false); 
      }
      setLoading(false);
    };

    initApp();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchUserProfile(session.user.id, true);
        }
      } else if (event === 'SIGNED_OUT') {
        setAuth({ user: null, isAuthenticated: false });
        setOrders([]);
        setAppointments([]);
        setUsers([]);
        setNotifications([]);
        setCurrentPage('home');
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchUserProfile = async (userId: string, shouldRedirect: boolean) => {
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!error && profile) {
      setAuth({ user: profile, isAuthenticated: true });
      if (profile.role === 'admin') {
        await fetchAllAdminData();
        if (shouldRedirect) setCurrentPage('admin-dashboard');
      } else {
        await fetchUserData(profile.id);
        if (shouldRedirect) setCurrentPage('home');
      }
      return profile;
    }
    return null;
  };

  const fetchUserData = async (userId: string) => {
    const [{ data: userOrders }, { data: userAppts }] = await Promise.all([
      supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('appointments').select('*').eq('user_id', userId).order('date', { ascending: false })
    ]);
    if (userOrders) setOrders(userOrders.map(o => ({ ...o, userId: o.user_id, userName: o.user_name, productId: o.product_id, productName: o.product_name })) || []);
    if (userAppts) setAppointments(userAppts.map(a => ({ ...a, userId: a.user_id, userName: a.user_name })) || []);
  };

  const fetchAllAdminData = async () => {
    const [ordersRes, apptsRes, usersRes, notifsRes] = await Promise.all([
      supabase.from('orders').select('*').order('date', { ascending: false }),
      supabase.from('appointments').select('*').order('date', { ascending: false }),
      supabase.from('profiles').select('*').eq('role', 'user'),
      supabase.from('notifications').select('*').order('date', { ascending: false })
    ]);
    if (ordersRes.data) setOrders(ordersRes.data.map(o => ({ ...o, userId: o.user_id, userName: o.user_name, productId: o.product_id, productName: o.product_name })));
    if (apptsRes.data) setAppointments(apptsRes.data.map(a => ({ ...a, userId: a.user_id, userName: a.user_name })));
    if (usersRes.data) setUsers(usersRes.data);
    if (notifsRes.data) setNotifications(notifsRes.data);
  };

  const showSuccess = (title: string, msg: string) => {
    setSuccessMessage({ title, msg });
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const addOrder = async (product: Product) => {
    if (!auth.isAuthenticated || !auth.user) {
      setCurrentPage('login');
      return;
    }
    
    const newOrder = {
      user_id: auth.user.id,
      user_name: auth.user.name,
      product_id: product.id,
      product_name: product.name,
      status: 'pending',
      date: new Date().toISOString(),
      price: product.price,
    };

    const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
    if (error) {
      console.error("Order error:", error);
      return;
    }

    const formattedOrder = { ...data, userId: data.user_id, userName: data.user_name, productId: data.product_id, productName: data.product_name };
    setOrders([formattedOrder, ...orders]);
    await supabase.from('notifications').insert([{
      message: `New order from ${auth.user.name}: ${product.name}`,
      type: 'order',
      date: new Date().toISOString()
    }]);
    
    showSuccess("Bespoke Order Confirmed", `Your custom ${product.name} is now entering the creation phase.`);
  };

  const addAppointment = async (date: string, time: string, purpose: Appointment['purpose']) => {
    if (!auth.isAuthenticated || !auth.user) {
      setCurrentPage('login');
      return;
    }
    const newAppt = { user_id: auth.user.id, user_name: auth.user.name, date, time, purpose, status: 'pending' };
    const { data, error } = await supabase.from('appointments').insert([newAppt]).select().single();
    if (error) return;
    const formattedAppt = { ...data, userId: data.user_id, userName: data.user_name };
    setAppointments([formattedAppt, ...appointments]);
    await supabase.from('notifications').insert([{
      message: `New appointment from ${auth.user.name}`,
      type: 'appointment',
      date: new Date().toISOString()
    }]);
    showSuccess("Fitting Scheduled", "Your session request is received. Elena will review the atelier calendar.");
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
      if (status === 'ready') showSuccess("Client Notified", "An automated pickup notification has been prepared.");
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const { error } = await supabase.from('appointments').update({ status }).eq('id', id);
    if (!error) setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));
  };

  const updateMeasurements = async (userId: string, measurements: Measurements) => {
    const { error } = await supabase.from('profiles').update({ measurements }).eq('id', userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, measurements } : u));
      if (auth.user?.id === userId) {
        setAuth({ ...auth, user: { ...auth.user, measurements } });
        showSuccess("Silhouette Refined", "Your custom measurements have been updated.");
      }
    }
  };

  const markNotificationsRead = async () => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
    if (!error) setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleUpdateProfile = async (name: string, phone: string) => {
    if (!auth.user) return;
    const { error } = await supabase.from('profiles').update({ name, phone }).eq('id', auth.user.id);
    if (!error) {
      setAuth({ ...auth, user: { ...auth.user, name, phone } });
      showSuccess("Credentials Updated", "Your bespoke profile has been refined.");
    }
  };

  const handleAddProduct = async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    const { data, error } = await supabase.from('products').insert([product]).select().single();
    if (error) {
      console.error("Add design error:", error);
      return null;
    }
    setProducts([data, ...products]);
    showSuccess("New Design Published", `${product.name} is now available in the atelier.`);
    return data;
  };

  const handleUpdateProduct = async (product: Product) => {
    const { error } = await supabase.from('products').update(product).eq('id', product.id);
    if (error) {
      console.error("Modify design error:", error);
      return;
    }
    setProducts(products.map(p => p.id === product.id ? product : p));
    showSuccess("Design Modified", "The collection has been updated with your refinements.");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="text-center">
          <p className="font-serif italic text-2xl text-slate-800 mb-1">Elegance Stitch</p>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Loading Atelier Resources</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      {/* Top-Middle Success Toast */}
      {successMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-4 fade-in duration-500 w-full max-w-md px-4">
          <div className="bg-slate-900/95 backdrop-blur-2xl text-white p-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] border border-white/10 flex items-start gap-4 ring-1 ring-white/20">
            <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <div className="flex-grow pt-1">
              <h4 className="font-serif font-bold text-lg leading-none mb-2 tracking-tight">{successMessage.title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{successMessage.msg}</p>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-slate-500 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>
      )}

      <Navbar user={auth.user} onLogout={handleLogout} onNavigate={setCurrentPage} currentPage={currentPage} />
      
      <main className="flex-grow">
        <div>
          {currentPage === 'home' && <Home onNavigate={setCurrentPage} />}
          {currentPage === 'login' && <Login onLogin={() => {}} />}
          {currentPage === 'shop' && <Shop products={products} onBuy={addOrder} />}
          {currentPage === 'appointments' && <Appointments onBook={addAppointment} existingAppointments={appointments} />}
          {currentPage === 'user-dashboard' && auth.user && (
            <UserDashboard 
              user={auth.user} 
              orders={orders} 
              onUpdateMeasurements={updateMeasurements}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
          {currentPage === 'admin-dashboard' && auth.user?.role === 'admin' && (
            <AdminDashboard 
              orders={orders} appointments={appointments} users={users} products={products} notifications={notifications}
              setProducts={setProducts} onUpdateOrder={updateOrderStatus} onUpdateAppointment={updateAppointmentStatus}
              onUpdateMeasurements={updateMeasurements} onMarkRead={markNotificationsRead} onAddProduct={handleAddProduct} onEditProduct={handleUpdateProduct}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
