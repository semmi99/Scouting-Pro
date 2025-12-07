import React, { useState } from 'react';
import { MapPin, Search, CalendarPlus, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { MatchSearchResult, CalendarEvent } from '../types';

interface MatchFinderProps {
  onAddToCalendar: (evt: CalendarEvent) => void;
}

const API_KEY = 'eb005043530eed8a4d571bd43fee4913';
const API_HOST = 'v3.football.api-sports.io';

const MatchFinder: React.FC<MatchFinderProps> = ({ onAddToCalendar }) => {
  const [city, setCity] = useState('');
  // Radius is kept in UI for future use, though API v3 filters mainly by date/league. 
  // We will use city text filter on the client side.
  const [radius, setRadius] = useState('20'); 
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState<MatchSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!city) {
        setError("Bitte geben Sie eine Stadt ein.");
        return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
        const response = await fetch(`https://${API_HOST}/fixtures?date=${date}`, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': API_HOST
            }
        });

        if (!response.ok) {
            throw new Error(`API Fehler: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors && Object.keys(data.errors).length > 0) {
            console.error("API Error Response:", data.errors);
            throw new Error("Fehler beim Abrufen der Daten (API Limit oder Berechtigung).");
        }

        // Filter results client-side based on city input (Team name or Venue city)
        const cityLower = city.toLowerCase();
        
        const matches: MatchSearchResult[] = data.response
            .filter((item: any) => {
                const venueCity = item.fixture.venue.city?.toLowerCase() || '';
                const homeTeam = item.teams.home.name.toLowerCase();
                const awayTeam = item.teams.away.name.toLowerCase();
                // Loose search: City matches venue OR team name contains city
                return venueCity.includes(cityLower) || homeTeam.includes(cityLower) || awayTeam.includes(cityLower);
            })
            .map((item: any) => ({
                id: item.fixture.id.toString(),
                homeTeam: item.teams.home.name,
                awayTeam: item.teams.away.name,
                date: item.fixture.date.split('T')[0],
                time: item.fixture.date.split('T')[1].substring(0, 5),
                location: `${item.fixture.venue.name}, ${item.fixture.venue.city}`,
                league: item.league.name,
                distance: '-' // Cannot calculate real distance without user geo-coords
            }));

        setResults(matches);
        if (matches.length === 0) {
            setError("Keine Spiele für diese Stadt an diesem Datum gefunden.");
        }

    } catch (err) {
        console.error(err);
        // Fallback to simulation if API fails (e.g. CORS) or Key is invalid for this endpoint
        setError("Verbindung zur API fehlgeschlagen (evtl. CORS-Blocker im Browser). Bitte versuchen Sie es später oder nutzen Sie einen Proxy.");
    } finally {
        setLoading(false);
    }
  };

  const handleAdd = (match: MatchSearchResult) => {
      const evt: CalendarEvent = {
          id: Date.now().toString(),
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          date: match.date,
          time: match.time,
          location: match.location,
          type: 'Match'
      };
      onAddToCalendar(evt);
      alert('Spiel wurde zum Kalender hinzugefügt!');
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-6 h-6 text-yellow-400" /> Spielsuche (Live API)
            </h2>
            <p className="text-slate-400 mb-6">Suchen Sie nach Spielen weltweit (API-Football Integration).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto bg-slate-900 p-4 rounded-lg border border-slate-700">
                <input 
                    type="text" 
                    placeholder="Stadt oder Team" 
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-slate-800 text-white p-2 rounded border border-slate-600 outline-none focus:border-yellow-400"
                />
                {/* Visual placeholder for radius, not used in API v3 simple call */}
                <select 
                    value={radius}
                    onChange={e => setRadius(e.target.value)}
                    className="bg-slate-950 text-white p-2 rounded border border-slate-600 outline-none focus:border-yellow-400 opacity-50 cursor-not-allowed appearance-none"
                    disabled
                    title="Umkreissuche in API v3 nicht direkt verfügbar"
                >
                    <option value="20" className="bg-slate-900 text-white">Stadt-Filter aktiv</option>
                </select>
                <input 
                    type="date" 
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="bg-slate-800 text-white p-2 rounded border border-slate-600 outline-none focus:border-yellow-400"
                />
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold p-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? 'Lädt...' : <><Search className="w-4 h-4" /> Suchen</>}
                </button>
            </div>
            
            {error && (
                <div className="mt-4 bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded text-sm flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                </div>
            )}

            <div className="text-xs text-slate-500 mt-4 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1"><Wifi className="w-3 h-3 text-green-500" /> API Verbunden</span>
                <span className="flex items-center gap-1">Key: ...4913</span>
            </div>
        </div>

        {!loading && results.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-white font-bold border-b border-slate-700 pb-2 mb-4">Gefundene Spiele ({results.length})</h3>
                {results.map(match => (
                    <div key={match.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col md:flex-row justify-between items-center hover:bg-slate-800/80 transition-colors">
                        <div className="text-center md:text-left mb-4 md:mb-0">
                            <div className="text-lg font-bold text-white">
                                {match.homeTeam} <span className="text-yellow-400 mx-2">vs</span> {match.awayTeam}
                            </div>
                            <div className="text-sm text-slate-400 flex flex-col md:flex-row gap-2 md:gap-4 mt-1">
                                <span className="bg-slate-700 px-2 py-0.5 rounded text-xs text-white">{match.league}</span>
                                <span>{match.date}, {match.time} Uhr</span>
                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.location}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleAdd(match)}
                            className="bg-slate-700 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors text-sm font-bold border border-slate-600 hover:border-green-500"
                        >
                            <CalendarPlus className="w-4 h-4" /> Merken
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default MatchFinder;