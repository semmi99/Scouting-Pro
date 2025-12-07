
import React, { useState, useEffect } from 'react';
import TeamScouting from './components/TeamScouting';
import PlayerScouting from './components/PlayerScouting';
import ShadowTeams from './components/ShadowTeams';
import ScoutingCalendar from './components/ScoutingCalendar';
import MatchFinder from './components/MatchFinder';
import { ClipboardList, User, Users, Calendar, MapPin } from 'lucide-react';
import { CalendarEvent } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'player' | 'shadow' | 'calendar' | 'finder'>('team');
  
  // Initialize from LocalStorage or default
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('scouting_calendar_events');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Scouting: U19 Derby', date: new Date().toISOString().split('T')[0], time: '11:00', location: 'Sportpark Nord', type: 'Match' }
    ];
  });

  // Save to LocalStorage whenever events change
  useEffect(() => {
    localStorage.setItem('scouting_calendar_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const handleAddToCalendar = (evt: CalendarEvent) => {
      setCalendarEvents(prev => [...prev, evt]);
  };

  const navItems = [
      { id: 'team', label: 'Team-Scouting', icon: ClipboardList },
      { id: 'player', label: 'Spieler-Analyse', icon: User },
      { id: 'shadow', label: 'Schattenteam', icon: Users },
      { id: 'calendar', label: 'Kalender', icon: Calendar },
      { id: 'finder', label: 'Spielsuche', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-yellow-400 selection:text-slate-900">
      
      {/* App Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-slate-900 rounded-lg flex items-center justify-center border border-yellow-400">
                    <span className="font-black text-yellow-400 text-xs">9011</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight hidden md:block">Scouting<span className="text-yellow-400">Pro</span></h1>
            </div>
            
            <nav className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                            activeTab === item.id 
                            ? 'bg-slate-800 text-yellow-400 shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden lg:inline">{item.label}</span>
                    </button>
                ))}
            </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
            {activeTab === 'team' && <TeamScouting />}
            {activeTab === 'player' && <PlayerScouting />}
            {activeTab === 'shadow' && <ShadowTeams />}
            {activeTab === 'calendar' && <ScoutingCalendar events={calendarEvents} setEvents={setCalendarEvents} />}
            {activeTab === 'finder' && <MatchFinder onAddToCalendar={handleAddToCalendar} />}
        </div>
      </main>

      <footer className="border-t border-slate-800 py-6 mt-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} 9011 Scouting Solutions. Vertraulich.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
