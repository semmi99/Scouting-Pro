
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, Calendar, MapPin, Flag, User, FileText, Activity, Goal, Users, Image as ImageIcon, Clock, RefreshCw, AlertCircle, Info, Target, CornerUpRight, Zap, Trophy, CloudRain, Layout, Upload } from 'lucide-react';
import { PlayerRosterItem, PlayerInfoItem, TickerEvent } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Sub-Components defined OUTSIDE to prevent re-render focus loss ---

const RosterTable = ({ 
    players, 
    isHome, 
    coachName, 
    onCoachChange, 
    onAddPlayer, 
    onRemovePlayer, 
    onUpdatePlayer 
}: { 
    players: PlayerRosterItem[], 
    isHome: boolean,
    coachName: string,
    onCoachChange: (val: string) => void,
    onAddPlayer: () => void,
    onRemovePlayer: (id: string) => void,
    onUpdatePlayer: (id: string, field: keyof PlayerRosterItem, value: string | number) => void
}) => (
    <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700 shadow-sm">
        <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex gap-3 items-center">
            <span className={`text-xs font-bold px-2 py-1 rounded ${isHome ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'}`}>
                {isHome ? 'HEIM' : 'GAST'}
            </span>
            <div className="flex items-center gap-2 flex-1">
                <User className="w-4 h-4 text-slate-500" />
                <input 
                    type="text"
                    placeholder="Trainer Name"
                    value={coachName}
                    onChange={(e) => onCoachChange(e.target.value)}
                    className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-500 font-medium"
                />
            </div>
        </div>
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-slate-400 border-b border-slate-600 text-xs uppercase bg-slate-900/30">
                    <th className="p-2 w-12 text-center">Nr.</th>
                    <th className="p-2">Spieler</th>
                    <th className="p-2 w-16 text-center">Min</th>
                    <th className="p-2 w-16 text-center">T/V</th>
                    <th className="p-2 w-12 text-center">Note</th>
                    <th className="p-2 w-8"></th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {players.map((player) => (
                    <tr key={player.id} className="border-b border-slate-700 hover:bg-slate-700/50 transition-colors">
                        <td className="p-1">
                            <input 
                                type="text" 
                                value={player.number}
                                onChange={(e) => onUpdatePlayer(player.id, 'number', e.target.value)}
                                className="w-full bg-transparent text-white focus:text-yellow-400 outline-none text-center font-mono" 
                                placeholder="#" 
                            />
                        </td>
                        <td className="p-1">
                            <input 
                                type="text" 
                                value={player.name}
                                onChange={(e) => onUpdatePlayer(player.id, 'name', e.target.value)}
                                className="w-full bg-transparent text-white font-medium focus:text-yellow-400 outline-none" 
                                placeholder="Name" 
                            />
                        </td>
                        <td className="p-1">
                            <input 
                                type="text" 
                                value={player.minutes}
                                onChange={(e) => onUpdatePlayer(player.id, 'minutes', e.target.value)}
                                className="w-full bg-transparent text-slate-300 focus:text-yellow-400 outline-none text-center" 
                                placeholder="Min" 
                            />
                        </td>
                        <td className="p-1">
                            <input 
                                type="text" 
                                value={player.goalsAssists}
                                onChange={(e) => onUpdatePlayer(player.id, 'goalsAssists', e.target.value)}
                                className="w-full bg-transparent text-slate-300 focus:text-yellow-400 outline-none text-center" 
                                placeholder="0/0" 
                            />
                        </td>
                        <td className="p-1">
                            <input 
                                type="number" 
                                min="1" max="10"
                                value={player.rating}
                                onChange={(e) => onUpdatePlayer(player.id, 'rating', parseInt(e.target.value))}
                                className={`w-full text-center rounded p-0.5 font-bold outline-none ${
                                    player.rating >= 8 ? 'bg-green-600 text-white' : 
                                    player.rating >= 5 ? 'bg-yellow-500 text-black' : 
                                    'bg-red-500 text-white'
                                }`} 
                            />
                        </td>
                        <td className="p-1 text-center">
                            <button onClick={() => onRemovePlayer(player.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="p-2 border-t border-slate-700">
             <button 
                onClick={onAddPlayer}
                className="w-full flex items-center justify-center gap-1 text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1.5 rounded hover:bg-slate-600 transition-colors"
            >
                <Plus className="w-3 h-3" /> Spieler hinzufügen
            </button>
        </div>
    </div>
);

// --- Main Component ---

const TeamScouting: React.FC = () => {
  
  // Load initial state from LocalStorage
  const [homeRoster, setHomeRoster] = useState<PlayerRosterItem[]>(() => {
    const saved = localStorage.getItem('scouting_team_homeRoster');
    return saved ? JSON.parse(saved) : [{ id: 'h1', number: '1', name: '', minutes: '90', goalsAssists: '0/0', rating: 7 }];
  });

  const [awayRoster, setAwayRoster] = useState<PlayerRosterItem[]>(() => {
    const saved = localStorage.getItem('scouting_team_awayRoster');
    return saved ? JSON.parse(saved) : [{ id: 'a1', number: '1', name: '', minutes: '90', goalsAssists: '0/0', rating: 7 }];
  });

  const [playerInfos, setPlayerInfos] = useState<PlayerInfoItem[]>(() => {
    const saved = localStorage.getItem('scouting_team_playerInfos');
    return saved ? JSON.parse(saved) : [{ id: 'i1', number: '', name: '', info: '' }];
  });

  const [tickerEvents, setTickerEvents] = useState<TickerEvent[]>(() => {
    const saved = localStorage.getItem('scouting_team_tickerEvents');
    return saved ? JSON.parse(saved) : [];
  });

  const [reportImages, setReportImages] = useState<string[]>(() => {
    const saved = localStorage.getItem('scouting_team_images');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('scouting_team_formData');
    return saved ? JSON.parse(saved) : {
        competition: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        kickoff: '15:30',
        homeTeam: '',
        awayTeam: '',
        homeCoach: '',
        awayCoach: '',
        scoutName: '',
        weather: 'Sonnig / Klar',
        pitchCondition: 'Ausgezeichnet',
        summary: '',
        formation: '',
        systemInfo: '',
        currentForm: '',
        currentFormInfo: '',
        cornersOffensive: '',
        cornersDefensive: '',
        freekicksOffensive: '',
        freekicksDefensive: '',
        swotGeneral: '',
        swotAttack: '',
        swotDefense: '',
        swotStrengths: '',
        swotWeaknesses: ''
    };
  });

  // Ticker Entry State
  const [newTickerEntry, setNewTickerEntry] = useState<Partial<TickerEvent>>({
      minute: '',
      type: 'Info',
      text: '',
      team: 'Home'
  });

  // --- Persistence Effects (Auto-Save) ---
  useEffect(() => { localStorage.setItem('scouting_team_homeRoster', JSON.stringify(homeRoster)); }, [homeRoster]);
  useEffect(() => { localStorage.setItem('scouting_team_awayRoster', JSON.stringify(awayRoster)); }, [awayRoster]);
  useEffect(() => { localStorage.setItem('scouting_team_playerInfos', JSON.stringify(playerInfos)); }, [playerInfos]);
  useEffect(() => { localStorage.setItem('scouting_team_tickerEvents', JSON.stringify(tickerEvents)); }, [tickerEvents]);
  useEffect(() => { localStorage.setItem('scouting_team_images', JSON.stringify(reportImages)); }, [reportImages]);
  useEffect(() => { localStorage.setItem('scouting_team_formData', JSON.stringify(formData)); }, [formData]);


  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const addPlayer = (isHome: boolean) => {
    const newPlayer: PlayerRosterItem = {
      id: Date.now().toString() + (isHome ? 'h' : 'a'),
      number: '',
      name: '',
      minutes: '',
      goalsAssists: '',
      rating: 5,
    };
    if (isHome) setHomeRoster(prev => [...prev, newPlayer]);
    else setAwayRoster(prev => [...prev, newPlayer]);
  };

  const removePlayer = (id: string, isHome: boolean) => {
    if (isHome) setHomeRoster(prev => prev.filter(p => p.id !== id));
    else setAwayRoster(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayer = (id: string, field: keyof PlayerRosterItem, value: string | number, isHome: boolean) => {
    if (isHome) {
        setHomeRoster(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    } else {
        setAwayRoster(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
    }
  };

  const addPlayerInfo = () => {
    setPlayerInfos(prev => [...prev, { id: Date.now().toString(), number: '', name: '', info: '' }]);
  };

  const removePlayerInfo = (id: string) => {
    setPlayerInfos(prev => prev.filter(p => p.id !== id));
  };

  const updatePlayerInfo = (id: string, field: keyof PlayerInfoItem, value: string) => {
    setPlayerInfos(prev => prev.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addTickerEvent = () => {
      if (!newTickerEntry.minute || !newTickerEntry.text) return;
      
      const newEvent: TickerEvent = {
          id: Date.now().toString(),
          minute: newTickerEntry.minute,
          type: newTickerEntry.type as any,
          text: newTickerEntry.text,
          team: newTickerEntry.team as 'Home' | 'Away'
      };
      // Add to beginning of array for UI (newest first)
      setTickerEvents(prev => [newEvent, ...prev]);
      setNewTickerEntry(prev => ({ ...prev, minute: '', text: '' })); // Keep type and team same for quicker entry
  };

  const removeTickerEvent = (id: string) => {
      setTickerEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          files.forEach(file => {
              const reader = new FileReader();
              reader.onloadend = () => {
                  setReportImages(prev => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file as Blob);
          });
      }
  };

  const removeImage = (index: number) => {
      setReportImages(prev => prev.filter((_, i) => i !== index));
  };

  const getEventLabel = (type: string) => {
      switch(type) {
          case 'Goal': return 'Tor';
          case 'YellowCard': return 'Gelbe Karte';
          case 'RedCard': return 'Rote Karte';
          case 'Sub': return 'Wechsel';
          case 'Chance': return 'Großchance';
          case 'Shot': return 'Torschuss';
          case 'Corner': return 'Eckball';
          case 'Freekick': return 'Freistoß';
          default: return 'Info';
      }
  };
  
  const getEventIcon = (type: string) => {
      switch(type) {
          case 'Goal': return <Goal className="w-4 h-4 text-green-400" />;
          case 'YellowCard': return <FileText className="w-4 h-4 text-yellow-500 fill-yellow-500" />;
          case 'RedCard': return <FileText className="w-4 h-4 text-red-600 fill-red-600" />;
          case 'Sub': return <RefreshCw className="w-4 h-4 text-blue-400" />;
          case 'Chance': return <Zap className="w-4 h-4 text-yellow-400" />;
          case 'Shot': return <Target className="w-4 h-4 text-orange-400" />;
          case 'Corner': return <CornerUpRight className="w-4 h-4 text-purple-400" />;
          case 'Freekick': return <Activity className="w-4 h-4 text-cyan-400" />;
          default: return <Info className="w-4 h-4 text-slate-400" />;
      }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const primaryColor = [251, 191, 36]; // Yellow-400
    const secondaryColor = [30, 41, 59]; // Slate-800

    // -- Header --
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("9011 SOCCER SCOUTING", 14, 20);
    doc.setFontSize(14);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("SPIEL ANALYSE", 130, 20);

    // -- Match Metadata --
    doc.setTextColor(0, 0, 0);
    
    // Match Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${formData.homeTeam || 'Heim'} vs ${formData.awayTeam || 'Gast'}`, 105, 45, { align: 'center' });
    
    let y = 55;
    
    // Info Grid
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Wettbewerb: ${formData.competition}`, 14, y);
    doc.text(`Wetter: ${formData.weather}`, 110, y);
    y+=6;
    doc.text(`Ort: ${formData.location}`, 14, y);
    doc.text(`Platz: ${formData.pitchCondition}`, 110, y);
    y+=6;
    doc.text(`Datum/Zeit: ${formData.date} - ${formData.kickoff}`, 14, y);
    doc.text(`Scout: ${formData.scoutName}`, 110, y);
    
    y += 12;

    // -- Rosters --
    const homeRows = homeRoster.map(p => [p.number, p.name, p.minutes, p.goalsAssists, p.rating]);
    const awayRows = awayRoster.map(p => [p.number, p.name, p.minutes, p.goalsAssists, p.rating]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Heim: ${formData.homeTeam} (Trainer: ${formData.homeCoach})`, 14, y);
    
    // Home Table
    autoTable(doc, {
        startY: y + 3,
        head: [['#', 'Spieler', 'Min', 'T/V', 'Note']],
        body: homeRows,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 110 }
    });

    const finalYHome = (doc as any).lastAutoTable.finalY;

    // Away Table
    doc.text(`Gast: ${formData.awayTeam} (Trainer: ${formData.awayCoach})`, 110, y);
    autoTable(doc, {
        startY: y + 3,
        head: [['#', 'Spieler', 'Min', 'T/V', 'Note']],
        body: awayRows,
        theme: 'striped',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 8 },
        margin: { left: 110, right: 14 }
    });
    
    const finalYAway = (doc as any).lastAutoTable.finalY;
    y = Math.max(finalYHome, finalYAway) + 15;

    // -- Player Infos / Einzelkritik --
    if (playerInfos.length > 0 && playerInfos.some(p => p.info.trim() !== '')) {
         if(y > 250) { doc.addPage(); y=20; }
         doc.setFontSize(12);
         doc.setFont("helvetica", "bold");
         doc.text("AUFFÄLLIGE SPIELER / EINZELKRITIK", 14, y);
         y += 5;

         const infoRows = playerInfos
            .filter(p => p.name || p.info)
            .map(p => [p.number, p.name, p.info]);

         autoTable(doc, {
            startY: y,
            head: [['#', 'Spieler', 'Beurteilung / Info']],
            body: infoRows,
            theme: 'grid',
            headStyles: { fillColor: secondaryColor },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 15 },
                1: { fontStyle: 'bold', cellWidth: 40 },
                2: { cellWidth: 'auto' }
            },
            styles: { fontSize: 9 }
         });
         y = (doc as any).lastAutoTable.finalY + 15;
    }

    // -- Stats & Analysis --
    if(y > 270) { doc.addPage(); y=20; }
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("ANALYSE & STATISTIK", 14, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const statsLines = [
        `Formation: ${formData.formation}`,
        `System Info: ${formData.systemInfo}`,
        `Ecken (Off/Def): ${formData.cornersOffensive} / ${formData.cornersDefensive}`,
        `Freistöße (Off/Def): ${formData.freekicksOffensive} / ${formData.freekicksDefensive}`,
        `Fazit: ${formData.summary}`
    ];

    statsLines.forEach(line => {
        if(y > 270) { doc.addPage(); y=20; }
        const splitLine = doc.splitTextToSize(line, 180);
        doc.text(splitLine, 14, y);
        y += (splitLine.length * 5) + 2;
    });
    
    y += 10;

    // -- SWOT --
    if(y > 220) { doc.addPage(); y=20; }
    
    const swotData = [
        ['Allgemein', formData.swotGeneral],
        ['Stärken', formData.swotStrengths],
        ['Schwächen', formData.swotWeaknesses],
        ['Offensive', formData.swotAttack],
        ['Defensive', formData.swotDefense],
    ];
    
    autoTable(doc, {
        startY: y,
        head: [['Kategorie', 'SWOT Analyse']],
        body: swotData,
        theme: 'grid',
        headStyles: { fillColor: secondaryColor },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 35 } }
    });

    y = (doc as any).lastAutoTable.finalY + 15;

    // -- Liveticker --
    if (tickerEvents.length > 0) {
        if(y > 250) { doc.addPage(); y=20; }
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("LIVETICKER / HIGHLIGHTS", 14, y);
        
        const tickerRows = tickerEvents.map(e => [
            e.minute + "'", 
            e.team === 'Home' ? 'HEIM' : 'GAST',
            getEventLabel(e.type),
            e.text
        ]);

        autoTable(doc, {
            startY: y + 5,
            head: [['Min', 'Team', 'Event', 'Beschreibung']],
            body: tickerRows,
            theme: 'plain',
            styles: { fontSize: 9 },
            columnStyles: { 
                0: { fontStyle: 'bold', cellWidth: 15 },
                1: { fontStyle: 'bold', cellWidth: 20 },
                2: { fontStyle: 'italic', cellWidth: 25 }
            }
        });

        y = (doc as any).lastAutoTable.finalY + 15;
    }

    // -- Images --
    if (reportImages.length > 0) {
        doc.addPage();
        doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.rect(0, 0, 210, 30, 'F');
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("BILDER / SKIZZEN", 105, 20, { align: 'center' });

        let yImg = 40;
        reportImages.forEach((img) => {
             try {
                const imgProps = doc.getImageProperties(img);
                const pdfWidth = 180; 
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                
                if (yImg + pdfHeight > 280) { 
                    doc.addPage(); 
                    yImg = 20; 
                }
                
                doc.addImage(img, 'JPEG', 14, yImg, pdfWidth, pdfHeight);
                yImg += pdfHeight + 10;
             } catch(e) { console.error("Image add error", e); }
        });
    }

    doc.save(`scouting-report-${formData.homeTeam}-vs-${formData.awayTeam}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
        
        {/* Match Info Card */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Calendar className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spiel-Infos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Heim</label>
                    <input name="homeTeam" value={formData.homeTeam} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none font-bold" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Gast</label>
                    <input name="awayTeam" value={formData.awayTeam} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none font-bold" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Datum</label>
                    <input name="date" type="date" value={formData.date} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Anstoß</label>
                    <input name="kickoff" type="time" value={formData.kickoff} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Wettbewerb</label>
                    <input name="competition" value={formData.competition} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Ort</label>
                    <input name="location" value={formData.location} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Wetter</label>
                    <input name="weather" value={formData.weather} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Platz</label>
                    <input name="pitchCondition" value={formData.pitchCondition} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Scout</label>
                    <input name="scoutName" value={formData.scoutName} onChange={handleInputChange} className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
            </div>
        </section>

        {/* Liveticker Section */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Liveticker</h2>
            </div>

            <div className="space-y-4">
                <div className="flex gap-2">
                     <div className="w-20 shrink-0">
                         <input 
                            type="text" 
                            placeholder="Min" 
                            value={newTickerEntry.minute}
                            onChange={(e) => setNewTickerEntry({...newTickerEntry, minute: e.target.value})}
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none text-center font-bold" 
                         />
                     </div>
                     <div className="flex-1 flex gap-2">
                         <button 
                            onClick={() => setNewTickerEntry({...newTickerEntry, team: newTickerEntry.team === 'Home' ? 'Away' : 'Home'})}
                            className={`px-3 py-2 rounded font-bold transition-colors ${
                                newTickerEntry.team === 'Home' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'
                            }`}
                         >
                            {newTickerEntry.team === 'Home' ? 'HEIM' : 'GAST'}
                         </button>

                         <input 
                            type="text" 
                            placeholder="Ereignis Beschreibung..." 
                            value={newTickerEntry.text}
                            onChange={(e) => setNewTickerEntry({...newTickerEntry, text: e.target.value})}
                            className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && addTickerEvent()}
                         />
                     </div>
                     <button onClick={addTickerEvent} className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 p-2 rounded">
                         <Plus className="w-5 h-5" />
                     </button>
                </div>
                
                {/* Quick Buttons */}
                <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-700">
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Goal'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Goal' ? 'bg-green-600 border-green-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><Goal className="w-3 h-3"/> Tor</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Chance'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Chance' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><Zap className="w-3 h-3"/> Chance</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Shot'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Shot' ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><Target className="w-3 h-3"/> Schuss</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Corner'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Corner' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><CornerUpRight className="w-3 h-3"/> Eckball</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Freekick'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Freekick' ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><Activity className="w-3 h-3"/> Freistoß</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'YellowCard'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'YellowCard' ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><FileText className="w-3 h-3"/> Gelb</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'RedCard'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'RedCard' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><FileText className="w-3 h-3"/> Rot</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Sub'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Sub' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><RefreshCw className="w-3 h-3"/> Wechsel</button>
                    <button onClick={() => setNewTickerEntry({...newTickerEntry, type: 'Info'})} className={`px-2 py-1 rounded text-xs font-bold border flex items-center gap-1 ${newTickerEntry.type === 'Info' ? 'bg-slate-600 border-slate-400 text-white' : 'bg-slate-900 border-slate-600 text-slate-400'}`}><Info className="w-3 h-3"/> Info</button>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                    {tickerEvents.map(event => (
                        <div key={event.id} className={`flex items-start gap-3 p-3 rounded border ${event.team === 'Home' ? 'bg-slate-900/50 border-blue-900/30' : 'bg-slate-900/50 border-slate-700'}`}>
                            <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                                <span className="text-yellow-400 font-bold">{event.minute}'</span>
                                <span className={`text-[10px] uppercase px-1 rounded ${event.team === 'Home' ? 'bg-blue-900 text-blue-200' : 'bg-slate-700 text-slate-300'}`}>
                                    {event.team === 'Home' ? 'HEIM' : 'GAST'}
                                </span>
                            </div>
                            <div className="mt-0.5">{getEventIcon(event.type)}</div>
                            <div className="flex-1 text-sm text-slate-300">{event.text}</div>
                            <button onClick={() => removeTickerEvent(event.id)} className="text-slate-600 hover:text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Rosters */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RosterTable 
                players={homeRoster} 
                isHome={true} 
                coachName={formData.homeCoach} 
                onCoachChange={(v) => setFormData((prev:any) => ({ ...prev, homeCoach: v }))}
                onAddPlayer={() => addPlayer(true)}
                onRemovePlayer={(id) => removePlayer(id, true)}
                onUpdatePlayer={(id, f, v) => updatePlayer(id, f, v, true)}
            />
            <RosterTable 
                players={awayRoster} 
                isHome={false} 
                coachName={formData.awayCoach} 
                onCoachChange={(v) => setFormData((prev:any) => ({ ...prev, awayCoach: v }))}
                onAddPlayer={() => addPlayer(false)}
                onRemovePlayer={(id) => removePlayer(id, false)}
                onUpdatePlayer={(id, f, v) => updatePlayer(id, f, v, false)}
            />
        </section>

        {/* Player Assessment / Einzelkritik Section - Restored */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Auffällige Spieler / Einzelkritik</h2>
            </div>
            
            <div className="space-y-4">
                {playerInfos.map((info) => (
                    <div key={info.id} className="flex gap-4 p-4 bg-slate-900 rounded border border-slate-700 items-start">
                        <div className="w-16 space-y-2">
                             <input 
                                type="text" 
                                placeholder="#" 
                                value={info.number}
                                onChange={(e) => updatePlayerInfo(info.id, 'number', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-1 text-center text-white font-bold outline-none"
                             />
                        </div>
                        <div className="flex-1 space-y-2">
                             <input 
                                type="text" 
                                placeholder="Spieler Name" 
                                value={info.name}
                                onChange={(e) => updatePlayerInfo(info.id, 'name', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded p-1 px-2 text-white font-bold outline-none focus:border-yellow-400"
                             />
                             <textarea 
                                placeholder="Beurteilung / Auffälligkeiten..." 
                                value={info.info}
                                onChange={(e) => updatePlayerInfo(info.id, 'info', e.target.value)}
                                className="w-full h-24 bg-slate-800 border border-slate-600 rounded p-2 text-white text-sm outline-none resize-none focus:border-yellow-400"
                             />
                        </div>
                        <button onClick={() => removePlayerInfo(info.id)} className="text-slate-500 hover:text-red-500 mt-2">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                
                <button 
                    onClick={addPlayerInfo}
                    className="w-full py-3 border-2 border-dashed border-slate-700 text-slate-400 font-bold rounded hover:border-yellow-400 hover:text-yellow-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Weiteren Spieler beurteilen
                </button>
            </div>
        </section>

        {/* Analysis & Stats */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Layout className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Analyse & Statistik</h2>
            </div>
            
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase font-bold">Grundordnung / Formation</label>
                        <textarea 
                            name="formation" value={formData.formation} onChange={handleInputChange} 
                            className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none resize-none"
                            placeholder="z.B. 4-4-2 gegen den Ball, 4-3-3 mit Ball..."
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-slate-400 uppercase font-bold">Spielsystem & Auffälligkeiten</label>
                        <textarea 
                            name="systemInfo" value={formData.systemInfo} onChange={handleInputChange} 
                            className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none resize-none"
                            placeholder="Pressinghöhe, Aufbauspiel, Umschaltverhalten..."
                        />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs text-purple-400 uppercase font-bold">Eckbälle (Offensiv)</label>
                        <textarea 
                            name="cornersOffensive" value={formData.cornersOffensive} onChange={handleInputChange} 
                            className="w-full h-60 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-purple-400 outline-none resize-none"
                            placeholder="Varianten, Zielspieler..."
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-purple-400 uppercase font-bold">Eckbälle (Defensiv)</label>
                        <textarea 
                            name="cornersDefensive" value={formData.cornersDefensive} onChange={handleInputChange} 
                            className="w-full h-60 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-purple-400 outline-none resize-none"
                            placeholder="Zuteilung, Raum/Mann..."
                        />
                     </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs text-cyan-400 uppercase font-bold">Freistöße (Offensiv)</label>
                        <textarea 
                            name="freekicksOffensive" value={formData.freekicksOffensive} onChange={handleInputChange} 
                            className="w-full h-60 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-400 outline-none resize-none"
                            placeholder="Direkt/Indirekt, Varianten..."
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-cyan-400 uppercase font-bold">Freistöße (Defensiv)</label>
                        <textarea 
                            name="freekicksDefensive" value={formData.freekicksDefensive} onChange={handleInputChange} 
                            className="w-full h-60 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-cyan-400 outline-none resize-none"
                            placeholder="Mauerstellung, Organisation..."
                        />
                     </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-yellow-400 uppercase font-bold">Gesamtfazit</label>
                    <textarea 
                        name="summary" value={formData.summary} onChange={handleInputChange} 
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none resize-none"
                        placeholder="Zusammenfassende Bewertung des Spiels..."
                    />
                </div>
            </div>
        </section>

        {/* SWOT Analysis */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">SWOT Analyse</h2>
            </div>
            
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase font-bold">Allgemeine Einschätzung</label>
                    <textarea 
                        name="swotGeneral" value={formData.swotGeneral} onChange={handleInputChange} 
                        className="w-full h-20 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-slate-400 outline-none resize-none"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-xs text-green-400 uppercase font-bold">Stärken (Strengths)</label>
                        <textarea 
                            name="swotStrengths" value={formData.swotStrengths} onChange={handleInputChange} 
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-green-400 outline-none resize-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-red-400 uppercase font-bold">Schwächen (Weaknesses)</label>
                        <textarea 
                            name="swotWeaknesses" value={formData.swotWeaknesses} onChange={handleInputChange} 
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-red-400 outline-none resize-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-blue-400 uppercase font-bold">Chancen / Offensive</label>
                        <textarea 
                            name="swotAttack" value={formData.swotAttack} onChange={handleInputChange} 
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-400 outline-none resize-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-xs text-orange-400 uppercase font-bold">Risiken / Defensive</label>
                        <textarea 
                            name="swotDefense" value={formData.swotDefense} onChange={handleInputChange} 
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-orange-400 outline-none resize-none"
                        />
                     </div>
                </div>
            </div>
        </section>

        {/* Images Upload Section - Restored */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bilder & Skizzen</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {reportImages.map((img, idx) => (
                    <div key={idx} className="relative group aspect-video bg-slate-900 rounded border border-slate-600 overflow-hidden">
                        <img src={img} alt={`Report ${idx}`} className="w-full h-full object-cover" />
                        <button 
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                
                <label className="aspect-video bg-slate-900 border-2 border-dashed border-slate-600 rounded flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:text-yellow-400 text-slate-500 transition-colors">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-xs font-bold uppercase">Upload</span>
                    <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />
                </label>
            </div>
            <p className="text-xs text-slate-500 mt-2">Hinzugefügte Bilder werden automatisch in den PDF-Report übernommen.</p>
        </section>

        {/* Save Button */}
        <div className="sticky bottom-6 flex justify-end">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
              <Save className="w-5 h-5" />
              Scouting-Report als PDF speichern
          </button>
        </div>
    </div>
  );
};

export default TeamScouting;
