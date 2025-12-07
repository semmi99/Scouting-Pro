
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Save, Star } from 'lucide-react';
import { ShadowPlayer, Position } from '../types';

const ShadowTeams: React.FC = () => {
  // Load from local storage or default
  const [players, setPlayers] = useState<ShadowPlayer[]>(() => {
    const saved = localStorage.getItem('scouting_shadow_team');
    return saved ? JSON.parse(saved) : [
        {
        id: '1',
        name: 'Max Mustermann',
        currentClub: 'FC Beispiel',
        position: Position.MIT,
        age: '23',
        marketValue: '500k',
        contractEnds: '2025',
        priority: 'A',
        notes: 'Sehr starkes Passspiel'
        }
    ];
  });

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('scouting_shadow_team', JSON.stringify(players));
  }, [players]);

  const [newPlayer, setNewPlayer] = useState<Partial<ShadowPlayer>>({
    position: Position.MIT,
    priority: 'B'
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const addPlayer = () => {
    if (!newPlayer.name || !newPlayer.currentClub) return;
    
    const player: ShadowPlayer = {
      id: Date.now().toString(),
      name: newPlayer.name,
      currentClub: newPlayer.currentClub,
      position: newPlayer.position || Position.MIT,
      age: newPlayer.age || '',
      marketValue: newPlayer.marketValue || '',
      contractEnds: newPlayer.contractEnds || '',
      priority: newPlayer.priority || 'B',
      notes: newPlayer.notes || ''
    };
    
    setPlayers([...players, player]);
    setNewPlayer({ position: Position.MIT, priority: 'B' });
    setShowAddForm(false);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const getPriorityColor = (p: string) => {
    if (p === 'A') return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (p === 'B') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  const renderPositionGroup = (pos: Position) => {
    const groupPlayers = players.filter(p => p.position === pos);
    
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white uppercase tracking-wider">{pos}</h3>
          <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">{groupPlayers.length}</span>
        </div>
        <div className="p-4 space-y-3 min-h-[100px]">
          {groupPlayers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center italic py-4">Keine Spieler auf der Liste</p>
          ) : (
            groupPlayers.map(p => (
              <div key={p.id} className={`p-3 rounded border flex flex-col gap-2 ${getPriorityColor(p.priority)}`}>
                 <div className="flex justify-between items-start">
                    <div>
                        <div className="font-bold text-sm text-white flex items-center gap-1">
                          {p.priority === 'A' && <Star className="w-3 h-3 text-green-400 fill-green-400" />}
                          {p.name}
                        </div>
                        <div className="text-xs opacity-80">{p.currentClub}</div>
                    </div>
                    <button onClick={() => removePlayer(p.id)} className="text-slate-500 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
                 <div className="grid grid-cols-3 gap-2 text-[10px] uppercase text-slate-400 border-t border-slate-700/50 pt-2 mt-1">
                    <div>
                        <span className="block font-bold text-slate-300">Alter</span> {p.age}
                    </div>
                    <div>
                        <span className="block font-bold text-slate-300">MW</span> {p.marketValue}
                    </div>
                    <div>
                        <span className="block font-bold text-slate-300">Vertrag</span> {p.contractEnds}
                    </div>
                 </div>
                 {p.notes && <div className="text-xs italic opacity-70 mt-1">"{p.notes}"</div>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Schattenteams</h2>
         </div>
         <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold transition-colors"
         >
            <Plus className="w-4 h-4" /> Spieler hinzufügen
         </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-blue-500/50 shadow-lg mb-8 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Neuer Kandidat</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input 
                    type="text" placeholder="Name" 
                    value={newPlayer.name || ''}
                    onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
                <input 
                    type="text" placeholder="Aktueller Verein" 
                    value={newPlayer.currentClub || ''}
                    onChange={e => setNewPlayer({...newPlayer, currentClub: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
                 <select 
                    value={newPlayer.position}
                    onChange={e => setNewPlayer({...newPlayer, position: e.target.value as Position})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                >
                    {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select 
                    value={newPlayer.priority}
                    onChange={e => setNewPlayer({...newPlayer, priority: e.target.value as any})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                >
                    <option value="A">A - Top Target</option>
                    <option value="B">B - Alternative</option>
                    <option value="C">C - Perspektivspieler</option>
                </select>
                <input 
                    type="text" placeholder="Alter" 
                    value={newPlayer.age || ''}
                    onChange={e => setNewPlayer({...newPlayer, age: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
                <input 
                    type="text" placeholder="Marktwert" 
                    value={newPlayer.marketValue || ''}
                    onChange={e => setNewPlayer({...newPlayer, marketValue: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
                 <input 
                    type="text" placeholder="Vertragsende" 
                    value={newPlayer.contractEnds || ''}
                    onChange={e => setNewPlayer({...newPlayer, contractEnds: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
                <input 
                    type="text" placeholder="Notizen" 
                    value={newPlayer.notes || ''}
                    onChange={e => setNewPlayer({...newPlayer, notes: e.target.value})}
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Abbrechen</button>
                <button onClick={addPlayer} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold">Speichern</button>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {renderPositionGroup(Position.TW)}
          {renderPositionGroup(Position.ABW)}
          {renderPositionGroup(Position.MIT)}
          {renderPositionGroup(Position.ANG)}
      </div>
    </div>
  );
};

export default ShadowTeams;
