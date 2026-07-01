// ============================================================
// World Cup 2026 — Round of 32 Knockout Data
// ============================================================

const TEAMS = {
  ZAF: { name: "South Africa", code: "ZAF", iso2: "za", group: "A" },
  CAN: { name: "Canada", code: "CAN", iso2: "ca", group: "C" },
  BRA: { name: "Brazil", code: "BRA", iso2: "br", group: "B" },
  JPN: { name: "Japan", code: "JPN", iso2: "jp", group: "E" },
  DEU: { name: "Germany", code: "DEU", iso2: "de", group: "F" },
  PRY: { name: "Paraguay", code: "PRY", iso2: "py", group: "H" },
  NLD: { name: "Netherlands", code: "NLD", iso2: "nl", group: "D" },
  MAR: { name: "Morocco", code: "MAR", iso2: "ma", group: "G" },
  CIV: { name: "Ivory Coast", code: "CIV", iso2: "ci", group: "I" },
  NOR: { name: "Norway", code: "NOR", iso2: "no", group: "K" },
  FRA: { name: "France", code: "FRA", iso2: "fr", group: "D" },
  SWE: { name: "Sweden", code: "SWE", iso2: "se", group: "J" },
  MEX: { name: "Mexico", code: "MEX", iso2: "mx", group: "A" },
  ECU: { name: "Ecuador", code: "ECU", iso2: "ec", group: "L" },
  ENG: { name: "England", code: "ENG", iso2: "gb-eng", group: "B" },
  COD: { name: "DR Congo", code: "COD", iso2: "cd", group: "G" },
  BEL: { name: "Belgium", code: "BEL", iso2: "be", group: "C" },
  SEN: { name: "Senegal", code: "SEN", iso2: "sn", group: "I" },
  USA: { name: "USA", code: "USA", iso2: "us", group: "F" },
  BIH: { name: "Bosnia & Herz.", code: "BIH", iso2: "ba", group: "L" },
  ESP: { name: "Spain", code: "ESP", iso2: "es", group: "E" },
  AUT: { name: "Austria", code: "AUT", iso2: "at", group: "J" },
  PRT: { name: "Portugal", code: "PRT", iso2: "pt", group: "H" },
  HRV: { name: "Croatia", code: "HRV", iso2: "hr", group: "K" },
  CHE: { name: "Switzerland", code: "CHE", iso2: "ch", group: "C" },
  DZA: { name: "Algeria", code: "DZA", iso2: "dz", group: "G" },
  AUS: { name: "Australia", code: "AUS", iso2: "au", group: "B" },
  EGY: { name: "Egypt", code: "EGY", iso2: "eg", group: "F" },
  ARG: { name: "Argentina", code: "ARG", iso2: "ar", group: "A" },
  CPV: { name: "Cape Verde", code: "CPV", iso2: "cv", group: "L" },
  COL: { name: "Colombia", code: "COL", iso2: "co", group: "D" },
  GHA: { name: "Ghana", code: "GHA", iso2: "gh", group: "H" },
};

