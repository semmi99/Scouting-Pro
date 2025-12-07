
import React, { useState, useRef } from 'react';
import { Save, Calendar, Activity, BarChart2, Upload, Flag } from 'lucide-react';
import { PlayerAttributes, Position, Foot } from '../types';
import AttributeRadar from './AttributeRadar';
import { jsPDF } from 'jspdf';

const PlayerScouting: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize detailed attributes
  const [attributes, setAttributes] = useState<PlayerAttributes>({
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
  });

  // Player & Match Data State
  const [playerData, setPlayerData] = useState({
    name: '',
    team: '',
    position: Position.MIT,
    foot: Foot.Rechts,
    height: '',
    dob: '',
    country: '',
    image: null as string | null, // Base64 image
    
    // Match Context
    opponent: '',
    competition: '',
    date: '',
    formation: '',
    result: '',
    season: '', 
    
    // Stats
    minutes: '90',
    goals: 0,
    assists: 0,
    starter: true,

    // Text Attributes
    strengths: '',
    weaknesses: '',

    // Tactical Text
    tacticalPossession: '',
    tacticalNoPossession: '',
    tacticalDefensive: '',
    tacticalOffensive: '',
    tacticalSummary: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setPlayerData(prev => ({ ...prev, [name]: checked }));
    } else {
        setPlayerData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPlayerData(prev => ({ ...prev, image: reader.result as string }));
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

  // Translation helpers for UI
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
      doc.text(playerData.name.toUpperCase(), nameX, 50, { align: align as any });
      
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
      doc.text(`Startformation: ${playerData.starter ? 'Ja' : 'Nein'}`, col1, y);
      doc.text(`Minuten: ${playerData.minutes}`, col2, y);
      y += 6;
      doc.text(`Tore: ${playerData.goals}`, col1, y);
      doc.text(`Assists: ${playerData.assists}`, col2, y);

      // -- Analysis Blocks --
      y += 15;
      doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.rect(0, y - 6, 210, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("ANALYSE", 105, y, { align: 'center' });

      y += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);

      // Stärken / Schwächen
      doc.setFont("helvetica", "bold");
      doc.text("STÄRKE", 14, y);
      doc.text("SCHWÄCHEN", 110, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(doc.splitTextToSize(playerData.strengths, 85), 14, y);
      doc.text(doc.splitTextToSize(playerData.weaknesses, 85), 110, y);

      y += 30;

      // -- Draw Charts Function --
      const drawChartSection = (title: string, dataObj: any) => {
          if (y > 220) { doc.addPage(); y = 20; }
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
          doc.text(title.toUpperCase(), 14, y);
          y += 6;

          // Draw Bars
          const keys = Object.keys(dataObj);
          const barHeight = 4;
          const labelWidth = 60;
          const maxBarWidth = 100;
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");

          keys.forEach(key => {
              if (y > 280) { doc.addPage(); y = 20; }
              const val = dataObj[key];
              const label = getLabel(key);

              // Label
              doc.setTextColor(0,0,0);
              doc.text(label, 14, y + 3);

              // Bar Background
              doc.setFillColor(240, 240, 240);
              doc.rect(14 + labelWidth, y, maxBarWidth, barHeight, 'F');

              // Bar Value
              // Color mapping based on value
              if (val >= 8) doc.setFillColor(34, 197, 94); // Green
              else if (val >= 6) doc.setFillColor(250, 204, 21); // Yellow
              else doc.setFillColor(239, 68, 68); // Red
              
              const currentBarWidth = (val / 10) * maxBarWidth;
              doc.rect(14 + labelWidth, y, currentBarWidth, barHeight, 'F');

              // Value Text
              doc.text(val.toString(), 14 + labelWidth + maxBarWidth + 2, y + 3);

              y += 7;
          });
          y += 5; // Spacing between charts
      };

      // Draw All 5 Charts
      drawChartSection("Charaktereigenschaften", attributes.character);
      drawChartSection("Technik", attributes.technique);
      drawChartSection("Athletik", attributes.athletics);
      drawChartSection("Mentalität", attributes.mentality);
      drawChartSection("Taktik", attributes.tactics);

      // -- Text Phases --
      if (y > 230) { doc.addPage(); y = 20; }
      
      const phases = [
          { title: "IM BALLBESITZ", text: playerData.tacticalPossession },
          { title: "GEGNER BALLBESITZ", text: playerData.tacticalNoPossession },
          { title: "DEFENSIVE", text: playerData.tacticalDefensive },
          { title: "OFFENSIVE", text: playerData.tacticalOffensive },
          { title: "ZUSAMMENFASSUNG", text: playerData.tacticalSummary },
      ];

      phases.forEach(phase => {
          if (y > 250) { doc.addPage(); y = 20; }
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(0,0,0);
          doc.text(phase.title, 14, y);
          y += 5;
          doc.setFont("helvetica", "normal");
          const lines = doc.splitTextToSize(phase.text, 182);
          doc.text(lines, 14, y);
          y += (lines.length * 5) + 8;
      });

      doc.save(`player-report-${playerData.name}.pdf`);
  };

  const ChartSection = ({ title, dataObj, category }: { title: string, dataObj: any, category: keyof PlayerAttributes }) => {
      const dataForRadar = Object.keys(dataObj).map(key => ({
          subject: getLabel(key).substring(0, 4) + '.', // Short label for radar
          fullSubject: getLabel(key),
          value: dataObj[key],
          fullMark: 10
      }));

      return (
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg mb-6">
              <h3 className="text-yellow-400 font-bold uppercase mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" /> {title}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Radar */}
                  <div className="h-64">
                      <AttributeRadar data={dataForRadar} />
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 content-start">
                      {Object.keys(dataObj).map((key) => (
                          <div key={key} className="bg-slate-900/50 p-2 rounded">
                              <div className="flex justify-between items-end mb-1">
                                  <label className="text-xs font-bold text-slate-300 truncate w-32" title={getLabel(key)}>
                                      {getLabel(key)}
                                  </label>
                                  <span className={`text-xs font-bold ${dataObj[key] >= 8 ? 'text-green-400' : 'text-yellow-400'}`}>
                                      {dataObj[key]}
                                  </span>
                              </div>
                              <input 
                                  type="range" 
                                  min="1" 
                                  max="10" 
                                  step="0.5"
                                  value={dataObj[key]} 
                                  onChange={(e) => handleAttrChange(category, key, e.target.value)}
                                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                              />
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Section: Profile Card & Match Context */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Card */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6 lg:col-span-1 flex flex-col items-center text-center relative group">
            <div 
                className="w-32 h-32 rounded-full overflow-hidden border-4 border-yellow-400 shadow-xl mb-4 relative bg-slate-700 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
            >
                {playerData.image ? (
                    <img src={playerData.image} alt="Player" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Upload className="w-8 h-8" />
                    </div>
                )}
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">Ändern</span>
                </div>
            </div>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
            />

            <input 
                name="name"
                value={playerData.name}
                onChange={handleInputChange}
                type="text" 
                placeholder="Spielername"
                className="text-2xl font-bold text-white mb-1 bg-transparent text-center focus:text-yellow-400 outline-none w-full" 
            />
            <input 
                name="team"
                value={playerData.team}
                onChange={handleInputChange}
                type="text"
                placeholder="Vereinsname" 
                className="text-slate-400 text-sm mb-4 bg-transparent text-center outline-none w-full"
            />

            <div className="w-full grid grid-cols-2 gap-4 text-left mt-2">
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                    <label className="text-xs text-yellow-400 uppercase font-bold block mb-1">Position</label>
                    <select 
                        name="position"
                        value={playerData.position}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-white outline-none"
                    >
                        {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                    <label className="text-xs text-yellow-400 uppercase font-bold block mb-1">Fuß</label>
                    <select 
                        name="foot"
                        value={playerData.foot}
                        onChange={handleInputChange}
                        className="w-full bg-transparent text-white outline-none"
                    >
                         {Object.values(Foot).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Größe (cm)</label>
                    <input 
                        name="height"
                        value={playerData.height}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="185" 
                        className="w-full bg-transparent text-white outline-none" 
                    />
                </div>
                <div className="bg-slate-900 p-3 rounded border border-slate-700">
                    <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Jahrgang</label>
                    <input 
                        name="dob"
                        value={playerData.dob}
                        onChange={handleInputChange}
                        type="number" 
                        placeholder="2000" 
                        className="w-full bg-transparent text-white outline-none" 
                    />
                </div>
                <div className="col-span-2 bg-slate-900 p-3 rounded border border-slate-700">
                     <label className="text-xs text-slate-500 uppercase font-bold block mb-1">Nationalität</label>
                     <input 
                        name="country"
                        value={playerData.country}
                        onChange={handleInputChange}
                        type="text" 
                        placeholder="Land" 
                        className="w-full bg-transparent text-white outline-none" 
                    />
                </div>
            </div>
        </div>

        {/* Match Context & Stats */}
        <div className="lg:col-span-2 space-y-6">
            <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Spielkontext</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Gegner</label>
                        <input 
                            name="opponent"
                            value={playerData.opponent}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                            placeholder="Gegnerisches Team" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Wettbewerb</label>
                        <input 
                            name="competition"
                            value={playerData.competition}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                            placeholder="Liga Name" 
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Saison</label>
                        <input 
                            name="season"
                            value={playerData.season}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                            placeholder="2024/25" 
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Datum</label>
                        <input 
                            name="date"
                            value={playerData.date}
                            onChange={handleInputChange}
                            type="date" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                        />
                    </div>
                     <div className="space-y-1">
                        <label className="text-xs text-slate-400 uppercase font-bold">Formation</label>
                        <input 
                            name="formation"
                            value={playerData.formation}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                            placeholder="4-3-3" 
                        />
                    </div>
                    <div className="space-y-1">
                         <label className="text-xs text-slate-400 uppercase font-bold">Ergebnis</label>
                         <input 
                            name="result"
                            value={playerData.result}
                            onChange={handleInputChange}
                            type="text" 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white focus:border-yellow-400 outline-none" 
                            placeholder="2 - 1" 
                        />
                    </div>
                </div>
            </section>

             <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex items-center gap-2 mb-4 border-b border-slate-700 pb-2">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">Statistiken</h2>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-slate-900 p-3 rounded border border-slate-600">
                        <input 
                            name="minutes"
                            value={playerData.minutes}
                            onChange={handleInputChange}
                            type="text"
                            className="w-full bg-transparent text-2xl font-bold text-yellow-400 text-center outline-none"
                        />
                        <span className="text-xs text-slate-400 uppercase">Min</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600">
                        <input 
                            name="goals"
                            value={playerData.goals}
                            onChange={handleInputChange}
                            type="number" 
                            className="w-full bg-transparent text-2xl font-bold text-green-400 text-center outline-none" 
                        />
                         <span className="text-xs text-slate-400 uppercase">Tore</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600">
                        <input 
                            name="assists"
                            value={playerData.assists}
                            onChange={handleInputChange}
                            type="number" 
                            className="w-full bg-transparent text-2xl font-bold text-blue-400 text-center outline-none" 
                        />
                         <span className="text-xs text-slate-400 uppercase">Vorlagen</span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded border border-slate-600 flex items-center justify-center">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                name="starter"
                                checked={playerData.starter}
                                onChange={handleInputChange}
                                type="checkbox" 
                                className="w-5 h-5 accent-yellow-400" 
                            />
                            <span className="text-xs text-slate-400 uppercase font-bold">Startelf</span>
                        </label>
                    </div>
                </div>
             </section>
        </div>
      </div>

      {/* 5 Diagrams Sections */}
      <section>
          <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Detail-Analyse (Diagramme)</h2>
          </div>
          
          <ChartSection title="Charaktereigenschaften" dataObj={attributes.character} category="character" />
          <ChartSection title="Technik" dataObj={attributes.technique} category="technique" />
          <ChartSection title="Athletik" dataObj={attributes.athletics} category="athletics" />
          <ChartSection title="Mentalität" dataObj={attributes.mentality} category="mentality" />
          <ChartSection title="Taktik" dataObj={attributes.tactics} category="tactics" />
      </section>

      {/* Strengths & Weaknesses Text */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-4 rounded border border-green-900/50">
                <h3 className="text-green-400 font-bold mb-2 text-sm uppercase flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-green-400"></div> Stärken
                </h3>
                <textarea 
                    name="strengths"
                    value={playerData.strengths}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-20 resize-none" 
                    placeholder="Besondere Fähigkeiten des Spielers..." 
                />
            </div>
            <div className="bg-slate-900/50 p-4 rounded border border-red-900/50">
                <h3 className="text-red-400 font-bold mb-2 text-sm uppercase flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400"></div> Schwächen
                </h3>
                <textarea 
                    name="weaknesses"
                    value={playerData.weaknesses}
                    onChange={handleInputChange}
                    className="w-full bg-transparent text-sm text-slate-300 outline-none h-20 resize-none" 
                    placeholder="Verbesserungspotenzial..." 
                />
            </div>
        </div>
      </section>

      {/* Tactical Behavior - PDF Structure */}
      <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-700 pb-2">
            <Flag className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">Taktisches Profil</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-xs text-blue-400 uppercase font-bold">Im Ballbesitz</label>
                <textarea 
                    name="tacticalPossession"
                    value={playerData.tacticalPossession}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 focus:border-blue-400 outline-none resize-none" 
                    placeholder="Passspiel, Dribbling, Entscheidungsfindung..." 
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-red-400 uppercase font-bold">Gegner Ballbesitz</label>
                <textarea 
                    name="tacticalNoPossession"
                    value={playerData.tacticalNoPossession}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 focus:border-red-400 outline-none resize-none" 
                    placeholder="Positionierung, Pressing, Rückwärtsbewegung..." 
                />
            </div>
            <div className="space-y-2">
                <label className="text-xs text-red-400 uppercase font-bold">Defensive</label>
                <textarea 
                    name="tacticalDefensive"
                    value={playerData.tacticalDefensive}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 focus:border-red-400 outline-none resize-none" 
                    placeholder="Defensives Zweikampfverhalten..." 
                />
            </div>
             <div className="space-y-2">
                <label className="text-xs text-green-400 uppercase font-bold">Offensive</label>
                <textarea 
                    name="tacticalOffensive"
                    value={playerData.tacticalOffensive}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 focus:border-green-400 outline-none resize-none" 
                    placeholder="Laufwege, Abschluss, Kreativität..." 
                />
            </div>
            <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-yellow-400 uppercase font-bold">Zusammenfassung</label>
                <textarea 
                    name="tacticalSummary"
                    value={playerData.tacticalSummary}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white h-24 focus:border-yellow-400 outline-none resize-none" 
                    placeholder="Abschließendes Urteil zur Leistung..." 
                />
            </div>
        </div>
      </section>

      {/* Save Action */}
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
