
import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Star, LayoutGrid, List, ChevronDown, Check, FolderPlus, User, ArrowDown, ArrowUpRight, Edit2, Save, X, FileDown } from 'lucide-react';
import { ShadowPlayer, ShadowTeam, Position, Foot } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

// --- Definitions of Tactical Systems ---
// Coordinates are in % (left, top). Y=0 is Attack (Top), Y=100 is Goal (Bottom)
type FormationSlot = { label: string; x: number; y: number; role: Position };

const FORMATIONS: Record<string, { name: string; slots: FormationSlot[] }> = {
  '4-4-2': {
    name: '4-4-2 Klassisch',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LV', x: 10, y: 68, role: Position.ABW },
      { label: 'IV', x: 36, y: 68, role: Position.ABW },
      { label: 'IV', x: 64, y: 68, role: Position.ABW },
      { label: 'RV', x: 90, y: 68, role: Position.ABW },
      { label: 'LM', x: 10, y: 40, role: Position.MIT },
      { label: 'ZM', x: 36, y: 40, role: Position.MIT },
      { label: 'ZM', x: 64, y: 40, role: Position.MIT },
      { label: 'RM', x: 90, y: 40, role: Position.MIT },
      { label: 'ST', x: 36, y: 15, role: Position.ANG },
      { label: 'ST', x: 64, y: 15, role: Position.ANG },
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1 Modern',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LV', x: 10, y: 68, role: Position.ABW },
      { label: 'IV', x: 36, y: 68, role: Position.ABW },
      { label: 'IV', x: 64, y: 68, role: Position.ABW },
      { label: 'RV', x: 90, y: 68, role: Position.ABW },
      { label: 'DM', x: 36, y: 48, role: Position.MIT },
      { label: 'DM', x: 64, y: 48, role: Position.MIT },
      { label: 'LA', x: 10, y: 28, role: Position.MIT },
      { label: 'OM', x: 50, y: 28, role: Position.MIT },
      { label: 'RA', x: 90, y: 28, role: Position.MIT },
      { label: 'ST', x: 50, y: 10, role: Position.ANG },
    ]
  },
  '4-3-3-OFF': {
    name: '4-3-3 Offensiv',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LV', x: 10, y: 68, role: Position.ABW },
      { label: 'IV', x: 36, y: 68, role: Position.ABW },
      { label: 'IV', x: 64, y: 68, role: Position.ABW },
      { label: 'RV', x: 90, y: 68, role: Position.ABW },
      { label: 'ZM', x: 30, y: 45, role: Position.MIT },
      { label: 'ZM', x: 70, y: 45, role: Position.MIT },
      { label: 'OM', x: 50, y: 32, role: Position.MIT },
      { label: 'LA', x: 15, y: 15, role: Position.ANG },
      { label: 'ST', x: 50, y: 10, role: Position.ANG },
      { label: 'RA', x: 85, y: 15, role: Position.ANG },
    ]
  },
  '4-3-3-DEF': {
    name: '4-3-3 Defensiv',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LV', x: 10, y: 68, role: Position.ABW },
      { label: 'IV', x: 36, y: 68, role: Position.ABW },
      { label: 'IV', x: 64, y: 68, role: Position.ABW },
      { label: 'RV', x: 90, y: 68, role: Position.ABW },
      { label: 'DM', x: 50, y: 50, role: Position.MIT },
      { label: 'ZM', x: 30, y: 35, role: Position.MIT },
      { label: 'ZM', x: 70, y: 35, role: Position.MIT },
      { label: 'LA', x: 15, y: 15, role: Position.ANG },
      { label: 'ST', x: 50, y: 10, role: Position.ANG },
      { label: 'RA', x: 85, y: 15, role: Position.ANG },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'IV', x: 20, y: 70, role: Position.ABW },
      { label: 'ZIV', x: 50, y: 70, role: Position.ABW },
      { label: 'IV', x: 80, y: 70, role: Position.ABW },
      { label: 'LAV', x: 10, y: 40, role: Position.MIT },
      { label: 'ZM', x: 35, y: 45, role: Position.MIT },
      { label: 'ZM', x: 65, y: 45, role: Position.MIT },
      { label: 'RAV', x: 90, y: 40, role: Position.MIT },
      { label: 'OM', x: 50, y: 30, role: Position.MIT },
      { label: 'ST', x: 35, y: 12, role: Position.ANG },
      { label: 'ST', x: 65, y: 12, role: Position.ANG },
    ]
  },
  '3-4-3': {
    name: '3-4-3',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'IV', x: 20, y: 70, role: Position.ABW },
      { label: 'ZIV', x: 50, y: 70, role: Position.ABW },
      { label: 'IV', x: 80, y: 70, role: Position.ABW },
      { label: 'LM', x: 10, y: 45, role: Position.MIT },
      { label: 'ZM', x: 40, y: 45, role: Position.MIT },
      { label: 'ZM', x: 60, y: 45, role: Position.MIT },
      { label: 'RM', x: 90, y: 45, role: Position.MIT },
      { label: 'LA', x: 20, y: 15, role: Position.ANG },
      { label: 'ST', x: 50, y: 10, role: Position.ANG },
      { label: 'RA', x: 80, y: 15, role: Position.ANG },
    ]
  },
  '5-3-2': {
    name: '5-3-2 Catenaccio',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LAV', x: 10, y: 60, role: Position.ABW },
      { label: 'IV', x: 30, y: 70, role: Position.ABW },
      { label: 'ZIV', x: 50, y: 70, role: Position.ABW },
      { label: 'IV', x: 70, y: 70, role: Position.ABW },
      { label: 'RAV', x: 90, y: 60, role: Position.ABW },
      { label: 'ZM', x: 30, y: 40, role: Position.MIT },
      { label: 'ZM', x: 50, y: 40, role: Position.MIT },
      { label: 'ZM', x: 70, y: 40, role: Position.MIT },
      { label: 'ST', x: 35, y: 15, role: Position.ANG },
      { label: 'ST', x: 65, y: 15, role: Position.ANG },
    ]
  },
  '4-1-4-1': {
    name: '4-1-4-1',
    slots: [
      { label: 'TW', x: 50, y: 88, role: Position.TW },
      { label: 'LV', x: 10, y: 68, role: Position.ABW },
      { label: 'IV', x: 36, y: 68, role: Position.ABW },
      { label: 'IV', x: 64, y: 68, role: Position.ABW },
      { label: 'RV', x: 90, y: 68, role: Position.ABW },
      { label: 'DM', x: 50, y: 55, role: Position.MIT },
      { label: 'LM', x: 10, y: 35, role: Position.MIT },
      { label: 'ZM', x: 36, y: 35, role: Position.MIT },
      { label: 'ZM', x: 64, y: 35, role: Position.MIT },
      { label: 'RM', x: 90, y: 35, role: Position.MIT },
      { label: 'ST', x: 50, y: 10, role: Position.ANG },
    ]
  },
};

