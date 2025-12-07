
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Plus, Trash2, ChevronLeft, ChevronRight, FileDown } from 'lucide-react';
import { CalendarEvent } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ScoutingCalendarProps {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

type ViewMode = 'month' | 'week' | 'day';

const ScoutingCalendar: React.FC<ScoutingCalendarProps> = ({ events, setEvents }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const prevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() - 1);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() - 7);
    else newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + 1);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + 7);
    else newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const formatDateDe = (date: Date) => {
      return date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' });
  };

  const handleDownloadPDF = async () => {
      const element = document.getElementById('printable-content');
      if (element) {
          try {
              const canvas = await html2canvas(element as HTMLElement, {
                  scale: 3, // Higher scale for crisp text
                  backgroundColor: '#1e293b', 
                  ignoreElements: (el) => el.classList.contains('no-pdf') 
              });
              
              const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
              const primaryColor = [251, 191, 36]; // Yellow-400
              const secondaryColor = [30, 41, 59]; // Slate-800

              // Header
              doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
              doc.rect(0, 0, 297, 20, 'F');
              doc.setFontSize(18);
              doc.setTextColor(255, 255, 255);
              doc.text("9011 SOCCER SCOUTING", 10, 13);
              doc.setFontSize(12);
              doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
              doc.text("KALENDER EXPORT", 280, 13, { align: 'right' });

              const imgData = canvas.toDataURL('image/png');
              const imgProps = doc.getImageProperties(imgData);
              
              // Dimensions
              const pageWidth = 297;
              const pageHeight = 210;
              const margin = 10;
              const availableWidth = pageWidth - (margin * 2);
              const availableHeight = pageHeight - 30 - margin; // Header takes 20, plus spacing
              
              let imgWidth = availableWidth;
              let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
              
              if (imgHeight > availableHeight) {
                  imgHeight = availableHeight;
                  imgWidth = (imgProps.width * imgHeight) / imgProps.height;
              }

              const x = margin + (availableWidth - imgWidth) / 2;
              const y = 25 + (availableHeight - imgHeight) / 2;

              doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
              
              doc.setFontSize(8);
              doc.setTextColor(100);
              doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 10, 205);

              doc.save('Kalender_Export.pdf');
          } catch (err) {
              console.error("PDF Export failed", err);
              alert("Fehler beim PDF Export.");
          }
      }
  };

  // --- Render Month View ---
  const renderMonthView = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const startingSlot = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    return (
        <>
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
                        <div key={day} className={`bg-slate-900/50 border ${isToday ? 'border-yellow-400' : 'border-slate-700'} rounded p-1 h-24 overflow-hidden relative group`}>
                            <div className={`text-xs font-bold mb-1 ${isToday ? 'text-yellow-400 font-black' : 'text-slate-500'}`}>{day}</div>
                            <div className="flex flex-col gap-1">
                                {dayEvts.map(evt => (
                                    <div key={evt.id} className={`text-[9px] rounded px-1 py-0.5 truncate ${
                                         evt.type === 'Scouting' ? 'bg-purple-600 text-white' : 
                                         evt.type === 'Match' ? 'bg-green-600 text-white' :
                                         'bg-slate-700 text-white'
                                    }`} title={evt.title}>
                                        {evt.time} {evt.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
  };

  // --- Render Week View ---
  const renderWeekView = () => {
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(currentDate);
      monday.setDate(diff);

      const weekDays = [];
      for(let i=0; i<7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          weekDays.push(d);
      }

      return (
          <div className="grid grid-cols-7 gap-2 h-[500px]">
              {weekDays.map((date, i) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayEvts = getDayEvents(dateStr);
                  const isToday = new Date().toISOString().split('T')[0] === dateStr;
                  
                  return (
                      <div key={i} className={`flex flex-col border ${isToday ? 'border-yellow-400' : 'border-slate-700'} rounded bg-slate-900/30 h-full`}>
                          <div className={`p-2 text-center text-sm font-bold border-b border-slate-700 ${isToday ? 'bg-yellow-400/10 text-yellow-400' : 'text-slate-300'}`}>
                              {date.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit' })}
                          </div>
                          <div className="p-1 flex-1 space-y-2 overflow-y-auto">
                              {dayEvts.map(evt => (
                                  <div key={evt.id} className="text-xs bg-slate-700 p-2 rounded">
                                      <div className="font-bold text-white">{evt.time}</div>
                                      <div className="text-slate-300 truncate">{evt.title}</div>
                                      {evt.location && <div className="text-[10px] text-slate-400 truncate">{evt.location}</div>}
                                  </div>
                              ))}
                          </div>
                      </div>
                  )
              })}
          </div>
      )
  };

  // --- Render Day View ---
  const renderDayView = () => {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayEvts = getDayEvents(dateStr).sort((a,b) => a.time.localeCompare(b.time));

      return (
          <div className="min-h-[400px] border border-slate-700 rounded bg-slate-900/30 p-4">
              <h3 className="text-center font-bold text-xl text-white mb-6">{currentDate.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</h3>
              
              {dayEvts.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">Keine Termine für diesen Tag.</div>
              ) : (
                  <div className="space-y-4 max-w-2xl mx-auto">
                      {dayEvts.map(evt => (
                          <div key={evt.id} className="flex gap-4 p-4 bg-slate-800 rounded border border-slate-700">
                              <div className="text-lg font-bold text-yellow-400 w-20 shrink-0">{evt.time}</div>
                              <div className="flex-1">
                                  <div className="text-lg font-bold text-white">{evt.title}</div>
                                  <div className="flex gap-4 mt-2 text-sm text-slate-400">
                                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {evt.location || 'Kein Ort'}</span>
                                      <span className={`px-2 rounded text-xs py-0.5 ${
                                           evt.type === 'Scouting' ? 'bg-purple-900/50 text-purple-400' : 
                                           'bg-slate-700'
                                      }`}>{evt.type}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )
  };

  const getTitle = () => {
    if (viewMode === 'day') return 'Tagesansicht';
    if (viewMode === 'week') return 'Wochenansicht';
    return currentDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      
      {/* Calendar Grid */}
      <div id="printable-content" className="print-calendar-root lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
         {/* Controls - Hide on print using pure CSS in index.html, but keeping logic clean here */}
         <div className="flex flex-col md:flex-row justify-between items-center mb-6 no-pdf">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-yellow-400" />
                    {getTitle()}
                </h2>
                <div className="flex bg-slate-900 rounded p-1 border border-slate-700">
                    <button onClick={() => setViewMode('month')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'month' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Monat</button>
                    <button onClick={() => setViewMode('week')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'week' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Woche</button>
                    <button onClick={() => setViewMode('day')} className={`px-3 py-1 text-xs font-bold rounded ${viewMode === 'day' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>Tag</button>
                </div>
            </div>
            <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white mr-2" title="Als PDF speichern">
                    <FileDown className="w-4 h-4" />
                </button>
                <button onClick={prevPeriod} className="p-1 px-3 bg-slate-700 hover:bg-slate-600 rounded text-white"><ChevronLeft className="w-4 h-4" /></button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 bg-slate-700 hover:bg-slate-600 rounded text-white text-xs font-bold">Heute</button>
                <button onClick={nextPeriod} className="p-1 px-3 bg-slate-700 hover:bg-slate-600 rounded text-white"><ChevronRight className="w-4 h-4" /></button>
            </div>
         </div>

         {viewMode === 'month' && renderMonthView()}
         {viewMode === 'week' && renderWeekView()}
         {viewMode === 'day' && renderDayView()}
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
                        className="w-1/2 bg-slate-950 border border-slate-600 rounded p-2 text-white font-medium text-sm outline-none focus:border-yellow-400 appearance-none"
                      >
                          <option value="Match" className="bg-slate-900 text-white">Spiel</option>
                          <option value="Training" className="bg-slate-900 text-white">Training</option>
                          <option value="Meeting" className="bg-slate-900 text-white">Meeting</option>
                          <option value="Scouting" className="bg-slate-900 text-white">Scouting</option>
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
                                  <span className="flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> {formatDateDe(new Date(evt.date))}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.time}</span>
                              </div>
                              {evt.location && (
                                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" /> {evt.location}
                                  </div>
                              )}
                              <div className="mt-1">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                      evt.type === 'Match' ? 'bg-green-900/50 text-green-400' :
                                      evt.type === 'Scouting' ? 'bg-purple-900/50 text-purple-400' :
                                      'bg-slate-800 text-slate-400'
                                  }`}>{evt.type}</span>
                              </div>
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