const MATCHES_R32 = [
  // Left Hemisphere
  {
    id: "R32-1", matchNum: 73, date: "2026-06-28", time: "15:00 ET", venue: "SoFi Stadium, Los Angeles",
    team1: "ZAF", team2: "CAN", score1: 0, score2: 1, status: "finished", penaltyScore1: null, penaltyScore2: null, winner: "CAN", goals: []
  },
  {
    id: "R32-2", matchNum: 74, date: "2026-06-28", time: "19:00 ET", venue: "NRG Stadium, Houston",
    team1: "NLD", team2: "MAR", score1: 1, score2: 1, status: "finished", penaltyScore1: 2, penaltyScore2: 3, winner: "MAR", goals: []
  },
  {
    id: "R32-3", matchNum: 75, date: "2026-06-29", time: "13:00 ET", venue: "Gillette Stadium, Boston",
    team1: "DEU", team2: "PRY", score1: 1, score2: 1, status: "finished", penaltyScore1: 3, penaltyScore2: 4, winner: "PRY", goals: []
  },
  {
    id: "R32-4", matchNum: 76, date: "2026-06-29", time: "17:00 ET", venue: "Estadio BBVA, Monterrey",
    team1: "FRA", team2: "SWE", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-5", matchNum: 77, date: "2026-06-30", time: "13:00 ET", venue: "AT&T Stadium, Dallas",
    team1: "BEL", team2: "SEN", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-6", matchNum: 78, date: "2026-06-30", time: "17:00 ET", venue: "MetLife Stadium, New York/NJ",
    team1: "USA", team2: "BIH", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-7", matchNum: 79, date: "2026-06-30", time: "21:00 ET", venue: "Estadio Azteca, Mexico City",
    team1: "ESP", team2: "AUT", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-8", matchNum: 80, date: "2026-07-01", time: "12:00 ET", venue: "Mercedes-Benz Stadium, Atlanta",
    team1: "PRT", team2: "HRV", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  
  // Right Hemisphere
  {
    id: "R32-9", matchNum: 81, date: "2026-07-01", time: "16:00 ET", venue: "Lumen Field, Seattle",
    team1: "BRA", team2: "JPN", score1: 2, score2: 1, status: "finished", penaltyScore1: null, penaltyScore2: null, winner: "BRA", goals: []
  },
  {
    id: "R32-10", matchNum: 82, date: "2026-07-01", time: "19:00 ET", venue: "Levi's Stadium, San Francisco Bay Area",
    team1: "CIV", team2: "NOR", score1: 0, score2: 0, status: "live", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-11", matchNum: 83, date: "2026-07-02", time: "13:00 ET", venue: "Hard Rock Stadium, Miami",
    team1: "MEX", team2: "ECU", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-12", matchNum: 84, date: "2026-07-02", time: "16:00 ET", venue: "BC Place, Vancouver",
    team1: "ENG", team2: "COD", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-13", matchNum: 85, date: "2026-07-02", time: "19:00 ET", venue: "Lumen Field, Seattle",
    team1: "CHE", team2: "DZA", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-14", matchNum: 86, date: "2026-07-03", time: "13:00 ET", venue: "Estadio Akron, Guadalajara",
    team1: "COL", team2: "GHA", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-15", matchNum: 87, date: "2026-07-03", time: "16:00 ET", venue: "Arrowhead Stadium, Kansas City",
    team1: "AUS", team2: "EGY", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  },
  {
    id: "R32-16", matchNum: 88, date: "2026-07-03", time: "19:00 ET", venue: "Lincoln Financial Field, Philadelphia",
    team1: "ARG", team2: "CPV", score1: null, score2: null, status: "upcoming", penaltyScore1: null, penaltyScore2: null, winner: null, goals: []
  }
];

// Round of 16 bracket mapping:
// Each R16 match is fed by two R32 matches
const R16_BRACKET = [
  { id: "R16-1", feedFrom: ["R32-1", "R32-2"], winner: null, date: "2026-07-04" },
  { id: "R16-2", feedFrom: ["R32-3", "R32-4"], winner: null, date: "2026-07-04" },
  { id: "R16-3", feedFrom: ["R32-5", "R32-6"], winner: null, date: "2026-07-05" },
  { id: "R16-4", feedFrom: ["R32-7", "R32-8"], winner: null, date: "2026-07-05" },
  { id: "R16-5", feedFrom: ["R32-9", "R32-10"], winner: null, date: "2026-07-06" },
  { id: "R16-6", feedFrom: ["R32-11", "R32-12"], winner: null, date: "2026-07-06" },
  { id: "R16-7", feedFrom: ["R32-13", "R32-14"], winner: null, date: "2026-07-07" },
  { id: "R16-8", feedFrom: ["R32-15", "R32-16"], winner: null, date: "2026-07-07" },
];

const QF_BRACKET = [
  { id: "QF-1", feedFrom: ["R16-1", "R16-2"], winner: null, date: "2026-07-09" },
  { id: "QF-2", feedFrom: ["R16-3", "R16-4"], winner: null, date: "2026-07-10" },
  { id: "QF-3", feedFrom: ["R16-5", "R16-6"], winner: null, date: "2026-07-11" },
  { id: "QF-4", feedFrom: ["R16-7", "R16-8"], winner: null, date: "2026-07-12" },
];

const SF_BRACKET = [
  { id: "SF-1", feedFrom: ["QF-1", "QF-2"], winner: null, date: "2026-07-14" },
  { id: "SF-2", feedFrom: ["QF-3", "QF-4"], winner: null, date: "2026-07-15" },
];

const F_BRACKET = [
  { id: "F-1", feedFrom: ["SF-1", "SF-2"], winner: null, date: "2026-07-19" },
];

// Helper: get flag URL from ISO2 code
function getFlagUrl(iso2, size = 64) {
  return `https://flagcdn.com/${size}x${Math.round(size * 0.75)}/${iso2}.png`;
}

function getFlagUrlSvg(iso2) {
  return `https://flagcdn.com/${iso2}.svg`;
}
