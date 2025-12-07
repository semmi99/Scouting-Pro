
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../types';

interface ScoutingCalendarProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

const ScoutingCalendar: React.FC<ScoutingCalendarProps> = ({ events, setEvents }) => {
  // Simple view: List of upcoming, plus a mini calendar grid logic
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    date: new Date().toISOString().split('T')[0],
    type: 'Match'
  });
  
  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    const evt: CalendarEvent = {
        id: Date.now().toString(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time || '15:30',
        location: newEvent.location || '',
        type: newEvent.type || 'Match'
    };
    setEvents([...events, evt]);
    setNewEvent({ date: newEvent.date, type: 'Match', title: '', location: '', time: '' });
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const getDayEvents = (dateStr: string) => events.filter(e => e.date === dateStr);

  // Helper for grid generation
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  
  // Adjust so Monday is first
  const startingSlot = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

  const prevMonth = () => {
      if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
      else setCurrentMonth(currentMonth - 1);
  };

  const nextMonth = () => {
      if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
      else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-yellow-400" />
                {monthNames[currentMonth]} {currentYear}
            </h2>
            <div className="flex gap-2">
                <button onClick={prevMonth} className="p-1 px-3 bg-slate-700 hover:bg-slate-600 rounded text-white">&lt;</button>
                <button onClick={nextMonth} className="p-1 px-3 bg-slate-700 hover:bg-slate-600 rounded text-white">&gt;</button>
            </div>
         </div>

         <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-slate-400 uppercase">
             <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
         </div>
         <div className="grid grid-cols-7 gap-1 auto-rows-fr">
             {Array.from({ length: startingSlot }).map((_, i) => (
                 <div key={`empty-${i}`} className="bg-transparent h-24"></div>
             ))}
             {Array.from({ length: daysInMonth }).map((_, i) => {
                 const day = i + 1;
                 const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                 const dayEvts = getDayEvents(dateStr);
                 const isToday = new Date().toISOString().split('T')[0] === dateStr;

                 return (
                     <div key={day} className={`bg-slate-900/50 border ${isToday ? 'border-yellow-400' : 'border-slate-700'} rounded p-1 h-24 overflow-hidden relative group hover:border-slate-500 transition-colors`}>
                         <div className={`text-xs font-bold mb-1 ${isToday ? 'text-yellow-400' : 'text-slate-500'}`}>{day}</div>
                         <div className="flex flex-col gap-1">
                             {dayEvts.slice(0, 3).map(evt => (
                                 <div key={evt.id} className="text-[9px] bg-slate-700 text-white rounded px-1 py-0.5 truncate" title={evt.title}>
                                     {evt.time} {evt.title}
                                 </div>
                             ))}
                             {dayEvts.length > 3 && <div className="text-[8px] text-slate-500 text-center">+{dayEvts.length - 3} weitere</div>}
                         </div>
                     </div>
                 );
             })}
         </div>
      </div>

      {/* Sidebar: Add Event & Upcoming */}
      <div className="space-y-6">
          
          {/* Add Event Form */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
              <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Termin hinzufügen</h3>
              <div className="space-y-3">
                  <input 
                    type="text" placeholder="Titel / Spielpaarung" 
                    value={newEvent.title || ''}
                    onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-400"
                  />
                  <input 
                    type="date" 
                    value={newEvent.date || ''}
                    onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-400"
                  />
                  <div className="flex gap-2">
                     <input 
                        type="time" 
                        value={newEvent.time || ''}
                        onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                        className="w-1/2 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-400"
                     />
                      <select
                        value={newEvent.type}
                        onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                        className="w-1/2 bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-400"
                      >
                          <option value="Match">Spiel</option>
                          <option value="Training">Training</option>
                          <option value="Meeting">Meeting</option>
                      </select>
                  </div>
                  <input 
                    type="text" placeholder="Ort" 
                    value={newEvent.location || ''}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm outline-none focus:border-yellow-400"
                  />
                  <button 
                    onClick={addEvent}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                      <Plus className="w-4 h-4" /> Speichern
                  </button>
              </div>
          </div>

          {/* List View */}
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg max-h-[400px] overflow-y-auto">
              <h3 className="font-bold text-white mb-4 border-b border-slate-700 pb-2">Kommende Termine</h3>
              <div className="space-y-3">
                  {events
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .filter(e => new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
                    .slice(0, 10) // Show next 10
                    .map(evt => (
                      <div key={evt.id} className="bg-slate-900/50 p-3 rounded border border-slate-700 flex justify-between items-center group">
                          <div>
                              <div className="text-sm font-bold text-white">{evt.title}</div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {evt.date}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.time}</span>
                              </div>
                              {evt.location && (
                                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {evt.location}
                                  </div>
                              )}
                          </div>
                          <button onClick={() => removeEvent(evt.id)} className="text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
                  {events.length === 0 && <p className="text-slate-500 text-xs italic text-center">Keine Termine geplant.</p>}
              </div>
          </div>

      </div>
    </div>
  );
};

export default ScoutingCalendar;
