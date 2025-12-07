import React, { useState } from 'react';
import TeamScouting from './components/TeamScouting';
import PlayerScouting from './components/PlayerScouting';
import { ClipboardList, User } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'team' | 'player'>('team');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-yellow-400 selection:text-slate-900">
      
      {/* App Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-slate-900 rounded-lg flex items-center justify-center border border-yellow-400">
                    <span className="font-black text-yellow-400 text-xs">9011</span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight">Scouting<span className="text-yellow-400">Pro</span></h1>
            </div>
            
            <nav className="flex space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                    onClick={() => setActiveTab('team')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'team' 
                        ? 'bg-slate-800 text-yellow-400 shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                    <ClipboardList className="w-4 h-4" />
                    <span className="hidden sm:inline">Team-Scouting</span>
                </button>
                <button
                    onClick={() => setActiveTab('player')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'player' 
                        ? 'bg-slate-800 text-yellow-400 shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Spieler-Analyse</span>
                </button>
            </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-5xl mx-auto">
            {activeTab === 'team' ? <TeamScouting /> : <PlayerScouting />}
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