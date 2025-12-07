import React, { useState, useRef, useEffect } from 'react';
import { Save, Activity, BarChart2, Upload } from 'lucide-react';
import { PlayerAttributes, Position, Foot } from '../types';
import AttributeRadar from './AttributeRadar';
import { jsPDF } from 'jspdf';

// --- Helper Functions & Sub-Components defined OUTSIDE ---

const getLabel = (key: string) => {
    const labels: Record<string, string> = {
        // Character
        teamwork: 'Teamfähigkeit', leadership: 'Führungseigenschaften', intelligence: 'Spielintelligenz',
        ambition: 'Ehrgeiz', confidence: 'Selbstvertrauen', consistency: 'Konsequenz',
        discipline: 'Disziplin', focus: 'Fokussierung', motivation: 'Motivation',
        respect: 'Respekt', reliability: 'Zuverlässigkeit',
        // Technique
        passing: 'Passspiel', shootingTechnique: 'Schusstechnik', dexterity: 'Geschicklichkeit',
        dribbling: 'Dribbling', beatingOpponent: 'Ausspielen des Gegners', finishing: 'Torschuss',
        firstTouch: 'Ballannahme', ballControl: 'Ballmitnahme', crossing: 'Flanken', oneVsOne: '1 gegen 1',
        // Athletics
        acceleration: 'Antritt', cyclicSpeed: 'Zykl. Schnelligkeit', acyclicSpeed: 'Azykl. Schnelligkeit',
        reaction: 'Reaktion', stamina: 'Ausdauer', speedEndurance: 'Schnelligkeitsausdauer',
        powerEndurance: 'Kraftausdauer', agility: 'Beweglichkeit', jumping: 'Sprungkraft',
        throwing: 'Wurfkraft', explosiveness: 'Schnellkraft',
        // Mentality
        attitude: 'Einstellungen', bodyLanguage: 'Körperhaltung',
        visualization: 'Bewegungs-/Handlungsvorstellung', debriefingInput: 'Spielnachbesprechung',
        // Tactics
        anticipation: 'Antizipation', decisiveness: 'Entscheidungsfreude', ballRecovery: 'Balleroberung',
        ballProtection: 'Ballsicherung', scoringChance: 'Torchance', goal: 'Tor',
        followUp: 'Nachgehen (Tor)', offering: 'Anbieten', meetBall: 'Dem Ball entgegen',
        giveAndGo: 'Give and Go', creatingSpace: 'Räume schaffen', positionSwitch: 'Positionswechsel',
        holdPosition: 'Position halten', communication: 'Kommunikation', tacticalShot: 'Torschuss (Taktik)'
    };
    return labels[key] || key;
};

const ChartSection = ({ title, categoryKey, data, onAttrChange }: { title: string, categoryKey: keyof PlayerAttributes, data: any, onAttrChange: (cat: keyof PlayerAttributes, key: string, val: string) => void }) => {
    const chartData = Object.keys(data).map(key => ({
        subject: getLabel(key),
        value: data[key],
        fullMark: 10
    }));

    return (
       <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg break-inside-avoid">
           <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
               <BarChart2 className="w-5 h-5 text-yellow-400" />
               <h2 className="text-xl font-bold text-white uppercase tracking-wider">{title}</h2>
           </div>
           
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
               <div className="h-full min-h-[300px]">
                    <AttributeRadar data={chartData} />
               </div>
               <div className="space-y-4">
                   {Object.keys(data).map((key) => (
                       <div key={key} className="flex items-center gap-4">
                           <label className="text-xs font-bold text-slate-300 w-32 uppercase truncate" title={getLabel(key)}>
                               {getLabel(key)}
                           </label>
                           <input 
                               type="range" 
                               min="1" max="10" step="0.5"
                               value={data[key]}
                               onChange={(e) => onAttrChange(categoryKey, key, e.target.value)}
                               className="flex-1 accent-yellow-400 h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                           />
                           <span className={`text-sm font-bold w-8 text-center ${
                               data[key] >= 8 ? 'text-green-400' : data[key] >= 5 ? 'text-yellow-400' : 'text-red-400'
                           }`}>
                               {data[key]}
                           </span>
                       </div>
                   ))}
               </div>
           </div>
       </section>
    );
 };

// --- Main Component ---

