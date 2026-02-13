
import React, { useState } from 'react';
import { Appointment } from '../types';
import { Calendar, Clock, Scissors, Ruler, MessageSquare } from 'lucide-react';

interface AppointmentsProps {
  onBook: (date: string, time: string, purpose: Appointment['purpose']) => void;
  existingAppointments: Appointment[];
}

const Appointments: React.FC<AppointmentsProps> = ({ onBook, existingAppointments }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [purpose, setPurpose] = useState<Appointment['purpose']>('Consultation');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) return;
    onBook(date, time, purpose);
    setDate('');
    setTime('');
  };

  const purposes = [
    { name: 'Consultation', icon: <MessageSquare size={20} />, description: 'Discuss a new design idea or fabric choice.' },
    { name: 'Measurement', icon: <Ruler size={20} />, description: 'Get professional measurements taken for your profile.' },
    { name: 'Fitting', icon: <Scissors size={20} />, description: 'Try on your garment-in-progress for adjustments.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-8">
          <div>
            <h1 className="text-5xl font-serif font-bold text-slate-900 mb-6">Book an Appointment</h1>
            <p className="text-slate-600 text-lg leading-relaxed">
              Experience the true luxury of personalized tailoring. Our studio is open for consultations, fittings, and professional measurement sessions.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mt-1">
                <Calendar size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Visit Our Atelier</h4>
                <p className="text-sm text-slate-500">123 Artisan Row, Milan, IT</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mt-1">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Studio Hours</h4>
                <p className="text-sm text-slate-500">Mon - Sat: 10:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <h3 className="text-xl font-bold mb-6 text-slate-800">Why book a fitting?</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-2"><span>•</span> Ensure absolute precision in every seam.</li>
              <li className="flex gap-2"><span>•</span> Feel the weight and texture of our premium fabrics.</li>
              <li className="flex gap-2"><span>•</span> One-on-one session with Elena for style advice.</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Type of Session</label>
              <div className="grid grid-cols-1 gap-4">
                {purposes.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setPurpose(p.name as Appointment['purpose'])}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                      purpose === p.name 
                      ? 'border-indigo-600 bg-indigo-50 shadow-inner' 
                      : 'border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <div className={`${purpose === p.name ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {p.icon}
                    </div>
                    <div>
                      <p className={`font-bold ${purpose === p.name ? 'text-indigo-900' : 'text-slate-700'}`}>{p.name}</p>
                      <p className="text-xs text-slate-500">{p.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block uppercase tracking-wider">Time</label>
                <input 
                  type="time" 
                  required
                  className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              Request Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
