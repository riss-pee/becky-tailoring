
import React, { useState, useRef, useEffect } from 'react';
import { Order, Appointment, User, Product, AppNotification, Measurements } from '../types';
// Fixed missing UserIcon and Phone imports from lucide-react
import { 
  Package, Calendar as CalendarIcon, Users, User as UserIcon, ShoppingBag, Plus, Bell, CheckCircle, XCircle, 
  Scissors, X, History, Clock, Send, Mail, Phone, Ruler, Save, Edit2, AlertTriangle, 
  Minus, ChevronLeft, ChevronRight, List, Calendar, Info, Hash, CalendarDays, ExternalLink
} from 'lucide-react';
import { generateProductDescription, generateEmailDraft } from '../services/geminiService';
import { MOCK_ADMIN } from '../constants';

interface AdminDashboardProps {
  orders: Order[];
  appointments: Appointment[];
  users: User[];
  products: Product[];
  notifications: AppNotification[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onUpdateOrder: (id: string, status: Order['status']) => void;
  onUpdateAppointment: (id: string, status: Appointment['status']) => void;
  onUpdateMeasurements: (userId: string, measurements: Measurements) => void;
  onMarkRead: () => void;
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<Product | null>;
  onEditProduct: (product: Product) => Promise<void>;
}

const LOW_STOCK_THRESHOLD = 5;

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  orders, appointments, users, products, notifications, setProducts, 
  onUpdateOrder, onUpdateAppointment, onUpdateMeasurements, onMarkRead,
  onAddProduct, onEditProduct
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'appointments' | 'inventory' | 'clients'>('orders');
  const [apptViewMode, setApptViewMode] = useState<'list' | 'calendar'>('list');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingClientHistoryId, setViewingClientHistoryId] = useState<string | null>(null);
  const [measurementModal, setMeasurementModal] = useState<{ userId: string; appointmentId?: string } | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, stock: 1, category: 'Dress' as any, image: '' });
  const [loadingAI, setLoadingAI] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  
  const [isEditingHistoryMeasurements, setIsEditingHistoryMeasurements] = useState(false);
  const [tempHistoryMeasurements, setTempHistoryMeasurements] = useState<Measurements>({ bust: 0, waist: 0, hips: 0, inseam: 0, shoulder: 0, height: 0 });

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [tempMeasurements, setTempMeasurements] = useState<Measurements>({ bust: 0, waist: 0, hips: 0, inseam: 0, shoulder: 0, height: 0 });
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean; draft: string; clientName: string; orderId: string } | null>(null);
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  const sendEmail = () => {
    if (emailModal) {
      alert(`Bespoke notification sent to ${emailModal.clientName} regarding Order #${emailModal.orderId.slice(0, 8)}.`);
      setEmailModal(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const lowStockItems = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleStatusChange = async (order: Order, newStatus: Order['status']) => {
    onUpdateOrder(order.id, newStatus);
    if (newStatus === 'ready') {
      await handleNotifyClient(order);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return alert("Please fill in basic details.");
    setLoadingAI(true);
    const aiDesc = await generateProductDescription(newProduct.name);
    const result = await onAddProduct({
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      description: aiDesc,
      category: newProduct.category,
      image: newProduct.image || 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e',
    });

    if (result) {
      setIsAddingProduct(false);
      setNewProduct({ name: '', price: 0, stock: 1, category: 'Dress', image: '' });
    }
    setLoadingAI(false);
  };

  const handleUpdateProduct = async () => {
    if (editingProduct) {
      await onEditProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const adjustStock = async (product: Product, amount: number) => {
    const updated = { ...product, stock: Math.max(0, product.stock + amount) };
    await onEditProduct(updated);
  };

  const handleNotifyClient = async (order: Order) => {
    setIsDraftingEmail(true);
    const draft = await generateEmailDraft(
      order.userName,
      order.productName,
      MOCK_ADMIN.name,
      MOCK_ADMIN.phone
    );
    setEmailModal({
      isOpen: true,
      draft,
      clientName: order.userName,
      orderId: order.id
    });
    setIsDraftingEmail(false);
  };

  const openMeasurementModal = (userId: string, apptId?: string) => {
    const user = users.find(u => u.id === userId);
    setTempMeasurements(user?.measurements || { bust: 0, waist: 0, hips: 0, inseam: 0, shoulder: 0, height: 0 });
    setMeasurementModal({ userId, appointmentId: apptId });
  };

  const saveMeasurements = () => {
    if (measurementModal) {
      onUpdateMeasurements(measurementModal.userId, tempMeasurements);
      setMeasurementModal(null);
    }
  };

  const saveHistoryMeasurements = () => {
    if (viewingClientHistoryId) {
      onUpdateMeasurements(viewingClientHistoryId, tempHistoryMeasurements);
      setIsEditingHistoryMeasurements(false);
    }
  };

  const selectedClient = users.find(u => u.id === viewingClientHistoryId);
  const clientOrders = orders.filter(o => o.userId === viewingClientHistoryId);
  const clientAppointments = appointments.filter(a => a.userId === viewingClientHistoryId);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setViewDate(new Date(currentYear, currentMonth + offset, 1));
  };

  const stats = [
    { label: 'Active Orders', value: orders.filter(o => o.status !== 'completed').length, icon: <Package className="text-indigo-600" /> },
    { label: 'Today\'s Visits', value: appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: <CalendarIcon className="text-amber-600" /> },
    { label: 'Total Clients', value: users.length, icon: <Users className="text-emerald-600" /> },
    { label: 'Low Stock', value: lowStockItems.length, icon: <AlertTriangle className={lowStockItems.length > 0 ? "text-rose-600" : "text-slate-400"} /> },
  ];

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    sewing: 'bg-blue-100 text-blue-700 border-blue-200',
    ready: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    completed: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2 italic">Atelier Management</h1>
          <p className="text-slate-500">Master your craft and oversee all bespoke journeys.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => { onMarkRead(); setActiveTab('appointments'); }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative hover:bg-slate-50 transition-all hover:scale-105"
          >
            <Bell className="text-slate-600" size={20} />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">{unreadCount}</span>}
          </button>
          <button 
            onClick={() => setIsAddingProduct(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus size={20} /> New Design
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
            <div className="p-4 bg-slate-50 rounded-2xl transition-colors group-hover:bg-indigo-50">{stat.icon}</div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center border-b border-slate-100 bg-white sticky top-0 z-20">
          <button onClick={() => scrollTabs('left')} className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors border-r border-slate-100"><ChevronLeft size={20} /></button>
          <div ref={tabContainerRef} className="flex flex-grow overflow-x-hidden no-scrollbar whitespace-nowrap">
            {['orders', 'appointments', 'inventory', 'clients'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab as any)} 
                className={`flex-shrink-0 px-10 py-6 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-indigo-600 rounded-t-full" />}
              </button>
            ))}
          </div>
          <button onClick={() => scrollTabs('right')} className="p-4 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors border-l border-slate-100"><ChevronRight size={20} /></button>
        </div>

        <div className="p-10">
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-8">
              {orders.length === 0 ? <div className="py-20 text-center text-slate-400 italic">No orders yet. Start your collection!</div> : orders.map((order) => (
                <div key={order.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 rounded-3xl border border-slate-100 hover:bg-slate-50/50 hover:shadow-lg transition-all gap-4">
                  <div className="flex items-center gap-6">
                    <div className={`p-5 rounded-2xl ${order.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}><Package size={24} /></div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{order.productName}</h4>
                      <p className="text-sm text-slate-500 font-light">Client: <span className="font-bold">{order.userName}</span> • ID: <span className="font-mono text-xs">{order.id.slice(0, 8)}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">${order.price}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order, e.target.value as any)}
                      className="bg-white border border-slate-200 text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="sewing">Sewing</option>
                      <option value="ready">Ready for Pickup</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem]">
                <div className="flex items-center gap-4">
                  <button onClick={() => changeMonth(-1)} className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all"><ChevronLeft size={20} /></button>
                  <h3 className="text-xl font-serif font-bold text-slate-900 min-w-[200px] text-center">{monthNames[currentMonth]} {currentYear}</h3>
                  <button onClick={() => changeMonth(1)} className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all"><ChevronRight size={20} /></button>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setApptViewMode('list')} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${apptViewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}><List size={16} /> List View</button>
                  <button onClick={() => setApptViewMode('calendar')} className={`px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all ${apptViewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-200'}`}><CalendarIcon size={16} /> Calendar View</button>
                </div>
              </div>

              {apptViewMode === 'list' ? (
                <div className="space-y-4">
                  {appointments.length === 0 ? <div className="py-20 text-center text-slate-400 italic">No appointments scheduled.</div> : appointments.map((appt) => (
                    <div key={appt.id} className="flex flex-col md:flex-row items-center justify-between p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-xl transition-all gap-4">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">{appt.date.split('-')[2]}</div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{appt.userName}</h4>
                          <p className="text-sm text-slate-500">{appt.purpose} • <span className="font-bold text-indigo-600">{appt.time}</span></p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => openMeasurementModal(appt.userId, appt.id)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center gap-2"><Ruler size={14} /> Log Measurements</button>
                        {appt.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button onClick={() => onUpdateAppointment(appt.id, 'confirmed')} className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"><CheckCircle size={24} /></button>
                            <button onClick={() => onUpdateAppointment(appt.id, 'cancelled')} className="p-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"><XCircle size={24} /></button>
                          </div>
                        ) : <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{appt.status}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-slate-100 rounded-[3rem] bg-slate-50/30 p-10 shadow-inner">
                  <div className="grid grid-cols-7 mb-8">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase py-2 tracking-widest">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-4">
                    {emptyDays.map(d => <div key={`empty-${d}`} className="aspect-square bg-white/20 rounded-[2rem]" />)}
                    {calendarDays.map(day => {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const dayAppts = appointments.filter(a => a.date === dateStr);
                      return (
                        <div key={day} className="aspect-square bg-white border border-slate-100 rounded-[2rem] p-4 flex flex-col items-center hover:shadow-2xl hover:-translate-y-1 transition-all relative group overflow-hidden">
                          <span className="text-sm font-bold text-slate-400 mb-2">{day}</span>
                          <div className="flex flex-col gap-1 w-full">
                            {dayAppts.slice(0, 3).map(a => <div key={a.id} className={`h-1.5 w-full rounded-full ${a.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />)}
                          </div>
                          {dayAppts.length > 0 && <div className="absolute inset-0 bg-indigo-900/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-3 text-white text-center"><p className="text-xs font-bold">{dayAppts.length} Appts</p><button onClick={() => setApptViewMode('list')} className="text-[10px] underline mt-1">View Details</button></div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-8">
              {products.map((p) => (
                <div key={p.id} className="group bg-slate-50 p-8 rounded-[3rem] border border-slate-100 hover:shadow-2xl transition-all duration-700">
                  <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                    {p.stock <= LOW_STOCK_THRESHOLD && <div className="absolute top-6 left-6 bg-rose-500 text-white text-[10px] font-bold px-4 py-2 rounded-full animate-pulse shadow-lg shadow-rose-900/20">CRITICAL STOCK</div>}
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div><h4 className="font-bold text-slate-900 text-xl group-hover:text-indigo-600 transition-colors">{p.name}</h4><p className="text-indigo-600 font-bold text-lg">${p.price}</p></div>
                    <div className="text-right"><p className={`text-2xl font-bold ${p.stock <= LOW_STOCK_THRESHOLD ? 'text-rose-600' : 'text-slate-900'}`}>{p.stock}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</p></div>
                  </div>
                  <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 mb-6">
                    <button onClick={() => adjustStock(p, -1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><Minus size={18} /></button>
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-widest">Adjustment</span>
                    <button onClick={() => adjustStock(p, 1)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"><Plus size={18} /></button>
                  </div>
                  <button onClick={() => setEditingProduct(p)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl active:scale-95">Modify Design Profile</button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="overflow-x-auto animate-in slide-in-from-bottom-8">
              <table className="w-full border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-left">
                    <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Atelier Client Profile</th>
                    <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Bespoke Activity</th>
                    <th className="px-8 pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Vault Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">No registered clients found.</td></tr> : users.map((u) => (
                    <tr key={u.id} className="group hover:-translate-y-1 transition-all duration-500">
                      <td className="bg-slate-50 group-hover:bg-white border-y border-l border-slate-100 group-hover:shadow-2xl group-hover:shadow-slate-200/50 rounded-l-[2.5rem] px-8 py-8 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-white text-indigo-600 rounded-2xl flex items-center justify-center font-serif font-bold text-2xl shadow-inner border border-slate-100">{u.name.charAt(0)}</div>
                          <div><p className="font-bold text-slate-900 text-lg">{u.name}</p><p className="text-xs text-slate-400 font-mono tracking-tighter">{u.email}</p></div>
                        </div>
                      </td>
                      <td className="bg-slate-50 group-hover:bg-white border-y border-slate-100 group-hover:shadow-2xl group-hover:shadow-slate-200/50 px-8 py-8 text-center transition-all">
                        <span className="px-4 py-2 bg-white text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-slate-100">{orders.filter(o => o.userId === u.id).length} Orders</span>
                      </td>
                      <td className="bg-slate-50 group-hover:bg-white border-y border-r border-slate-100 group-hover:shadow-2xl group-hover:shadow-slate-200/50 rounded-r-[2.5rem] px-8 py-8 text-right transition-all">
                        <button onClick={() => { setViewingClientHistoryId(u.id); setTempHistoryMeasurements(u.measurements || { bust: 0, waist: 0, hips: 0, inseam: 0, shoulder: 0, height: 0 }); }} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-2 justify-end shadow-lg shadow-indigo-100"><History size={14} /> Full Portfolio & Fit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Complete Client History Portfolio Modal */}
      {viewingClientHistoryId && selectedClient && (
        <div className="fixed inset-0 z-[110] flex items-stretch">
          <div className="flex-grow bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-700" onClick={() => { setViewingClientHistoryId(null); setIsEditingHistoryMeasurements(false); }} />
          <div className="w-full max-w-5xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-700 ease-out overflow-hidden rounded-l-[4rem]">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-3xl flex items-center justify-center font-serif text-4xl font-bold shadow-2xl">{selectedClient.name.charAt(0)}</div>
                <div><h2 className="text-3xl font-serif font-bold text-slate-900">{selectedClient.name}</h2><p className="text-slate-400 text-sm tracking-widest uppercase font-bold flex items-center gap-2 mt-1"><UserIcon size={14} className="text-indigo-600" /> Secure Client Portfolio</p></div>
              </div>
              <button onClick={() => { setViewingClientHistoryId(null); setIsEditingHistoryMeasurements(false); }} className="p-4 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X size={32} /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-12 space-y-16 no-scrollbar">
              {/* Profile Overview Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4">Contact Secure Data</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-slate-700"><Mail size={16} className="text-indigo-400" /> {selectedClient.email}</div>
                    <div className="flex items-center gap-3 text-slate-700"><Phone size={16} className="text-indigo-400" /> {selectedClient.phone || 'No phone recorded'}</div>
                  </div>
                </div>
                <div className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-amber-100">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-[0.2em] mb-4">Atelier Summary</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Total Bespoke Pieces</span>
                      <span className="font-bold text-slate-900">{clientOrders.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-sm">Fittings Completed</span>
                      <span className="font-bold text-slate-900">{clientAppointments.filter(a => a.status === 'confirmed').length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Measurements Section - DIRECT EDITING SUPPORT */}
              <section className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-xl shadow-slate-100/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <div><h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3"><Ruler className="text-indigo-600" /> Silhouette Vault (cm)</h3><p className="text-slate-400 text-xs mt-1">Stored measurements for perfect bespoke tailoring.</p></div>
                  <button 
                    onClick={() => isEditingHistoryMeasurements ? saveHistoryMeasurements() : setIsEditingHistoryMeasurements(true)}
                    className={`px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-3 transition-all ${isEditingHistoryMeasurements ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                  >
                    {isEditingHistoryMeasurements ? <><Save size={18} /> Update Vault</> : <><Edit2 size={18} /> Edit Fit</>}
                  </button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                  {Object.entries(tempHistoryMeasurements).map(([key, val]) => (
                    <div key={key} className="space-y-3 p-6 bg-slate-50 rounded-[1.5rem] border border-transparent transition-all group hover:bg-white hover:border-slate-100 hover:shadow-lg">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{key}</label>
                      {isEditingHistoryMeasurements ? (
                        <div className="relative">
                          <input type="number" className="w-full bg-white px-6 py-4 rounded-xl border border-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-slate-800" value={val} onChange={(e) => setTempHistoryMeasurements({...tempHistoryMeasurements, [key]: Number(e.target.value)})} />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold uppercase">cm</span>
                        </div>
                      ) : <p className="text-3xl font-serif font-bold text-slate-900">{val || '-'}<span className="text-xs text-slate-400 ml-2 font-sans font-normal uppercase tracking-widest">cm</span></p>}
                    </div>
                  ))}
                </div>
              </section>

              {/* Enhanced Order History Section */}
              <section className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3"><ShoppingBag className="text-indigo-600" /> Handcrafted Order History</h3>
                <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Hash size={12} className="inline mr-1" /> Order ID</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Design</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Lifecycle Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"><CalendarDays size={12} className="inline mr-1" /> Request Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientOrders.length === 0 ? <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic">No historical orders on file.</td></tr> : clientOrders.map(o => (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{o.id.slice(0, 12)}</td>
                          <td className="px-8 py-6 font-bold text-slate-800">{o.productName}</td>
                          <td className="px-8 py-6 text-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColors[o.status]}`}>{o.status}</span></td>
                          <td className="px-8 py-6 text-right text-sm text-slate-500 font-light">{new Date(o.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Enhanced Appointment History Section */}
              <section className="space-y-8">
                <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3"><CalendarIcon className="text-indigo-600" /> Appointment Narrative</h3>
                <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><Hash size={12} className="inline mr-1" /> Appt ID</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purpose</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right"><Clock size={12} className="inline mr-1" /> Schedule</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {clientAppointments.length === 0 ? <tr><td colSpan={4} className="px-8 py-10 text-center text-slate-400 italic">No historical visits recorded.</td></tr> : clientAppointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-mono text-[10px] text-slate-400">{a.id.slice(0, 12)}</td>
                          <td className="px-8 py-6 font-bold text-slate-800">{a.purpose}</td>
                          <td className="px-8 py-6 text-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${a.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{a.status}</span></td>
                          <td className="px-8 py-6 text-right"><p className="text-sm font-bold text-slate-900">{a.date}</p><p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{a.time}</p></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* Measurement Modal for Appointment List */}
      {measurementModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setMeasurementModal(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-500">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4 flex items-center gap-3"><Ruler className="text-indigo-600" /> Record Client Fit</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-light italic">Take precise measurements during the fitting session to update the client's silhouette vault.</p>
            <div className="grid grid-cols-2 gap-6 mb-10">
              {Object.entries(tempMeasurements).map(([key, val]) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{key}</label>
                  <div className="relative">
                    <input type="number" className="w-full bg-slate-50 px-6 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-bold" value={val} onChange={(e) => setTempMeasurements({...tempMeasurements, [key]: Number(e.target.value)})} />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-bold uppercase">cm</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={saveMeasurements} className="w-full bg-indigo-600 text-white py-6 rounded-3xl font-bold shadow-2xl shadow-indigo-200 active:scale-95 transition-all uppercase tracking-widest text-xs">Securely Save to Profile</button>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setEmailModal(null)} />
          <div className="relative bg-white w-full max-w-3xl rounded-[4rem] p-16 shadow-2xl animate-in slide-in-from-bottom-12 duration-700">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2 flex items-center gap-4"><Mail className="text-indigo-600" /> Client Pickup Notification</h2>
                <p className="text-slate-500 font-light">Drafted automatically based on order details. Review and send to <strong>{emailModal.clientName}</strong>.</p>
              </div>
              <button onClick={() => setEmailModal(null)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <textarea 
              rows={12} 
              className="w-full bg-slate-50 p-10 rounded-[2rem] border border-slate-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-serif leading-relaxed text-lg italic shadow-inner mb-10" 
              value={emailModal.draft} 
              onChange={(e) => setEmailModal({...emailModal, draft: e.target.value})}
            />
            <button onClick={sendEmail} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-bold flex items-center justify-center gap-4 shadow-2xl shadow-indigo-900/20 hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-widest text-xs"><Send size={20} /> Transmit Official Pickup Notification</button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsAddingProduct(false)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-500">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><Scissors className="text-indigo-600" /> New Atelier Design</h2>
            <div className="space-y-6">
              <input type="text" placeholder="Design Name (e.g., Silk Summer Robe)" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Base Price ($)</label><input type="number" placeholder="450" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})} /></div>
                <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Initial Stock</label><input type="number" placeholder="5" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Category</label><select className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value as any})}><option>Dress</option><option>Suit</option><option>Shirt</option><option>Other</option></select></div>
              <div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4">Showcase Image (URL)</label><input type="text" placeholder="https://..." className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} /></div>
              <button onClick={handleAddProduct} disabled={loadingAI} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-bold transition-all hover:bg-slate-900 shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-widest text-xs">{loadingAI ? <div className="flex items-center justify-center gap-3"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Drafting Copy...</div> : 'Publish Design to Shop'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setEditingProduct(null)} />
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-12 shadow-2xl animate-in zoom-in duration-500">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8 flex items-center gap-4"><Edit2 className="text-indigo-600" /> Modify Collection Item</h2>
            <div className="space-y-6">
              <input type="text" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} />
              <div className="grid grid-cols-2 gap-6">
                <input type="number" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})} />
                <input type="number" className="w-full bg-slate-50 px-8 py-5 rounded-[1.5rem] border border-slate-200 outline-none" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} />
              </div>
              <textarea rows={4} className="w-full bg-slate-50 px-10 py-6 rounded-[2rem] border border-slate-200 outline-none font-serif text-lg leading-relaxed shadow-inner italic" value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} />
              <button onClick={handleUpdateProduct} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-bold shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all uppercase tracking-widest text-xs">Commit Modifications</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