const PlayerScouting: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize detailed attributes from LocalStorage
  const [attributes, setAttributes] = useState<PlayerAttributes>(() => {
    const saved = localStorage.getItem('scouting_player_attributes');
    return saved ? JSON.parse(saved) : {
        character: {
            teamwork: 7, leadership: 6, intelligence: 7, ambition: 8, confidence: 7,
            consistency: 6, discipline: 8, focus: 7, motivation: 8, respect: 9, reliability: 7
        },
        technique: {
            passing: 7, shootingTechnique: 6, dexterity: 7, dribbling: 8,
            beatingOpponent: 7, finishing: 6, firstTouch: 8, ballControl: 8,
            crossing: 6, oneVsOne: 7
        },
        athletics: {
            acceleration: 8, cyclicSpeed: 7, acyclicSpeed: 7, reaction: 8,
            stamina: 8, speedEndurance: 7, powerEndurance: 7, agility: 8,
            jumping: 6, throwing: 5, explosiveness: 7
        },
        mentality: {
            attitude: 9, bodyLanguage: 8, visualization: 7, debriefingInput: 8
        },
        tactics: {
            anticipation: 7, decisiveness: 7, ballRecovery: 6, ballProtection: 7,
            scoringChance: 7, goal: 6, followUp: 7, offering: 8, meetBall: 8,
            giveAndGo: 7, creatingSpace: 8, positionSwitch: 6, holdPosition: 7,
            communication: 7, tacticalShot: 6
        }
    };
  });

  // Player & Match Data State from LocalStorage
  const [playerData, setPlayerData] = useState(() => {
    const saved = localStorage.getItem('scouting_player_data');
    return saved ? JSON.parse(saved) : {
        name: '',
        team: '',
        position: Position.MIT,
        foot: Foot.Rechts,
        height: '',
        dob: '',
        country: '',
        image: null as string | null,
        
        opponent: '',
        competition: '',
        date: '',
        formation: '',
        result: '',
        season: '', 
        
        minutes: '90',
        goals: 0,
        assists: 0,
        starter: true,

        strengths: '',
        weaknesses: '',

        tacticalPossession: '',
        tacticalNoPossession: '',
        tacticalDefensive: '',
        tacticalOffensive: '',
        tacticalSummary: ''
    };
  });

  // --- Persistence Effects (Auto-Save) ---
  useEffect(() => { localStorage.setItem('scouting_player_attributes', JSON.stringify(attributes)); }, [attributes]);
  useEffect(() => { localStorage.setItem('scouting_player_data', JSON.stringify(playerData)); }, [playerData]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setPlayerData((prev: any) => ({ ...prev, [name]: checked }));
    } else {
        setPlayerData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlayerData((prev: any) => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttrChange = (category: keyof PlayerAttributes, key: string, value: string) => {
    setAttributes(prev => ({
        ...prev,
        [category]: {
            ...prev[category],
            [key]: parseFloat(value)
        }
    }));
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
      doc.text("SPIELER ANALYSE", 130, 20);

      // -- Player Image & Name --
      let y = 45;

      // Add Image if exists
      if (playerData.image) {
          try {
             doc.addImage(playerData.image, 'JPEG', 14, 35, 30, 30);
          } catch (e) {
              console.error("Could not add image", e);
          }
      }

      doc.setFontSize(18);
      doc.setTextColor(0, 200, 100); 
      doc.setFont("helvetica", "bold");
      const nameX = playerData.image ? 50 : 105;
      const align = playerData.image ? 'left' : 'center';
      // @ts-ignore
      doc.text(playerData.name.toUpperCase(), nameX, 50, { align: align });
      
      // Reset Y
      y = 75;

      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, y - 6, 210, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text("SPIELER DETAILS", 105, y, { align: 'center' });

      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      
      const col1 = 14;
      const col2 = 110;

      doc.text(`Geb. Datum: ${playerData.dob}`, col1, y);
      doc.text(`Größe: ${playerData.height} cm`, col2, y);
      y += 6;
      doc.text(`Starker Fuß: ${playerData.foot}`, col1, y);
      doc.text(`Land: ${playerData.country}`, col2, y);
      y += 6;
      doc.text(`Position: ${playerData.position}`, col1, y);
      doc.text(`Team: ${playerData.team}`, col2, y);

      // -- Match Details --
      y += 15;
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, y - 6, 210, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("MATCH DETAILS", 105, y, { align: 'center' });

      y += 10;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");

      doc.text(`Verein: ${playerData.team}`, col1, y);
      doc.text(`Saison: ${playerData.season}`, col2, y);
      y += 6;
      doc.text(`Match: vs ${playerData.opponent}`, col1, y);
      doc.text(`Datum: ${playerData.date}`, col2, y);
      y += 6;
      doc.text(`Formation: ${playerData.formation}`, col1, y);
      doc.text(`Ergebnis: ${playerData.result}`, col2, y);
      y += 6;
      doc.text(`Startelf: ${playerData.starter ? 'Ja' : 'Nein'}`, col1, y);
      doc.text(`Minuten: ${playerData.minutes}`, col2, y);
      y += 6;
      doc.text(`Tore: ${playerData.goals}`, col1, y);
      doc.text(`Assists: ${playerData.assists}`, col2, y);

      // -- Tactical Summary Page --
      doc.addPage();
      y = 20;
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, y - 6, 210, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TAKTIK & ANALYSE", 105, y, { align: 'center' });
      y += 15;
      
      const textSections = [
        { t: "Stärken", c: playerData.strengths },
        { t: "Schwächen", c: playerData.weaknesses },
        { t: "Im Ballbesitz", c: playerData.tacticalPossession },
        { t: "Gegner Ballbesitz", c: playerData.tacticalNoPossession },
        { t: "Defensivverhalten", c: playerData.tacticalDefensive },
        { t: "Offensivverhalten", c: playerData.tacticalOffensive },
        { t: "Zusammenfassung", c: playerData.tacticalSummary },
      ];

      doc.setTextColor(0,0,0);
      doc.setFontSize(10);
      
      textSections.forEach(sec => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFont("helvetica", "bold");
          doc.text(sec.t, 14, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(sec.c, 180);
          doc.text(lines, 14, y);
          y += (lines.length * 5) + 8;
      });

      // -- Diagrams (Bar Charts) --
      const drawBarChart = (title: string, dataObj: any) => {
          doc.addPage();
          doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.rect(0, 14, 210, 8, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(title.toUpperCase(), 105, 20, { align: 'center' });

          let chartY = 40;
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(9);

          Object.entries(dataObj).forEach(([key, val]) => {
              const label = getLabel(key);
              const score = Number(val);
              
              // Label
              doc.text(label, 14, chartY);
              
              // Bar Background
              doc.setFillColor(230, 230, 230);
              doc.roundedRect(60, chartY - 3, 130, 4, 1, 1, 'F');

              // Bar Fill
              if (score > 0) {
                  // Color gradient logic simulation
                  if (score >= 8) doc.setFillColor(34, 197, 94); // Green
                  else if (score >= 5) doc.setFillColor(234, 179, 8); // Yellow
                  else doc.setFillColor(239, 68, 68); // Red
                  
                  const width = (score / 10) * 130;
                  doc.roundedRect(60, chartY - 3, width, 4, 1, 1, 'F');
              }
              
              // Score Text
              doc.text(score.toString(), 195, chartY);

              chartY += 12;
          });
      };

      drawBarChart("Charaktereigenschaften", attributes.character);
      drawBarChart("Technik", attributes.technique);
      drawBarChart("Athletik", attributes.athletics);
      drawBarChart("Mentalität", attributes.mentality);
      drawBarChart("Taktik", attributes.tactics);

      doc.save(`player-report-${playerData.name}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
        
        {/* Basic Info */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spieler Profil</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
                {/* Image Upload */}
                <div className="shrink-0">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-40 h-40 bg-slate-900 border-2 border-dashed border-slate-600 rounded-full flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 transition-colors overflow-hidden relative group"
                    >
                        {playerData.image ? (
                            <img src={playerData.image} alt="Player" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                <span className="text-xs text-slate-500 uppercase font-bold">Foto</span>
                            </>
                        )}
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-bold">Ändern</span>
                         </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Name</label>
                        <input name="name" value={playerData.name} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Team</label>
                        <input name="team" value={playerData.team} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Position</label>
                        <select 
                            name="position" 
                            value={playerData.position} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white outline-none focus:border-yellow-400 appearance-none"
                        >
                            {Object.values(Position).map(p => <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Starker Fuß</label>
                        <select 
                            name="foot" 
                            value={playerData.foot} 
                            onChange={handleInputChange}
                            className="w-full bg-slate-950 border border-slate-600 rounded p-2 text-white outline-none focus:border-yellow-400 appearance-none"
                        >
                            {Object.values(Foot).map(f => <option key={f} value={f} className="bg-slate-900 text-white">{f}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Größe (cm)</label>
                        <input name="height" value={playerData.height} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Geburtsdatum</label>
                        <input name="dob" value={playerData.dob} onChange={handleInputChange} type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Land</label>
                        <input name="country" value={playerData.country} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                     </div>
                </div>
            </div>
        </section>

        {/* Match Context */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Match Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Saison</label>
                    <input name="season" value={playerData.season} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Gegner</label>
                    <input name="opponent" value={playerData.opponent} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Datum</label>
                    <input name="date" value={playerData.date} onChange={handleInputChange} type="date" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Formation</label>
                    <input name="formation" value={playerData.formation} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Ergebnis</label>
                    <input name="result" value={playerData.result} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Gespielte Min.</label>
                    <input name="minutes" value={playerData.minutes} onChange={handleInputChange} type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Tore</label>
                    <input name="goals" value={playerData.goals} onChange={handleInputChange} type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-xs text-slate-400 uppercase font-bold">Assists</label>
                    <input name="assists" value={playerData.assists} onChange={handleInputChange} type="number" className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" />
                 </div>
                 <div className="md:col-span-4 flex items-center gap-2 mt-2">
                     <input 
                        type="checkbox" 
                        name="starter" 
                        checked={playerData.starter} 
                        onChange={handleInputChange}
                        className="w-4 h-4 accent-yellow-400"
                     />
                     <label className="text-sm text-white">Startelf Einsatz</label>
                 </div>
            </div>
        </section>

        {/* Charts Section - Using Extracted Components */}
        <ChartSection title="Charaktereigenschaften" categoryKey="character" data={attributes.character} onAttrChange={handleAttrChange} />
        <ChartSection title="Technik" categoryKey="technique" data={attributes.technique} onAttrChange={handleAttrChange} />
        <ChartSection title="Athletik" categoryKey="athletics" data={attributes.athletics} onAttrChange={handleAttrChange} />
        <ChartSection title="Mentalität" categoryKey="mentality" data={attributes.mentality} onAttrChange={handleAttrChange} />
        <ChartSection title="Taktik" categoryKey="tactics" data={attributes.tactics} onAttrChange={handleAttrChange} />

        {/* Textual Analysis */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
                <Activity className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Taktische & Textanalyse</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label className="text-xs text-green-400 uppercase font-bold">Stärken</label>
                    <textarea 
                        name="strengths" value={playerData.strengths} onChange={handleInputChange}
                        className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-green-400 outline-none resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-red-400 uppercase font-bold">Schwächen</label>
                    <textarea 
                        name="weaknesses" value={playerData.weaknesses} onChange={handleInputChange}
                        className="w-full h-24 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-red-400 outline-none resize-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs text-blue-400 uppercase font-bold">Im Ballbesitz</label>
                    <textarea 
                        name="tacticalPossession" value={playerData.tacticalPossession} onChange={handleInputChange}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-blue-400 outline-none resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-orange-400 uppercase font-bold">Gegner Ballbesitz</label>
                    <textarea 
                        name="tacticalNoPossession" value={playerData.tacticalNoPossession} onChange={handleInputChange}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-orange-400 outline-none resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase font-bold">Defensivverhalten</label>
                    <textarea 
                        name="tacticalDefensive" value={playerData.tacticalDefensive} onChange={handleInputChange}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-slate-400 outline-none resize-none"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-slate-400 uppercase font-bold">Offensivverhalten</label>
                    <textarea 
                        name="tacticalOffensive" value={playerData.tacticalOffensive} onChange={handleInputChange}
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-slate-400 outline-none resize-none"
                    />
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <label className="text-xs text-yellow-400 uppercase font-bold">Zusammenfassung & Fazit</label>
                <textarea 
                    name="tacticalSummary" value={playerData.tacticalSummary} onChange={handleInputChange}
                    className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none resize-none"
                />
            </div>
        </section>

        {/* Save Button */}
        <div className="sticky bottom-6 flex justify-end">
          <button 
            onClick={generatePDF}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all"
          >
              <Save className="w-5 h-5" />
              Spieler-Bericht als PDF speichern
          </button>
        </div>
    </div>
  );
};

export default PlayerScouting;