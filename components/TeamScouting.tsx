import React, { useState, useRef } from 'react';
import { Plus, Trash2, Save, Calendar, MapPin, Flag, User, FileText, Activity, Goal, Users, Image as ImageIcon } from 'lucide-react';
import { PlayerRosterItem, PlayerInfoItem } from '../types';
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
    <div className="overflow-x-auto">
        <div className="bg-slate-900/50 p-2 border-b border-slate-700 flex gap-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${isHome ? 'bg-blue-600 text-white' : 'bg-slate-600 text-white'}`}>
                {isHome ? 'HEIM' : 'GAST'}
            </span>
            <input 
                type="text"
                placeholder="Trainer Name"
                value={coachName}
                onChange={(e) => onCoachChange(e.target.value)}
                className="bg-transparent text-sm text-white outline-none flex-1 placeholder-slate-500"
            />
        </div>
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="text-slate-400 border-b border-slate-600 text-xs uppercase">
                    <th className="p-2 w-12">Nr.</th>
                    <th className="p-2">Spieler</th>
                    <th className="p-2 w-16">Min</th>
                    <th className="p-2 w-16">T/V</th>
                    <th className="p-2 w-12">Note</th>
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
                                className="w-full bg-transparent text-white focus:text-yellow-400 outline-none text-center" 
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
                            <button onClick={() => onRemovePlayer(player.id)} className="text-slate-500 hover:text-red-500">
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
                className="w-full flex items-center justify-center gap-1 text-xs font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600 transition-colors"
            >
                <Plus className="w-3 h-3" /> Spieler
            </button>
        </div>
    </div>
);

// --- Main Component ---

