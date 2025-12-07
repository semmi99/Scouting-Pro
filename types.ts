
export enum Position {
  TW = 'TW',
  ABW = 'ABW',
  MIT = 'MIT',
  ANG = 'ANG'
}

export enum Foot {
  Links = 'Links',
  Rechts = 'Rechts',
  Beide = 'Beide'
}

export interface PlayerRosterItem {
  id: string;
  number: string;
  name: string;
  minutes: string;
  goalsAssists: string;
  rating: number; // 1-10
}

export interface PlayerInfoItem {
  id: string;
  number: string;
  name: string;
  info: string;
}

export interface TeamScoutingData {
  competition: string;
  location: string;
  date: string;
  kickoff: string;
  homeTeam: string;
  awayTeam: string;
  homeCoach: string;
  awayCoach: string;
  scoutName: string;
  weather: string;
  pitchCondition: string;
  summary: string;
  formation: string;
  systemInfo: string;
  currentForm: string;
  currentFormInfo: string;
  
  cornersOffensive: string;
  cornersDefensive: string;
  freekicksOffensive: string;
  freekicksDefensive: string;

  swot: {
    general: string;
    attack: string;
    defense: string;
    strengths: string;
    weaknesses: string;
  };
}

// Detailed Attribute Categories
export interface PlayerAttributes {
  character: {
    teamwork: number;
    leadership: number;
    intelligence: number;
    ambition: number;
    confidence: number;
    consistency: number;
    discipline: number;
    focus: number;
    motivation: number;
    respect: number;
    reliability: number;
  };
  technique: {
    passing: number;
    shootingTechnique: number;
    dexterity: number; // Geschicklichkeit
    dribbling: number;
    beatingOpponent: number; // Ausspielen des Gegners
    finishing: number; // Torschuss
    firstTouch: number; // Ballannahme
    ballControl: number; // Ballmitnahme
    crossing: number; // Flanken
    oneVsOne: number;
  };
  athletics: {
    acceleration: number; // Antritt
    cyclicSpeed: number;
    acyclicSpeed: number;
    reaction: number;
    stamina: number; // Ausdauer
    speedEndurance: number;
    powerEndurance: number;
    agility: number;
    jumping: number;
    throwing: number;
    explosiveness: number; // Schnellkraft
  };
  mentality: {
    attitude: number;
    bodyLanguage: number;
    visualization: number; // Bewegungs- und Handlungsvorstellung
    debriefingInput: number; // Einbringung Spielnachbesprechung
  };
  tactics: {
    anticipation: number;
    decisiveness: number;
    ballRecovery: number;
    ballProtection: number; // Ballsicherung
    scoringChance: number;
    goal: number;
    followUp: number; // Nachgehen nach Torschuss
    offering: number; // Anbieten
    meetBall: number; // Dem Ball entgegen gehen
    giveAndGo: number;
    creatingSpace: number;
    positionSwitch: number;
    holdPosition: number;
    communication: number;
    tacticalShot: number; // Torschuss (Taktik context)
  };
}

export interface PlayerScoutingData {
  name: string;
  team: string;
  position: Position;
  foot: Foot;
  dob: string;
  height: string;
  country: string;
  image: string | null;
  matchContext: {
    season: string;
    opponent: string;
    date: string;
    result: string;
    formation: string;
    starter: boolean;
    minutes: number;
    goals: number;
    assists: number;
  };
  textAttributes: {
    strengths: string;
    weaknesses: string;
  };
  tactical: {
    inPossession: string;
    outOfPossession: string;
    defensive: string;
    offensive: string;
    summary: string;
  };
}

// --- New Types for Shadow Team & Calendar ---

export interface ShadowPlayer {
  id: string;
  name: string;
  currentClub: string;
  position: Position;
  age: string;
  marketValue: string;
  contractEnds: string;
  priority: 'A' | 'B' | 'C'; // A = Top Target, B = Alternative, C = Perspective
  notes: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  type: 'Match' | 'Training' | 'Meeting';
}

export interface MatchSearchResult {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  location: string;
  league: string;
  distance: string;
}