interface PlayerCardProps {
    p: ShadowPlayer;
    onRemove: (id: string) => void;
    onUnassign?: (id: string) => void;
    onAssign?: (id: string) => void;
    mini?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ p, onRemove, onUnassign, onAssign, mini }) => {
    // Styles for priorities
    const priorityStyles = {
        'A': 'bg-slate-900 border-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]',
        'B': 'bg-slate-800 border-yellow-500',
        'C': 'bg-slate-800/80 border-slate-500'
    };

    if (mini) {
        return (
            <div className={`print-card-mini relative w-36 border-l-4 rounded p-1.5 shadow-md transition-all ${priorityStyles[p.priority]} group shrink-0`}>
                <div className="flex justify-between items-start">
                    <div className="text-[10px] font-bold text-white truncate max-w-[80%] leading-tight">{p.name}</div>
                    <div className="flex gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         {onUnassign && (
                            <button onClick={(e) => { e.stopPropagation(); onUnassign(p.id); }} className="text-slate-500 hover:text-blue-400 p-0.5 rounded hover:bg-slate-700" title="Auf die Bank">
                                <ArrowDown className="w-2.5 h-2.5" />
                            </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); onRemove(p.id); }} className="text-slate-500 hover:text-red-500 p-0.5 rounded hover:bg-slate-700" title="Löschen">
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
                <div className="text-[9px] font-medium text-slate-400 truncate leading-tight">{p.currentClub || '-'}</div>
                <div className="flex items-center gap-1.5 text-[8px] text-slate-300 mt-1">
                    <span className="bg-white/10 px-1 rounded">{p.foot?.substring(0,1) || '?'}</span>
                    <span className="bg-white/10 px-1 rounded">{p.age}J</span>
                    <span className="bg-white/10 px-1 rounded">{p.height}cm</span>
                    {p.priority === 'A' && <Star className="w-2 h-2 text-green-400 fill-green-400 ml-auto" />}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative w-full bg-slate-900 border-l-4 rounded p-2 shadow-xl ${
            p.priority === 'A' ? 'border-green-500' : p.priority === 'B' ? 'border-yellow-500' : 'border-slate-500'
        }`}>
            <div className="absolute top-1 right-1 flex gap-2">
                {onAssign && (
                     <button onClick={() => onAssign(p.id)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-blue-900">
                        <ArrowUpRight className="w-3 h-3" /> Zuweisen
                    </button>
                )}
                <button className="text-slate-600 hover:text-red-500" onClick={() => onRemove(p.id)} title="Löschen">
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mb-0.5">{p.currentClub || 'Vereinslos'}</div>
            <div className="text-xs font-bold text-white truncate pr-16">{p.name}</div>
            <div className="flex items-center gap-1 text-[9px] text-slate-300 mt-1">
                <span className="bg-slate-800 px-1 rounded">{p.age} J</span>
                <span className="bg-slate-800 px-1 rounded">{p.foot?.substring(0,1)}</span>
                <span className="bg-slate-800 px-1 rounded">{p.height}cm</span>
            </div>
            {p.priority === 'A' && <Star className="w-3 h-3 text-green-400 fill-green-400 absolute bottom-1 right-1" />}
        </div>
    );
};

const ShadowTeams: React.FC = () => {
  const [teams, setTeams] = useState<ShadowTeam[]>(() => {
    const savedV2 = localStorage.getItem('scouting_shadow_teams_v2');
    if (savedV2) {
        return JSON.parse(savedV2);
    }
    const savedV1 = localStorage.getItem('scouting_shadow_team');
    if (savedV1) {
        const oldPlayers = JSON.parse(savedV1);
        return [{ id: 'default', name: 'Mein Kader', players: oldPlayers, formation: '4-4-2' }];
    }
    return [{ id: 'default', name: 'Neues Team', players: [], formation: '4-2-3-1' }];
  });

  const [currentTeamId, setCurrentTeamId] = useState<string>(() => teams[0]?.id || 'default');
  const [viewMode, setViewMode] = useState<'list' | 'pitch'>('pitch');
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [isManagingTeams, setIsManagingTeams] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  
  // Renaming State
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  // State for assigning a bench player to a slot
  const [playerToAssign, setPlayerToAssign] = useState<ShadowPlayer | null>(null);

  // Persist
  useEffect(() => {
    localStorage.setItem('scouting_shadow_teams_v2', JSON.stringify(teams));
  }, [teams]);

  const currentTeam = teams.find(t => t.id === currentTeamId) || teams[0];

  const [newPlayer, setNewPlayer] = useState<Partial<ShadowPlayer>>({
    position: Position.MIT,
    foot: Foot.Rechts,
    priority: 'B'
  });
  const [targetSlot, setTargetSlot] = useState<number | undefined>(undefined);

  // --- Team Management ---
  const createTeam = () => {
      if (!newTeamName.trim()) return;
      const newTeam: ShadowTeam = {
          id: Date.now().toString(),
          name: newTeamName,
          players: [],
          formation: '4-2-3-1'
      };
      setTeams([...teams, newTeam]);
      setCurrentTeamId(newTeam.id);
      setNewTeamName('');
      setIsManagingTeams(false);
  };

  const deleteTeam = (id: string) => {
      if (teams.length <= 1) {
          alert("Sie müssen mindestens ein Team behalten.");
          return;
      }
      const newTeams = teams.filter(t => t.id !== id);
      setTeams(newTeams);
      if (currentTeamId === id) setCurrentTeamId(newTeams[0].id);
  };
  
  const startRename = () => {
      setRenameValue(currentTeam.name);
      setIsRenaming(true);
      setIsManagingTeams(false);
  };

  const handleRenameTeam = () => {
      if (!renameValue.trim()) return;
      setTeams(teams.map(t => t.id === currentTeamId ? { ...t, name: renameValue } : t));
      setIsRenaming(false);
  };

  const updateFormation = (fmt: string) => {
      setTeams(teams.map(t => t.id === currentTeamId ? { ...t, formation: fmt } : t));
  };

  const handleDownloadPDF = async () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const primaryColor = [251, 191, 36]; // Yellow-400
    const secondaryColor = [30, 41, 59]; // Slate-800
    
    // Helper for Header
    const addHeader = (title: string) => {
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(0, 0, 297, 20, 'F'); // A4 Landscape width is ~297mm
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("9011 SOCCER SCOUTING", 10, 13);
        doc.setFontSize(12);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title.toUpperCase(), 280, 13, { align: 'right' });
    };

    if (viewMode === 'list') {
        addHeader(`Kaderplanung: ${currentTeam.name}`);
        
        doc.setTextColor(0,0,0);
        doc.setFontSize(12);
        doc.text(`System: ${FORMATIONS[currentTeam.formation || '4-4-2'].name}`, 14, 30);
        doc.setFontSize(10);
        doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 280, 30, { align: 'right' });

        const tableData = currentTeam.players.map(p => [
            p.name, 
            p.position, 
            p.currentClub || '-', 
            p.priority, 
            p.age ? `${p.age} J` : '-', 
            p.foot || '-',
            p.height ? `${p.height} cm` : '-',
            p.marketValue || '-',
            p.notes || ''
        ]);
        
        autoTable(doc, {
            head: [['Name', 'Pos', 'Verein', 'Prio', 'Alter', 'Fuß', 'Größe', 'MW', 'Notiz']],
            body: tableData,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [241, 245, 249] },
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { fontStyle: 'bold' },
                3: { fontStyle: 'bold', halign: 'center' }
            }
        });
        doc.save(`${currentTeam.name}_Liste.pdf`);
    } else {
        // Pitch View
        const element = document.getElementById('printable-content');
        if (element) {
            try {
                const canvas = await html2canvas(element as HTMLElement, {
                    useCORS: true,
                    scale: 3, // Higher resolution
                    backgroundColor: '#064e3b',
                    ignoreElements: (element) => element.classList.contains('no-pdf')
                });
                
                addHeader(`Formation: ${currentTeam.name}`);
                
                const imgData = canvas.toDataURL('image/png');
                const imgProps = doc.getImageProperties(imgData);
                
                // Calculate fit
                const pageWidth = 297;
                const pageHeight = 210;
                const margin = 10;
                const availableWidth = pageWidth - (margin * 2);
                const availableHeight = pageHeight - 30 - (margin * 2); // Minus header
                
                let imgWidth = availableWidth;
                let imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                
                if (imgHeight > availableHeight) {
                    imgHeight = availableHeight;
                    imgWidth = (imgProps.width * imgHeight) / imgProps.height;
                }
                
                // Center vertically and horizontally in the available space
                const x = margin + (availableWidth - imgWidth) / 2;
                const y = 30 + (availableHeight - imgHeight) / 2;
                
                doc.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
                
                // Add Footer/Info
                doc.setFontSize(8);
                doc.setTextColor(100);
                doc.text(`System: ${FORMATIONS[currentTeam.formation || '4-4-2'].name}`, 14, 205);
                doc.text(`© 9011 Scouting Pro`, 280, 205, { align: 'right' });

                doc.save(`${currentTeam.name}_Formation.pdf`);
            } catch (err) {
                console.error("Error creating PDF", err);
                alert("Fehler beim Erstellen des PDFs.");
            }
        }
    }
  };

  // --- Player Management ---
  
  const openAddPlayerForm = (prefillPosition?: Position, slotIndex?: number) => {
      setNewPlayer({
          position: prefillPosition || Position.MIT,
          foot: Foot.Rechts,
          priority: 'B',
          name: '',
          currentClub: '',
          age: '',
          height: '',
          marketValue: '',
          contractEnds: '',
          notes: ''
      });
      setTargetSlot(slotIndex);
      setShowAddPlayerForm(true);
  };

  const addPlayer = () => {
    if (!newPlayer.name) {
        alert("Bitte mindestens den Namen des Spielers eingeben.");
        return;
    }
    
    const player: ShadowPlayer = {
      id: Date.now().toString(),
      name: newPlayer.name,
      currentClub: newPlayer.currentClub || '',
      position: newPlayer.position || Position.MIT,
      foot: newPlayer.foot || Foot.Rechts,
      height: newPlayer.height || '',
      age: newPlayer.age || '',
      marketValue: newPlayer.marketValue || '',
      contractEnds: newPlayer.contractEnds || '',
      priority: newPlayer.priority || 'B',
      notes: newPlayer.notes || '',
      assignedSlot: targetSlot
    };
    
    const updatedTeams = teams.map(t => {
        if (t.id === currentTeamId) {
            return { ...t, players: [...t.players, player] };
        }
        return t;
    });

    setTeams(updatedTeams);
    setNewPlayer({ position: Position.MIT, foot: Foot.Rechts, priority: 'B' });
    setTargetSlot(undefined);
    setShowAddPlayerForm(false);
  };

  const removePlayer = (playerId: string) => {
    const updatedTeams = teams.map(t => {
        if (t.id === currentTeamId) {
            return { ...t, players: t.players.filter(p => p.id !== playerId) };
        }
        return t;
    });
    setTeams(updatedTeams);
  };

  const assignPlayerToSlot = (slotIndex: number) => {
    if (!playerToAssign) return;
    const updatedTeams = teams.map(t => {
        if (t.id === currentTeamId) {
            return { 
                ...t, 
                players: t.players.map(p => p.id === playerToAssign.id ? { ...p, assignedSlot: slotIndex } : p)
            };
        }
        return t;
    });
    setTeams(updatedTeams);
    setPlayerToAssign(null);
  };

  const unassignPlayer = (playerId: string) => {
    const updatedTeams = teams.map(t => {
        if (t.id === currentTeamId) {
            return { 
                ...t, 
                players: t.players.map(p => p.id === playerId ? { ...p, assignedSlot: undefined } : p)
            };
        }
        return t;
    });
    setTeams(updatedTeams);
  };

  const openAssignModal = (playerId: string) => {
      const p = currentTeam.players.find(pl => pl.id === playerId);
      if (p) setPlayerToAssign(p);
  };

  // --- Render Components ---

  const renderPlayerList = (pos: Position) => {
    const groupPlayers = currentTeam.players.filter(p => p.position === pos);
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="bg-slate-900/80 p-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white uppercase tracking-wider">{pos}</h3>
          <div className="flex gap-2">
            <button onClick={() => openAddPlayerForm(pos)} className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">
                <Plus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded text-slate-300">{groupPlayers.length}</span>
          </div>
        </div>
        <div className="p-4 space-y-3 min-h-[100px]">
          {groupPlayers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center italic py-4">Keine Spieler</p>
          ) : (
            groupPlayers.map(p => <PlayerCard key={p.id} p={p} onRemove={removePlayer} />)
          )}
        </div>
      </div>
    );
  };

  const renderPitchView = () => {
    const formationKey = currentTeam.formation || '4-4-2';
    const formation = FORMATIONS[formationKey] || FORMATIONS['4-4-2'];
    
    const assignedPlayers = currentTeam.players.filter(p => p.assignedSlot !== undefined);
    
    // Bench: Players without a valid slot in current formation or manually added without slot
    const benchPlayers = currentTeam.players.filter(p => p.assignedSlot === undefined || p.assignedSlot >= formation.slots.length);

    return (
        <div className="space-y-6">
             {/* Formation Selector */}
             <div className="flex justify-center">
                <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex items-center gap-2 px-4">
                    <span className="text-xs font-bold text-slate-400 uppercase">System:</span>
                    <select 
                        value={formationKey}
                        onChange={(e) => updateFormation(e.target.value)}
                        className="bg-slate-950 text-white font-bold text-sm outline-none border-none py-1 focus:ring-0 appearance-none cursor-pointer hover:text-yellow-400"
                    >
                        {Object.keys(FORMATIONS).map(k => (
                            <option key={k} value={k} className="bg-slate-900">{FORMATIONS[k].name}</option>
                        ))}
                    </select>
                </div>
             </div>

            {/* Pitch Container - Wrapped with ID for print targeting */}
            <div id="printable-content" className="print-pitch-root">
                <div className="print-pitch-container bg-emerald-800 rounded-xl border-4 border-emerald-900 p-4 relative h-[800px] shadow-2xl overflow-hidden select-none mx-auto">
                    
                    {/* Print Header inside the pitch area for context */}
                    <div className="hidden print:block absolute top-2 left-2 z-50 text-white/80 text-lg font-bold">
                        {currentTeam.name} - {FORMATIONS[formationKey].name}
                    </div>

                    {/* Field Markings */}
                    <div className="absolute inset-4 border-2 border-white/30 rounded pointer-events-none"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                    <div className="absolute top-4 left-1/2 w-48 h-24 border-2 border-white/30 border-t-0 -translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-4 left-1/2 w-48 h-24 border-2 border-white/30 border-b-0 -translate-x-1/2 pointer-events-none"></div>

                    {/* Render Slots */}
                    {formation.slots.map((slot, index) => {
                        // Find players for this slot, sorted by priority (A -> B -> C)
                        const slotPlayers = assignedPlayers
                            .filter(p => p.assignedSlot === index)
                            .sort((a, b) => a.priority.localeCompare(b.priority));

                        return (
                            <div 
                                key={index} 
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                            >
                                {/* Case 1: Slot is Empty -> Show Pulse Button */}
                                {slotPlayers.length === 0 ? (
                                    <div className="flex flex-col items-center gap-1 group">
                                        <div 
                                            className="w-10 h-10 rounded-full border-2 border-white/40 bg-white/10 animate-pulse flex items-center justify-center cursor-pointer hover:bg-black/40 hover:border-yellow-400 transition-colors no-pdf"
                                            onClick={() => openAddPlayerForm(slot.role, index)}
                                            title={`${slot.label} hinzufügen`}
                                        >
                                            <Plus className="w-5 h-5 text-white/70 group-hover:text-yellow-400" />
                                        </div>
                                        <span className="text-[10px] font-bold text-white/50 bg-black/20 px-1 rounded">{slot.label}</span>
                                    </div>
                                ) : (
                                    /* Case 2: Slot has Players -> Show List Container */
                                    <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-lg p-1.5 flex flex-col gap-1 min-w-[150px] print-card-mini">
                                        {/* Header with Add Button */}
                                        <div className="flex justify-between items-center px-1 pb-1 border-b border-slate-700/50 mb-0.5">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{slot.label}</span>
                                            <button 
                                                onClick={() => openAddPlayerForm(slot.role, index)}
                                                className="text-white/50 hover:text-green-400 no-pdf"
                                                title="Weiteren Spieler hinzufügen"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        
                                        {/* List of Players */}
                                        <div className="flex flex-col gap-1">
                                            {slotPlayers.map(p => (
                                                <PlayerCard key={p.id} p={p} onRemove={removePlayer} onUnassign={unassignPlayer} mini />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bench / Unassigned */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Bank / Nicht zugewiesen ({benchPlayers.length})</h3>
                <div className="flex flex-wrap gap-4">
                    {benchPlayers.length === 0 ? (
                         <span className="text-xs text-slate-500 italic">Alle Spieler sind einer Position zugewiesen.</span>
                    ) : (
                        benchPlayers.map(p => (
                             <div key={p.id} className="w-32">
                                 <PlayerCard p={p} onRemove={removePlayer} onAssign={openAssignModal} />
                             </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
         <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="p-2 bg-yellow-400 rounded-lg text-slate-900">
                <Users className="w-6 h-6" />
            </div>
            <div className="relative">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Kaderplanung</label>
                
                {isRenaming ? (
                    <div className="flex items-center gap-2">
                        <input 
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white font-bold outline-none focus:border-yellow-400 text-lg"
                            autoFocus
                        />
                        <button onClick={handleRenameTeam} className="bg-green-600 p-1.5 rounded hover:bg-green-500 text-white"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setIsRenaming(false)} className="bg-slate-700 p-1.5 rounded hover:bg-slate-600 text-white"><X className="w-4 h-4" /></button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 cursor-pointer group">
                        <div className="flex items-center gap-2" onClick={() => setIsManagingTeams(!isManagingTeams)}>
                            <h2 className="text-xl font-bold text-white truncate max-w-[200px]">{currentTeam.name}</h2>
                            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
                        </div>
                        <button onClick={startRename} className="p-1 text-slate-500 hover:text-yellow-400 transition-colors" title="Team umbenennen">
                            <Edit2 className="w-3 h-3" />
                        </button>
                    </div>
                )}
                
                {/* Team Switcher Dropdown */}
                {isManagingTeams && !isRenaming && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 p-2">
                        {teams.map(t => (
                            <div 
                                key={t.id} 
                                onClick={() => { setCurrentTeamId(t.id); setIsManagingTeams(false); }}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer ${currentTeamId === t.id ? 'bg-slate-800 text-yellow-400' : 'text-slate-300 hover:bg-slate-800'}`}
                            >
                                <span className="truncate font-bold">{t.name}</span>
                                {currentTeamId === t.id && <Check className="w-3 h-3" />}
                                {teams.length > 1 && currentTeamId !== t.id && (
                                    <Trash2 className="w-3 h-3 text-red-500 hover:text-red-400" onClick={(e) => { e.stopPropagation(); deleteTeam(t.id); }} />
                                )}
                            </div>
                        ))}
                        <div className="border-t border-slate-700 mt-2 pt-2">
                            <div className="flex gap-1">
                                <input 
                                    className="bg-slate-950 border border-slate-600 rounded px-2 py-1 text-xs text-white flex-1 outline-none" 
                                    placeholder="Neues Team..."
                                    value={newTeamName}
                                    onChange={e => setNewTeamName(e.target.value)}
                                />
                                <button onClick={createTeam} className="bg-blue-600 p-1 rounded text-white hover:bg-blue-500">
                                    <FolderPlus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
         </div>

         <div className="flex items-center gap-2 w-full lg:w-auto">
             <div className="hidden md:flex gap-2 mr-4">
                 <div className="px-3 py-1 bg-slate-900 rounded border border-slate-700 text-xs">
                    <span className="text-slate-400">Spieler:</span> <span className="text-white font-bold">{currentTeam.players.length}</span>
                 </div>
                 <div className="px-3 py-1 bg-slate-900 rounded border border-slate-700 text-xs">
                    <span className="text-slate-400">System:</span> <span className="text-yellow-400 font-bold">{FORMATIONS[currentTeam.formation || '4-4-2']?.name.split(' ')[0]}</span>
                 </div>
             </div>
             
             <button onClick={handleDownloadPDF} className="p-2 bg-slate-700 hover:bg-slate-600 rounded text-white mr-2" title="Als PDF speichern">
                <FileDown className="w-4 h-4" />
             </button>

             <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
                 <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Listenansicht"
                 >
                     <List className="w-4 h-4" />
                 </button>
                 <button 
                    onClick={() => setViewMode('pitch')}
                    className={`p-2 rounded ${viewMode === 'pitch' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Spielfeldansicht"
                 >
                     <LayoutGrid className="w-4 h-4" />
                 </button>
             </div>

             <button 
                onClick={() => openAddPlayerForm()}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg"
             >
                <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Spieler hinzufügen</span>
             </button>
         </div>
      </div>

      {/* Modal: Assign Player to Slot */}
      {playerToAssign && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 max-w-lg w-full shadow-2xl animate-fade-in">
                <h3 className="text-white font-bold text-lg mb-4 border-b border-slate-700 pb-2">
                    Position für <span className="text-yellow-400">{playerToAssign.name}</span> wählen
                </h3>
                <p className="text-xs text-slate-400 mb-4">Wählen Sie einen Slot im aktuellen System ({FORMATIONS[currentTeam.formation || '4-4-2'].name}).</p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto">
                    {FORMATIONS[currentTeam.formation || '4-4-2'].slots.map((slot, idx) => (
                        <button 
                            key={idx}
                            onClick={() => assignPlayerToSlot(idx)}
                            className={`p-3 rounded border text-left transition-colors flex flex-col ${
                                slot.role === playerToAssign.position 
                                ? 'bg-blue-600/20 border-blue-400 hover:bg-blue-600/40' 
                                : 'bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-400'
                            }`}
                        >
                            <span className={`font-bold text-sm ${slot.role === playerToAssign.position ? 'text-blue-300' : 'text-slate-300'}`}>
                                {slot.label}
                            </span>
                            <span className="text-[10px] uppercase opacity-70">{slot.role}</span>
                        </button>
                    ))}
                </div>
                <button onClick={() => setPlayerToAssign(null)} className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-950 text-slate-400 rounded transition-colors">
                    Abbrechen
                </button>
            </div>
        </div>
      )}

      {/* Add Player Form */}
      {showAddPlayerForm && (
        <div className="bg-slate-800 p-6 rounded-xl border border-blue-500/50 shadow-lg animate-fade-in relative overflow-hidden z-50">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Neuer Kandidat</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <input 
                    type="text" placeholder="Name *" 
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
                <div className="flex gap-2">
                    <select 
                        value={newPlayer.position}
                        onChange={e => setNewPlayer({...newPlayer, position: e.target.value as Position})}
                        className="bg-slate-950 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 flex-1 appearance-none"
                    >
                        {Object.values(Position).map(p => <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>)}
                    </select>
                    <select 
                        value={newPlayer.foot}
                        onChange={e => setNewPlayer({...newPlayer, foot: e.target.value as Foot})}
                        className="bg-slate-950 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 flex-1 appearance-none"
                    >
                        {Object.values(Foot).map(p => <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>)}
                    </select>
                </div>
                <select 
                    value={newPlayer.priority}
                    onChange={e => setNewPlayer({...newPlayer, priority: e.target.value as any})}
                    className="bg-slate-950 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 appearance-none"
                >
                    <option value="A" className="bg-slate-900 text-white">A - Top Target</option>
                    <option value="B" className="bg-slate-900 text-white">B - Alternative</option>
                    <option value="C" className="bg-slate-900 text-white">C - Perspektivspieler</option>
                </select>
                
                <div className="flex gap-2">
                    <input 
                        type="text" placeholder="Alter" 
                        value={newPlayer.age || ''}
                        onChange={e => setNewPlayer({...newPlayer, age: e.target.value})}
                        className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 w-1/2"
                    />
                    <input 
                        type="text" placeholder="Größe (cm)" 
                        value={newPlayer.height || ''}
                        onChange={e => setNewPlayer({...newPlayer, height: e.target.value})}
                        className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 w-1/2"
                    />
                </div>
                
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
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-white outline-none focus:border-blue-400 lg:col-span-4"
                />
            </div>
            <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddPlayerForm(false)} className="px-4 py-2 text-slate-400 hover:text-white">Abbrechen</button>
                <button onClick={addPlayer} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg">Speichern</button>
            </div>
        </div>
      )}

      {/* Main View - Wrapped correctly for List or Pitch printing */}
      {viewMode === 'list' ? (
          <div id="printable-content" className="print-list-root grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {renderPlayerList(Position.TW)}
              {renderPlayerList(Position.ABW)}
              {renderPlayerList(Position.MIT)}
              {renderPlayerList(Position.ANG)}
          </div>
      ) : (
          renderPitchView()
      )}
    </div>
  );
};

export default ShadowTeams;