const TeamScouting: React.FC = () => {
  const [homeRoster, setHomeRoster] = useState<PlayerRosterItem[]>([
    { id: 'h1', number: '1', name: '', minutes: '90', goalsAssists: '0/0', rating: 7 },
  ]);

  const [awayRoster, setAwayRoster] = useState<PlayerRosterItem[]>([
    { id: 'a1', number: '1', name: '', minutes: '90', goalsAssists: '0/0', rating: 7 },
  ]);

  const [playerInfos, setPlayerInfos] = useState<PlayerInfoItem[]>([
    { id: 'i1', number: '', name: '', info: '' },
  ]);

  // Additional Images
  const [reportImages, setReportImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    competition: '',
    location: '',
    date: '',
    kickoff: '',
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setPlayerInfos([...playerInfos, { id: Date.now().toString(), number: '', name: '', info: '' }]);
  };

  const removePlayerInfo = (id: string) => {
    setPlayerInfos(playerInfos.filter(p => p.id !== id));
  };

  const updatePlayerInfo = (id: string, field: keyof PlayerInfoItem, value: string) => {
    setPlayerInfos(playerInfos.map(p => (p.id === id ? { ...p, [field]: value } : p)));
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
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Match Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`${formData.homeTeam || 'Heim'} vs ${formData.awayTeam || 'Gast'}`, 105, 45, { align: 'center' });
    
    // Grid Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    let y = 55;
    const col1 = 14;
    const col2 = 80;
    const col3 = 140;

    doc.text(`Wettbewerb: ${formData.competition}`, col1, y);
    doc.text(`Ort: ${formData.location}`, col2, y);
    doc.text(`Datum: ${formData.date} ${formData.kickoff}`, col3, y);
    
    y += 7;
    doc.text(`Scout: ${formData.scoutName}`, col1, y);
    doc.text(`Wetter: ${formData.weather}`, col2, y);
    doc.text(`Platz: ${formData.pitchCondition}`, col3, y);

    // -- Summary --
    y += 15;
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("SPIEL ZUSAMMENFASSUNG", 16, y + 5.5);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    const summaryLines = doc.splitTextToSize(formData.summary, 182);
    doc.text(summaryLines, 14, y + 14);

    y += 14 + (summaryLines.length * 5);

    // -- Rosters (Page 4) --
    if (y > 230) { doc.addPage(); y = 20; }
    
    // Header
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("KADER & BEWERTUNG", 16, y + 5.5);
    y += 15;

    // Coaches
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`TRAINER (HEIM): ${formData.homeCoach}`, 14, y);
    doc.text(`TRAINER (GAST): ${formData.awayCoach}`, 109, y);
    
    y += 5;

    // Tables Side by Side
    // Left Table (Home)
    autoTable(doc, {
        startY: y,
        margin: { left: 14 },
        tableWidth: 88,
        head: [['Nr', 'Spieler', 'Min', 'T/A', 'Note']],
        body: homeRoster.map(p => [p.number, p.name, p.minutes, p.goalsAssists, p.rating]),
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 1 },
    });

    // Right Table (Away)
    autoTable(doc, {
        startY: y,
        margin: { left: 109 },
        tableWidth: 88,
        head: [['Nr', 'Spieler', 'Min', 'T/A', 'Note']],
        body: awayRoster.map(p => [p.number, p.name, p.minutes, p.goalsAssists, p.rating]),
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 1 },
    });

    // Get Y position after table (max of both)
    // @ts-ignore
    y = (doc.lastAutoTable.finalY) + 10;

    // -- Formation & Form --
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TAKTIK & FORM", 16, y + 5.5);
    
    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Formation: ${formData.formation}`, 14, y);
    doc.text(`Aktuelle Form: ${formData.currentForm}`, 105, y);
    
    y += 5;
    doc.setFont("helvetica", "normal");
    
    const sysInfoLines = doc.splitTextToSize("System Infos:\n" + formData.systemInfo, 85);
    doc.text(sysInfoLines, 14, y);
    
    const formInfoLines = doc.splitTextToSize("Form Details:\n" + formData.currentFormInfo, 85);
    doc.text(formInfoLines, 105, y);

    const maxLines = Math.max(sysInfoLines.length, formInfoLines.length);
    y += (maxLines * 5) + 10;

    // -- Player Infos (Page 6) --
    if (y > 230) { doc.addPage(); y = 20; }
    
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("SPIELER ANALYSE / INFOS", 16, y + 5.5);

    autoTable(doc, {
        startY: y + 10,
        head: [['Nr', 'Name', 'Infos zu den Spielern']],
        body: playerInfos.map(p => [p.number, p.name, p.info]),
        theme: 'grid',
        headStyles: { fillColor: secondaryColor, textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: { 
            0: { cellWidth: 15 }, 
            1: { cellWidth: 40 },
            2: { cellWidth: 'auto' }
        }
    });

    // @ts-ignore
    y = doc.lastAutoTable.finalY + 10;

    // -- Standardsituationen (Page 12-15) --
    if (y > 250) { doc.addPage(); y = 20; }

    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("STANDARDSITUATIONEN", 16, y + 5.5);

    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const sections = [
        { title: "Eckball Offensiv", text: formData.cornersOffensive },
        { title: "Eckball Defensiv", text: formData.cornersDefensive },
        { title: "Freistoß Offensiv", text: formData.freekicksOffensive },
        { title: "Freistoß Defensiv", text: formData.freekicksDefensive },
    ];

    sections.forEach((sec, i) => {
        if (y > 260) { doc.addPage(); y = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(sec.title, 14, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(sec.text, 182);
        doc.text(lines, 14, y);
        y += (lines.length * 5) + 8;
    });

    // -- SWOT Analysis (Page 16) --
    doc.addPage();
    y = 20;
    
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("ZUSAMMENFASSUNG / SWOT", 16, y + 5.5);

    y += 15;
    doc.setTextColor(0, 0, 0);

    // Gesamt
    doc.setFont("helvetica", "bold");
    doc.text("GESAMT", 14, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(formData.swotGeneral, 182), 14, y);
    y += 40;

    // Angriff vs Verteidigung
    doc.setFont("helvetica", "bold");
    doc.text("ANGRIFF", 14, y);
    doc.text("VERTEIDIGUNG", 105, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(formData.swotAttack, 85), 14, y);
    doc.text(doc.splitTextToSize(formData.swotDefense, 85), 105, y);
    y += 40;

    // Stärken vs Schwächen
    doc.setFont("helvetica", "bold");
    doc.text("STÄRKEN", 14, y);
    doc.text("SCHWÄCHEN", 105, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.text(doc.splitTextToSize(formData.swotStrengths, 85), 14, y);
    doc.text(doc.splitTextToSize(formData.swotWeaknesses, 85), 105, y);

    // -- Appended Images --
    if (reportImages.length > 0) {
        reportImages.forEach((imgData) => {
             doc.addPage();
             // Simple logic to fit image on page maintaining aspect ratio is hard without knowing dimensions
             // defaulting to max width
             doc.addImage(imgData, 'JPEG', 10, 10, 190, 0); // 0 height = auto
        });
    }

    // Save
    doc.save(`team-report-${formData.homeTeam}-vs-${formData.awayTeam}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Metadata Header */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
            <Calendar className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spieldaten</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Wettbewerb</label>
            <input 
                name="competition" 
                value={formData.competition} 
                onChange={handleInputChange}
                type="text" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                placeholder="Liga / Pokal" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Ort</label>
            <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input 
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    type="text" 
                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-9 text-white focus:border-yellow-400 outline-none" 
                    placeholder="Stadion / Stadt" 
                />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Datum</label>
            <input 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400 uppercase font-bold">Anstoß</label>
            <input 
                name="kickoff"
                value={formData.kickoff}
                onChange={handleInputChange}
                type="time" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
           <div className="md:col-span-2 grid grid-cols-3 items-center gap-4 bg-slate-900 p-4 rounded-lg border border-slate-700">
                <div className="text-center">
                    <input 
                        name="homeTeam"
                        value={formData.homeTeam}
                        onChange={handleInputChange}
                        type="text" 
                        placeholder="Heim" 
                        className="w-full bg-transparent text-center font-bold text-lg text-white placeholder-slate-600 focus:outline-none" 
                    />
                </div>
                <div className="text-center font-black text-yellow-400 text-2xl">VS</div>
                <div className="text-center">
                    <input 
                        name="awayTeam"
                        value={formData.awayTeam}
                        onChange={handleInputChange}
                        type="text" 
                        placeholder="Gast" 
                        className="w-full bg-transparent text-center font-bold text-lg text-white placeholder-slate-600 focus:outline-none" 
                    />
                </div>
           </div>
           <div className="space-y-4">
             <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Scout Name</label>
                <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input 
                        name="scoutName"
                        value={formData.scoutName}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 pl-9 text-white focus:border-yellow-400 outline-none" 
                        placeholder="Name des Scouts" 
                    />
                </div>
             </div>
             <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase font-bold">Wetter / Platz</label>
                <div className="flex gap-2">
                     <select 
                        name="weather"
                        value={formData.weather}
                        onChange={handleInputChange}
                        className="w-1/2 bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs outline-none"
                    >
                        <option>Sonnig</option>
                        <option>Regen</option>
                        <option>Wolken</option>
                    </select>
                    <select 
                        name="pitchCondition"
                        value={formData.pitchCondition}
                        onChange={handleInputChange}
                        className="w-1/2 bg-slate-900 border border-slate-600 rounded p-2 text-white text-xs outline-none"
                    >
                        <option>Top</option>
                        <option>Gut</option>
                        <option>Mittel</option>
                        <option>Schlecht</option>
                    </select>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* Game Summary */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
            <FileText className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spielbericht</h2>
        </div>
        <textarea 
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            rows={4}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-yellow-400 outline-none resize-y"
            placeholder="Allgemeiner Bericht über den Spielverlauf..."
        />
      </section>

      {/* Roster & Ratings (Two Teams) */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
            <Activity className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Kader & Bewertung</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-950/30 rounded-lg border border-slate-700 p-2">
                 <RosterTable 
                    players={homeRoster} 
                    isHome={true} 
                    coachName={formData.homeCoach}
                    onCoachChange={(val) => setFormData(prev => ({...prev, homeCoach: val}))}
                    onAddPlayer={() => addPlayer(true)}
                    onRemovePlayer={(id) => removePlayer(id, true)}
                    onUpdatePlayer={(id, field, val) => updatePlayer(id, field, val, true)}
                 />
            </div>
            <div className="bg-slate-950/30 rounded-lg border border-slate-700 p-2">
                 <RosterTable 
                    players={awayRoster} 
                    isHome={false} 
                    coachName={formData.awayCoach}
                    onCoachChange={(val) => setFormData(prev => ({...prev, awayCoach: val}))}
                    onAddPlayer={() => addPlayer(false)}
                    onRemovePlayer={(id) => removePlayer(id, false)}
                    onUpdatePlayer={(id, field, val) => updatePlayer(id, field, val, false)}
                 />
            </div>
        </div>
      </section>

       {/* Player Info (Page 6) */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
             <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Infos zu den Spielern</h2>
            </div>
            <button 
                onClick={addPlayerInfo}
                className="flex items-center gap-1 text-xs font-bold bg-yellow-400 text-slate-900 px-3 py-1.5 rounded hover:bg-yellow-300 transition-colors"
            >
                <Plus className="w-3 h-3" /> Info
            </button>
        </div>

        <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="text-slate-400 border-b border-slate-600 text-xs uppercase">
                        <th className="p-2 w-16">Nr.</th>
                        <th className="p-2 w-48">Name</th>
                        <th className="p-2">Infos / Analyse</th>
                        <th className="p-2 w-10"></th>
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {playerInfos.map((info) => (
                        <tr key={info.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                             <td className="p-2 align-top">
                                <input 
                                    type="text" 
                                    value={info.number}
                                    onChange={(e) => updatePlayerInfo(info.id, 'number', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-center" 
                                    placeholder="#" 
                                />
                            </td>
                            <td className="p-2 align-top">
                                <input 
                                    type="text" 
                                    value={info.name}
                                    onChange={(e) => updatePlayerInfo(info.id, 'name', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white font-bold" 
                                    placeholder="Spielername" 
                                />
                            </td>
                            <td className="p-2">
                                <textarea 
                                    value={info.info}
                                    onChange={(e) => updatePlayerInfo(info.id, 'info', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-20 resize-none outline-none focus:border-yellow-400" 
                                    placeholder="Detailanalyse..." 
                                />
                            </td>
                            <td className="p-2 align-top pt-4">
                                <button onClick={() => removePlayerInfo(info.id)} className="text-slate-500 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
      </section>

      {/* Tactics & Phases */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <Flag className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Taktik & Form</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Formation</label>
                    <input 
                        name="formation"
                        value={formData.formation}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                        placeholder="z.B. 4-2-3-1" 
                    />
                </div>
                
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Informationen zum System</label>
                    <textarea 
                        name="systemInfo"
                        value={formData.systemInfo}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-24 focus:border-yellow-400 outline-none resize-none" 
                        placeholder="Aufbauspiel, Pressing-Auslöser, etc." 
                    />
                </div>
            </div>
             <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Aktuelle Form (Kurz)</label>
                    <input 
                        name="currentForm"
                        value={formData.currentForm}
                        onChange={handleInputChange}
                        type="text" 
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                        placeholder="z.B. 3 Siege aus 5 Spielen" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Informationen zur Form</label>
                    <textarea 
                        name="currentFormInfo"
                        value={formData.currentFormInfo}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-24 focus:border-yellow-400 outline-none resize-none" 
                        placeholder="Jüngste Leistungen, Selbstvertrauen..." 
                    />
                </div>
             </div>
          </div>
      </section>

      {/* Standard Situationen (Set Pieces) */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <Goal className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Standardsituationen</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1">
                    <label className="text-xs text-green-400 uppercase font-bold flex items-center gap-1">
                        Eckball Offensiv
                    </label>
                    <textarea 
                        name="cornersOffensive"
                        value={formData.cornersOffensive}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-28 focus:border-green-500 outline-none resize-none" 
                        placeholder="Varianten, Zielspieler, Aufstellung..." 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-red-400 uppercase font-bold flex items-center gap-1">
                        Eckball Defensiv
                    </label>
                    <textarea 
                        name="cornersDefensive"
                        value={formData.cornersDefensive}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-28 focus:border-red-500 outline-none resize-none" 
                        placeholder="Deckungsart (Raum/Mann), Positionierung..." 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-green-400 uppercase font-bold flex items-center gap-1">
                        Freistoß Offensiv
                    </label>
                    <textarea 
                        name="freekicksOffensive"
                        value={formData.freekicksOffensive}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-28 focus:border-green-500 outline-none resize-none" 
                        placeholder="Direkt/Indirekt, Schützen, Tricks..." 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-red-400 uppercase font-bold flex items-center gap-1">
                        Freistoß Defensiv
                    </label>
                    <textarea 
                        name="freekicksDefensive"
                        value={formData.freekicksDefensive}
                        onChange={handleInputChange}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white h-28 focus:border-red-500 outline-none resize-none" 
                        placeholder="Mauerstellung, Organisation..." 
                    />
                </div>
          </div>
      </section>

      {/* SWOT Analysis - Page 16 Structure */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-white uppercase tracking-wider mb-6 border-b border-slate-700 pb-2">Zusammenfassung (SWOT)</h2>
        
        {/* Row 1: Gesamt */}
        <div className="mb-4">
             <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                <h3 className="text-yellow-400 font-bold mb-2 text-sm uppercase">Gesamt</h3>
                <textarea 
                    name="swotGeneral"
                    value={formData.swotGeneral}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-24 resize-none" 
                    placeholder="Strategische Gesamteinschätzung..." 
                />
            </div>
        </div>

        {/* Row 2: Angriff & Verteidigung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
             <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                <h3 className="text-blue-400 font-bold mb-2 text-sm uppercase">Angriff</h3>
                <textarea 
                    name="swotAttack"
                    value={formData.swotAttack}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-24 resize-none" 
                    placeholder="Offensiv-Analyse..." 
                />
            </div>
             <div className="bg-slate-900/50 p-4 rounded border border-slate-600">
                <h3 className="text-red-400 font-bold mb-2 text-sm uppercase">Verteidigung</h3>
                <textarea 
                    name="swotDefense"
                    value={formData.swotDefense}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-24 resize-none" 
                    placeholder="Defensiv-Analyse..." 
                />
            </div>
        </div>

        {/* Row 3: Stärken & Schwächen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded border border-green-900/50">
                <h3 className="text-green-400 font-bold mb-2 text-sm uppercase">Stärken</h3>
                <textarea 
                    name="swotStrengths"
                    value={formData.swotStrengths}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-24 resize-none" 
                    placeholder="Hauptstärken des Teams..." 
                />
            </div>
             <div className="bg-slate-900/50 p-4 rounded border border-red-900/50">
                <h3 className="text-red-400 font-bold mb-2 text-sm uppercase">Schwächen</h3>
                <textarea 
                    name="swotWeaknesses"
                    value={formData.swotWeaknesses}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-24 resize-none" 
                    placeholder="Hauptschwächen des Teams..." 
                />
            </div>
        </div>
      </section>

      {/* Image Upload for Report */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                <ImageIcon className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Bilder & Grafiken (Anhang)</h2>
          </div>
          <div className="space-y-4">
              <p className="text-sm text-slate-400">Laden Sie Bilder (Aufstellungen, Szenen, Taktikboards) hoch, die am Ende des Berichts angefügt werden.</p>
              
              <div className="flex items-center gap-4">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded transition-colors"
                  >
                      <Plus className="w-4 h-4" /> Bilder hinzufügen
                  </button>
                  <input 
                    type="file" 
                    multiple 
                    ref={fileInputRef} 
                    className="hidden" 
                    onChange={handleImageUpload} 
                    accept="image/*"
                  />
                  <span className="text-sm text-slate-400">{reportImages.length} Bilder ausgewählt</span>
              </div>

              {reportImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {reportImages.map((img, idx) => (
                          <div key={idx} className="relative group aspect-video bg-slate-900 rounded border border-slate-600 overflow-hidden">
                              <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                              <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                  <Trash2 className="w-3 h-3" />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </section>

      {/* Save Action */}
      <div className="sticky bottom-6 flex justify-end">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
              <Save className="w-5 h-5" />
              Team-Bericht als PDF speichern
          </button>
      </div>
    </div>
  );
};

export default TeamScouting;