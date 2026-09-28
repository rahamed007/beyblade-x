import React, { useState, useMemo } from 'react';

// ==========================================
// DATA TYPES & INTERFACES
// ==========================================
interface BeySlot {
  blade: string;
  ratchet: string;
  bit: string;
}

interface Blader {
  id: string;
  name: string;
  phone?: string;
  deck: [BeySlot, BeySlot, BeySlot];
  checkedIn: boolean;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pastOpponents: string[];
  hadBye: boolean;
}

interface MatchAction {
  type: string;
  pts: number;
  player: 1 | 2;
  isFoul?: boolean;
}

interface Match {
  id: string;
  stadium: number | string;
  p1Id: string;
  p2Id: string | null;
  p1Score: number;
  p2Score: number;
  p1Fouls: number;
  p2Fouls: number;
  status: 'pending' | 'live' | 'finished';
  winnerId: string | null;
  history: MatchAction[];
}

interface MarketItem {
  id: string;
  title: string;
  price: number;
  seller: string;
  phone: string;
  condition: string;
  category: 'Blade' | 'Ratchet' | 'Bit' | 'Starter Set' | 'Stadium';
}

// ==========================================
// OFFICIAL TAKARA TOMY PARTS CATALOG
// ==========================================
const BLADES = [
  "Phoenix Wing", "Wizard Rod", "Dran Buster", "Shark Edge", "Cobalt Dragoon",
  "Hells Chain", "Unicorn Sting", "Tyranno Beat", "Silver Wolf", "Aero Pegasus",
  "Knight Shield", "Ghost Circle", "Weiss Tiger", "Black Shell", "Leon Claw",
  "Dran Dagger", "Viper Tail", "Rhino Horn", "Wyvern Gale", "Knight Lance",
  "Sphinx Cowl", "Dran Sword", "Hells Scythe", "Chain Incendio"
];

const RATCHETS = [
  "1-60", "2-60", "3-60", "4-60", "5-60", "9-60",
  "3-70", "4-70", "9-70",
  "3-80", "4-80", "5-80", "0-80"
];

const BITS = [
  "Flat (F)", "Low Flat (LF)", "Gear Flat (GF)", "Ball (B)", "Orb (O)",
  "Hexa (H)", "Point (P)", "High Taper (HT)", "Accel (A)", "Cyclone (C)",
  "Quake (Q)", "Free Ball (FB)", "Glide (G)", "Unite (U)", "Dot (D)",
  "Needle (N)", "Gear Needle (GN)"
];

const PARTS_DATABASE = [
  { name: "Phoenix Wing", type: "Attack", weight: "38.2g", tier: "S-Tier", note: "Top-tier heavy attack blade with extreme recoil power." },
  { name: "Wizard Rod", type: "Stamina", weight: "35.5g", tier: "S-Tier", note: "Dominant stamina wheel. Best outward weight distribution." },
  { name: "Dran Buster", type: "Attack", weight: "36.1g", tier: "S-Tier", note: "Massive single-point impact blade for early burst/xtreme finishes." },
  { name: "Shark Edge", type: "Attack", weight: "34.8g", tier: "A-Tier", note: "Low-profile upper attack blade designed to lift opponents." },
  { name: "Cobalt Dragoon", type: "Attack (Left)", weight: "37.9g", tier: "S-Tier", note: "Left-spin attacker with high gear-line contact velocity." },
  { name: "Hells Chain", type: "Balance", weight: "34.0g", tier: "A-Tier", note: "Versatile defensive counter-attacker with layered contact points." },
  { name: "Unicorn Sting", type: "Balance", weight: "33.8g", tier: "A-Tier", note: "Dual-sided blade with high stamina preservation." },
  { name: "Tyranno Beat", type: "Attack", weight: "37.5g", tier: "S-Tier", note: "High-momentum smash attacker with thick peripheral weight." },
  { name: "Silver Wolf", type: "Defense", weight: "36.2g", tier: "A-Tier", note: "Free-spinning defensive contact ring for deflecting smashes." },
  { name: "Ball (B)", type: "Stamina", weight: "2.1g", tier: "S-Tier", note: "The gold standard for stamina preservation and late-spin preemption." },
  { name: "Gear Flat (GF)", type: "Attack", weight: "2.3g", tier: "S-Tier", note: "Maximum gear-line rail acceleration for fast Xtreme finishes." },
  { name: "Point (P)", type: "Balance", weight: "2.2g", tier: "A-Tier", note: "Switches between center defensive stance and explosive attack angles." },
  { name: "Low Flat (LF)", type: "Attack", weight: "2.1g", tier: "A-Tier", note: "Lower center of gravity for uppercuts underneath taller stamina Beys." }
];

// Initial seeded bladers from the official leaderboard
const INITIAL_NAMES = [
  "Khaled", "Rusab", "Samsul", "Azraf", "Didar", "Shakib",
  "Mymuna", "Ahnaf", "Joy", "Hrid", "Ayon", "Anadi",
  "Adib", "Tamim", "Mir Sakib", "Sayham", "Shohana", "Ayan Arabi",
  "Ehsan", "Rafin", "Zidan", "Salman", "Kento", "Rocche"
];

const makeDefaultDeck = (seed: number): [BeySlot, BeySlot, BeySlot] => [
  { blade: BLADES[seed % BLADES.length], ratchet: "9-60", bit: "Ball (B)" },
  { blade: BLADES[(seed + 2) % BLADES.length], ratchet: "5-60", bit: "Point (P)" },
  { blade: BLADES[(seed + 4) % BLADES.length], ratchet: "3-60", bit: "Low Flat (LF)" }
];

export default function App() {
  // Navigation: 'hub' | 'codex' | 'market' | 'registration' | 'pairings' | 'standings' | 'topcut'
  const [activeTab, setActiveTab] = useState<'hub' | 'codex' | 'market' | 'registration' | 'pairings' | 'standings' | 'topcut'>('hub');

  // Bladers State
  const [bladers, setBladers] = useState<Blader[]>(() =>
    INITIAL_NAMES.map((name, i) => ({
      id: `p-${i + 1}`,
      name,
      phone: '01700000000',
      deck: makeDefaultDeck(i),
      checkedIn: true,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pastOpponents: [],
      hadBye: false,
    }))
  );

  // Tournament Engine State
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<{ [key: number]: Match[] }>({});
  const [activeMatchModal, setActiveMatchModal] = useState<Match | null>(null);
  const [editingBlader, setEditingBlader] = useState<Blader | null>(null);
  const [topCutMatches, setTopCutMatches] = useState<any>(null);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regDeck, setRegDeck] = useState<[BeySlot, BeySlot, BeySlot]>([
    { blade: "Phoenix Wing", ratchet: "9-60", bit: "Gear Flat (GF)" },
    { blade: "Wizard Rod", ratchet: "5-60", bit: "Ball (B)" },
    { blade: "Dran Buster", ratchet: "1-60", bit: "Accel (A)" }
  ]);

  // Marketplace State
  const [marketItems, setMarketItems] = useState<MarketItem[]>([
    { id: 'm1', title: 'Takara Tomy BX-23 Phoenix Wing 9-60 GF (Mint)', price: 2450, seller: 'Tahmid_Spin', phone: '01711223344', condition: 'Brand New In Box', category: 'Starter Set' },
    { id: 'm2', title: 'Wizard Rod 5-60 Ball Competition Combo', price: 1800, seller: 'Zakir_Dhaka', phone: '01899887766', condition: 'Tournament Used (Clean)', category: 'Blade' },
    { id: 'm3', title: 'Official BX-07 Xtreme Stadium Set (Black/Green)', price: 4200, seller: 'Tanvir_Apex', phone: '01922334455', condition: 'Box Open / Never Used', category: 'Stadium' },
    { id: 'm4', title: 'Gear Flat (GF) + Point (P) Authentic Bit Pack', price: 950, seller: 'Sami_BD', phone: '01511224466', condition: 'Like New', category: 'Bit' }
  ]);
  const [showMarketModal, setShowMarketModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemSeller, setNewItemSeller] = useState("");
  const [newItemPhone, setNewItemPhone] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<'Blade' | 'Ratchet' | 'Bit' | 'Starter Set' | 'Stadium'>('Blade');

  // Codex Filter
  const [codexFilter, setCodexFilter] = useState("All");

  // Validate TT No-Repeat Rule
  const getDeckValidation = (deck: [BeySlot, BeySlot, BeySlot]) => {
    const blades = [deck[0].blade, deck[1].blade, deck[2].blade];
    const ratchets = [deck[0].ratchet, deck[1].ratchet, deck[2].ratchet];
    const bits = [deck[0].bit, deck[1].bit, deck[2].bit];

    const duplicateBlades = blades.filter((item, index) => blades.indexOf(item) !== index);
    const duplicateRatchets = ratchets.filter((item, index) => ratchets.indexOf(item) !== index);
    const duplicateBits = bits.filter((item, index) => bits.indexOf(item) !== index);

    const errors: string[] = [];
    if (duplicateBlades.length > 0) errors.push(`Duplicate Blade: ${duplicateBlades.join(', ')}`);
    if (duplicateRatchets.length > 0) errors.push(`Duplicate Ratchet: ${duplicateRatchets.join(', ')}`);
    if (duplicateBits.length > 0) errors.push(`Duplicate Bit: ${duplicateBits.join(', ')}`);

    return { isValid: errors.length === 0, errors };
  };

  const regValidation = useMemo(() => getDeckValidation(regDeck), [regDeck]);

  // Handle Blader Registration
  const handleRegisterBlader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      alert("Please enter blader name!");
      return;
    }
    if (!regValidation.isValid) {
      alert("Cannot register illegal deck! " + regValidation.errors.join(" | "));
      return;
    }

    const newBlader: Blader = {
      id: `p-${Date.now()}`,
      name: regName.trim(),
      phone: regPhone.trim() || 'N/A',
      deck: JSON.parse(JSON.stringify(regDeck)),
      checkedIn: true,
      wins: 0,
      losses: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pastOpponents: [],
      hadBye: false,
    };

    setBladers(prev => [newBlader, ...prev]);
    setRegName("");
    setRegPhone("");
    alert(`Blader "${newBlader.name}" successfully registered with deck!`);
  };

  // Swiss Pairings
  const generateSwissPairings = (pool: Blader[], roundNumber: number) => {
    const active = pool.filter(b => b.checkedIn);
    if (active.length < 2) return [];

    const sorted = [...active].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return (b.pointsFor - b.pointsAgainst) - (a.pointsFor - a.pointsAgainst);
    });

    const pairings: Match[] = [];
    const assigned = new Set<string>();

    let byeBlader: Blader | null = null;
    if (sorted.length % 2 !== 0) {
      for (let i = sorted.length - 1; i >= 0; i--) {
        if (!sorted[i].hadBye) {
          byeBlader = sorted[i];
          assigned.add(byeBlader.id);
          break;
        }
      }
      if (!byeBlader) {
        byeBlader = sorted[sorted.length - 1];
        assigned.add(byeBlader.id);
      }
    }

    const havePlayed = (id1: string, id2: string) => {
      const p1 = pool.find(b => b.id === id1);
      return p1?.pastOpponents?.includes(id2) || false;
    };

    for (let i = 0; i < sorted.length; i++) {
      const p1 = sorted[i];
      if (assigned.has(p1.id)) continue;

      let opponent: Blader | null = null;
      for (let j = i + 1; j < sorted.length; j++) {
        const p2 = sorted[j];
        if (!assigned.has(p2.id) && !havePlayed(p1.id, p2.id)) {
          opponent = p2;
          break;
        }
      }

      if (!opponent) {
        for (let j = i + 1; j < sorted.length; j++) {
          const p2 = sorted[j];
          if (!assigned.has(p2.id)) {
            opponent = p2;
            break;
          }
        }
      }

      if (opponent) {
        assigned.add(p1.id);
        assigned.add(opponent.id);
        pairings.push({
          id: `m_r${roundNumber}_${pairings.length + 1}`,
          stadium: pairings.length + 1,
          p1Id: p1.id,
          p2Id: opponent.id,
          p1Score: 0,
          p2Score: 0,
          p1Fouls: 0,
          p2Fouls: 0,
          status: 'pending',
          winnerId: null,
          history: []
        });
      }
    }

    if (byeBlader) {
      pairings.push({
        id: `m_r${roundNumber}_bye`,
        stadium: 'BYE',
        p1Id: byeBlader.id,
        p2Id: null,
        p1Score: 4,
        p2Score: 0,
        p1Fouls: 0,
        p2Fouls: 0,
        status: 'finished',
        winnerId: byeBlader.id,
        history: [{ type: 'Automatic Bye (+4 PTS)', pts: 4, player: 1 }]
      });
    }

    return pairings;
  };

  const handleStartTournament = () => {
    const checkedCount = bladers.filter(b => b.checkedIn).length;
    if (checkedCount < 2) {
      alert("Please check in at least 2 bladers to start!");
      return;
    }
    const r1 = generateSwissPairings(bladers, 1);
    setRounds({ 1: r1 });
    setCurrentRound(1);
    setActiveTab('pairings');
  };

  const standings = useMemo(() => {
    return [...bladers]
      .filter(b => b.checkedIn)
      .map(blader => {
        const buchholz = (blader.pastOpponents || []).reduce((acc: number, oppId: string) => {
          const opp = bladers.find(b => b.id === oppId);
          return acc + (opp ? opp.wins : 0);
        }, 0);
        return { ...blader, pointDiff: blader.pointsFor - blader.pointsAgainst, buchholz };
      })
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
        return b.pointDiff - a.pointDiff;
      });
  }, [bladers]);

  // Undo finished match from the pairings card
  const handleUndoCompletedMatch = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const roundMatches = rounds[currentRound] || [];
    const target = roundMatches.find(m => m.id === matchId);
    if (!target || target.status !== 'finished') return;

    if (!window.confirm("Undo this match result and re-open it for scoring?")) return;

    const { p1Id, p2Id, p1Score, p2Score, winnerId } = target;

    setBladers(prev => prev.map(b => {
      if (b.id === p1Id) {
        const wasWin = winnerId === p1Id;
        const past = [...b.pastOpponents];
        if (p2Id) {
          const idx = past.lastIndexOf(p2Id);
          if (idx !== -1) past.splice(idx, 1);
        }
        return {
          ...b,
          wins: Math.max(0, b.wins - (wasWin ? 1 : 0)),
          losses: Math.max(0, b.losses - (!wasWin ? 1 : 0)),
          pointsFor: Math.max(0, b.pointsFor - p1Score),
          pointsAgainst: Math.max(0, b.pointsAgainst - p2Score),
          pastOpponents: past,
          hadBye: p2Id === null ? false : b.hadBye
        };
      }
      if (b.id === p2Id) {
        const wasWin = winnerId === p2Id;
        const past = [...b.pastOpponents];
        const idx = past.lastIndexOf(p1Id);
        if (idx !== -1) past.splice(idx, 1);
        return {
          ...b,
          wins: Math.max(0, b.wins - (wasWin ? 1 : 0)),
          losses: Math.max(0, b.losses - (!wasWin ? 1 : 0)),
          pointsFor: Math.max(0, b.pointsFor - p2Score),
          pointsAgainst: Math.max(0, b.pointsAgainst - p1Score),
          pastOpponents: past
        };
      }
      return b;
    }));

    const resetMatch: Match = {
      ...target,
      status: 'pending',
      winnerId: null,
      p1Score: 0,
      p2Score: 0,
      p1Fouls: 0,
      p2Fouls: 0,
      history: []
    };

    setRounds(prev => ({
      ...prev,
      [currentRound]: prev[currentRound].map(m => m.id === matchId ? resetMatch : m)
    }));
  };

  // Referee scoring
  const handleApplyFinish = (playerNum: 1 | 2, finishType: string, points: number) => {
    if (!activeMatchModal || activeMatchModal.winnerId) return;
    const cur = { ...activeMatchModal };
    const newP1 = playerNum === 1 ? cur.p1Score + points : cur.p1Score;
    const newP2 = playerNum === 2 ? cur.p2Score + points : cur.p2Score;

    cur.history = [...(cur.history || []), {
      type: `${playerNum === 1 ? 'P1' : 'P2'} ${finishType} (+${points})`,
      pts: points,
      player: playerNum,
      isFoul: false
    }];

    cur.p1Score = newP1;
    cur.p2Score = newP2;
    cur.status = 'live';

    if (newP1 >= 4) {
      cur.winnerId = cur.p1Id;
      cur.status = 'finished';
    } else if (newP2 >= 4) {
      cur.winnerId = cur.p2Id;
      cur.status = 'finished';
    }
    setActiveMatchModal(cur);
  };

  const handleFoul = (playerNum: 1 | 2) => {
    if (!activeMatchModal || activeMatchModal.winnerId) return;
    const cur = { ...activeMatchModal };

    if (playerNum === 1) {
      cur.p1Fouls += 1;
      const penaltyAwarded = cur.p1Fouls % 2 === 0;
      if (penaltyAwarded) {
        cur.p2Score += 1;
        if (cur.p2Score >= 4) { cur.winnerId = cur.p2Id; cur.status = 'finished'; }
      }
      cur.history = [...(cur.history || []), {
        type: `P1 Foul (${cur.p1Fouls}/2)${penaltyAwarded ? ' -> +1 PT to P2' : ''}`,
        pts: penaltyAwarded ? 1 : 0,
        player: 1,
        isFoul: true
      }];
    } else {
      cur.p2Fouls += 1;
      const penaltyAwarded = cur.p2Fouls % 2 === 0;
      if (penaltyAwarded) {
        cur.p1Score += 1;
        if (cur.p1Score >= 4) { cur.winnerId = cur.p1Id; cur.status = 'finished'; }
      }
      cur.history = [...(cur.history || []), {
        type: `P2 Foul (${cur.p2Fouls}/2)${penaltyAwarded ? ' -> +1 PT to P1' : ''}`,
        pts: penaltyAwarded ? 1 : 0,
        player: 2,
        isFoul: true
      }];
    }
    setActiveMatchModal(cur);
  };

  const handleUndoStepInModal = () => {
    if (!activeMatchModal || !activeMatchModal.history || activeMatchModal.history.length === 0) return;
    const cur = { ...activeMatchModal };
    const history = [...cur.history];
    const lastAction = history.pop()!;

    if (lastAction.isFoul) {
      if (lastAction.player === 1) {
        if (lastAction.pts > 0) cur.p2Score = Math.max(0, cur.p2Score - lastAction.pts);
        cur.p1Fouls = Math.max(0, cur.p1Fouls - 1);
      } else {
        if (lastAction.pts > 0) cur.p1Score = Math.max(0, cur.p1Score - lastAction.pts);
        cur.p2Fouls = Math.max(0, cur.p2Fouls - 1);
      }
    } else {
      if (lastAction.player === 1) {
        cur.p1Score = Math.max(0, cur.p1Score - lastAction.pts);
      } else {
        cur.p2Score = Math.max(0, cur.p2Score - lastAction.pts);
      }
    }

    cur.winnerId = null;
    cur.status = history.length > 0 ? 'live' : 'pending';
    cur.history = history;
    setActiveMatchModal(cur);
  };

  const handleSaveMatchScore = () => {
    if (!activeMatchModal) return;
    setRounds(prev => {
      const matchArr = [...(prev[currentRound] || [])];
      const idx = matchArr.findIndex(m => m.id === activeMatchModal.id);
      if (idx !== -1) matchArr[idx] = activeMatchModal;
      return { ...prev, [currentRound]: matchArr };
    });

    if (activeMatchModal.status === 'finished') {
      const { p1Id, p2Id, p1Score, p2Score, winnerId } = activeMatchModal;
      setBladers(prev => prev.map(b => {
        if (b.id === p1Id) {
          const isWin = winnerId === p1Id;
          return {
            ...b,
            wins: b.wins + (isWin ? 1 : 0),
            losses: b.losses + (isWin ? 0 : 1),
            pointsFor: b.pointsFor + p1Score,
            pointsAgainst: b.pointsAgainst + p2Score,
            pastOpponents: p2Id ? [...b.pastOpponents, p2Id] : b.pastOpponents,
            hadBye: p2Id === null ? true : b.hadBye
          };
        }
        if (b.id === p2Id) {
          const isWin = winnerId === p2Id;
          return {
            ...b,
            wins: b.wins + (isWin ? 1 : 0),
            losses: b.losses + (isWin ? 0 : 1),
            pointsFor: b.pointsFor + p2Score,
            pointsAgainst: b.pointsAgainst + p1Score,
            pastOpponents: [...b.pastOpponents, p1Id]
          };
        }
        return b;
      }));
    }
    setActiveMatchModal(null);
  };

  const handleNextRound = () => {
    const currentMatches = rounds[currentRound] || [];
    const allDone = currentMatches.every(m => m.status === 'finished');
    if (!allDone) {
      alert("Please finish all active stadium matches before advancing!");
      return;
    }

    const nextR = currentRound + 1;
    if (nextR > 5) {
      const qualified = standings.slice(0, 4);
      setTopCutMatches({
        semi1: { title: 'Semi-Final 1 (Seed 1 vs 4)', p1: qualified[0], p2: qualified[3], p1Score: 0, p2Score: 0, winner: null },
        semi2: { title: 'Semi-Final 2 (Seed 2 vs 3)', p1: qualified[1], p2: qualified[2], p1Score: 0, p2Score: 0, winner: null },
        final: { title: 'Grand Championship Match', p1: null, p2: null, p1Score: 0, p2Score: 0, winner: null }
      });
      setActiveTab('topcut');
      return;
    }
    const nextPairings = generateSwissPairings(bladers, nextR);
    setRounds(prev => ({ ...prev, [nextR]: nextPairings }));
    setCurrentRound(nextR);
  };

  const activeMatches = rounds[currentRound] || [];
  const currentRoundFinished = activeMatches.length > 0 && activeMatches.every(m => m.status === 'finished');
  const checkedInCount = bladers.filter(b => b.checkedIn).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans pb-16 selection:bg-cyan-500 selection:text-black">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-[#0b101f]/95 backdrop-blur border-b border-cyan-500/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4500] to-cyan-400 p-[2px] flex items-center justify-center font-black text-black">
            <span className="text-sm bg-[#0a0f1d] text-cyan-400 w-full h-full rounded-[10px] flex items-center justify-center font-black">X</span>
          </div>
          <div>
            <h1 className="text-base font-black italic tracking-wider text-white">
              BEYBLADE X <span className="text-amber-400 text-[10px] border border-amber-400/80 px-1 py-0.5 rounded ml-1">BANGLADESH HUB</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Community Portal &bull; {checkedInCount} Active Bladers
            </p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('hub')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'hub' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            🏠 Dhaka Hub
          </button>
          <button
            onClick={() => setActiveTab('codex')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'codex' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            📖 Parts Codex
          </button>
          <button
            onClick={() => setActiveTab('market')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'market' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            🛒 BDT Bazar
          </button>
          <button
            onClick={() => setActiveTab('registration')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'registration' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            📝 Register & 3v3 Deck
          </button>
          <button
            onClick={() => setActiveTab('pairings')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'pairings' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            ⚔️ Tournament Arena
          </button>
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'standings' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
          >
            🎖️ Standings
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ========================================================================= */}
        {/* MODULE 1: COMMUNITY HUB & DHAKA MEETUPS                                  */}
        {/* ========================================================================= */}
        {activeTab === 'hub' && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-[#0c1426] via-[#101b38] to-[#070b14] border border-cyan-500/30 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl space-y-3">
                <span className="text-[11px] font-black tracking-widest uppercase bg-[#ff4500]/20 text-[#ff7744] border border-[#ff4500]/40 px-3 py-1 rounded-full">
                  ⚡ Official Bangladeshi Blader Network
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-wide">
                  DHAKA PRO CIRCUIT &bull; 2026
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Welcome to the ultimate community portal for Beyblade X in Bangladesh. Join regional battle meetups, verify authentic Takara Tomy parts, and compete in official local Swiss tourneys.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => setActiveTab('registration')}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider hover:brightness-110 shadow-lg shadow-cyan-500/20"
                  >
                    📝 Register For Tournament
                  </button>
                  <button
                    onClick={() => setActiveTab('codex')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider"
                  >
                    Explore Parts Codex
                  </button>
                </div>
              </div>
            </div>

            {/* Community Stats Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-cyan-400 font-mono">24+</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Ranked Bladers</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-amber-400 font-mono">4</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Active Dhaka Zones</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-emerald-400 font-mono">100%</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Takara Tomy Standard</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <div className="text-2xl font-black text-[#ff4500] font-mono">Khaled #1</div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-1">Reigning Champion</div>
              </div>
            </div>

            {/* Dhaka Meetup Zones */}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-3">
                📍 Active Dhaka Tournament Arenas & Meetup Hubs
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { name: "Dhanmondi Arena", loc: "Rabindra Sarobar / Lakezone", schedule: "Every Friday 4:00 PM", arenas: "4 Xtreme Stadiums" },
                  { name: "Banani Club Spot", loc: "Block D Playground", schedule: "Every Saturday 3:30 PM", arenas: "3 Xtreme Stadiums" },
                  { name: "Uttara Sector 7", loc: "Sector 7 Park Cafe", schedule: "Bi-Weekly Friday", arenas: "2 Xtreme Stadiums" },
                  { name: "Mirpur 2 Hub", loc: "National Stadium Complex Area", schedule: "Monthly Cup", arenas: "5 Xtreme Stadiums" }
                ].map((spot, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                    <div className="font-black text-sm text-cyan-400">{spot.name}</div>
                    <div className="text-xs text-slate-300 font-medium">{spot.loc}</div>
                    <div className="text-[11px] text-slate-400">{spot.schedule}</div>
                    <div className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded w-fit">
                      {spot.arenas}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety & Lead Alert */}
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs space-y-1">
              <strong className="text-rose-400 font-black">⚠️ Bangladeshi Bladers Safety Notice:</strong>
              <p>
                Please ensure you play with authentic Takara Tomy or Hasbro gear. Fake/counterfeit Beys commonly found in non-verified local toy stalls contain hazardous lead alloy and shatter easily on Xtreme lines.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 2: PARTS CODEX & META DATABASE                                    */}
        {/* ========================================================================= */}
        {activeTab === 'codex' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">Competitive Parts Codex</h2>
                <p className="text-xs text-slate-400">Weight metrics, combat types, and tier ratings for the current BD competitive metagame.</p>
              </div>
              <div className="flex gap-1.5 text-xs font-bold">
                {["All", "Attack", "Stamina", "Defense", "Balance"].map(t => (
                  <button
                    key={t}
                    onClick={() => setCodexFilter(t)}
                    className={`px-3 py-1.5 rounded-lg transition ${codexFilter === t ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PARTS_DATABASE
                .filter(p => codexFilter === "All" || p.type.includes(codexFilter))
                .map((part, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-white">{part.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        part.tier === 'S-Tier' ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' : 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30'
                      }`}>
                        {part.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-cyan-300 font-bold">{part.type}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-slate-300">{part.weight}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{part.note}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 3: BDT COMMUNITY BAZAR (BUY / SELL / TRADE)                      */}
        {/* ========================================================================= */}
        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div>
                <h2 className="text-base font-bold text-white">BDT Hobbyist Marketplace (৳)</h2>
                <p className="text-xs text-slate-400">Buy, sell, or trade authentic Takara Tomy Beys and official Stadiums within Dhaka.</p>
              </div>
              <button
                onClick={() => setShowMarketModal(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider"
              >
                + Post Listing
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {marketItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      ৳ {item.price.toLocaleString()} BDT
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{item.title}</h3>
                  <div className="text-[11px] text-slate-400">Condition: <strong className="text-slate-300">{item.condition}</strong></div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                    <span className="text-slate-400">Seller: <strong className="text-cyan-400">{item.seller}</strong></span>
                    <a href={`tel:${item.phone}`} className="text-cyan-400 hover:underline font-bold">
                      📞 {item.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 4: REGISTRATION & 3v3 DECK BUILDER (THE PLACE YOU REQUESTED)      */}
        {/* ========================================================================= */}
        {activeTab === 'registration' && (
          <div className="space-y-6">
            
            {/* 1. REGISTRATION FORM */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0c1426] to-[#070b14] border-2 border-cyan-500/30 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                <div>
                  <h2 className="text-lg font-black text-cyan-400 uppercase italic tracking-wider">
                    📝 Register New Blader & 3v3 Deck
                  </h2>
                  <p className="text-xs text-slate-400">
                    Takara Tomy Official Rule: A blader's 3-on-3 deck cannot share duplicate Blades, Ratchets, or Bits.
                  </p>
                </div>
                <span className="text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-700 px-3 py-1 rounded-full">
                  Official Bey Check
                </span>
              </div>

              <form onSubmit={handleRegisterBlader} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Blader Tag / Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      placeholder="e.g., Kurosu_Rayan, Tanvir, Didar"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Contact / Phone Number (Optional)</label>
                    <input
                      type="text"
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="017xxxxxxxx"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                {/* 3v3 Deck Builder Slots */}
                <div>
                  <label className="text-xs font-black text-amber-400 uppercase tracking-wider block mb-2">
                    Official 3-on-3 Deck Lineup
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[0, 1, 2].map((slotIdx) => (
                      <div key={slotIdx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                          <span className="text-cyan-400">Beyblade Slot #{slotIdx + 1}</span>
                          <span className="text-[10px] text-slate-500">Order Locked</span>
                        </div>

                        {/* Blade */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Blade</span>
                          <select
                            value={regDeck[slotIdx].blade}
                            onChange={e => {
                              const updated = [...regDeck] as [BeySlot, BeySlot, BeySlot];
                              updated[slotIdx].blade = e.target.value;
                              setRegDeck(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-400 font-medium"
                          >
                            {BLADES.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </div>

                        {/* Ratchet */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Ratchet</span>
                          <select
                            value={regDeck[slotIdx].ratchet}
                            onChange={e => {
                              const updated = [...regDeck] as [BeySlot, BeySlot, BeySlot];
                              updated[slotIdx].ratchet = e.target.value;
                              setRegDeck(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-400 font-medium"
                          >
                            {RATCHETS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>

                        {/* Bit */}
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">Bit</span>
                          <select
                            value={regDeck[slotIdx].bit}
                            onChange={e => {
                              const updated = [...regDeck] as [BeySlot, BeySlot, BeySlot];
                              updated[slotIdx].bit = e.target.value;
                              setRegDeck(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-400 font-medium"
                          >
                            {BITS.map(bit => <option key={bit} value={bit}>{bit}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Banner */}
                {!regValidation.isValid ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
                    <strong>⚠️ Illegal Deck:</strong> {regValidation.errors.join(' &bull; ')}
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs flex items-center gap-1.5 font-bold">
                    <span>✓</span> Deck passed Bey Check (100% legal Takara Tomy combo with zero repeats).
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!regValidation.isValid}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition active:scale-98"
                >
                  Confirm Registration & Add to Tournament Roster
                </button>
              </form>
            </div>

            {/* 2. REGISTERED PLAYERS LIST & DECK INSPECTION */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Registered Bladers Directory ({bladers.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    {checkedInCount} players checked in. Toggle check-in to exclude absent players from tournament pairings.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const allChecked = bladers.every(b => b.checkedIn);
                      setBladers(prev => prev.map(b => ({ ...b, checkedIn: !allChecked })));
                    }}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  >
                    {bladers.every(b => b.checkedIn) ? "Uncheck All" : "Check In All"}
                  </button>
                  <button
                    onClick={handleStartTournament}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider"
                  >
                    Start Round 1 Matchups ➔
                  </button>
                </div>
              </div>

              {/* Bladers Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bladers.map((b, idx) => {
                  const check = getDeckValidation(b.deck);
                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                        b.checkedIn ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-40'
                      }`}
                    >
                      <div>
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-cyan-400 font-bold text-xs">#{idx + 1}</span>
                            <span className="font-black text-sm text-white">{b.name}</span>
                          </div>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-300">
                            <span>{b.checkedIn ? 'Playing' : 'Absent'}</span>
                            <input
                              type="checkbox"
                              checked={b.checkedIn}
                              onChange={() => setBladers(prev => prev.map(p => p.id === b.id ? { ...p, checkedIn: !p.checkedIn } : p))}
                              className="accent-cyan-400 w-4 h-4 cursor-pointer rounded"
                            />
                          </label>
                        </div>

                        {/* Deck slots preview */}
                        <div className="space-y-1 mb-3 font-mono text-[11px]">
                          {b.deck.map((slot, sIdx) => (
                            <div key={sIdx} className="bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800/60 flex items-center justify-between">
                              <span className="text-slate-400 font-bold">Slot {sIdx + 1}:</span>
                              <span className="text-cyan-300 font-semibold truncate ml-1">
                                {slot.blade} <span className="text-slate-400 font-normal">{slot.ratchet} {slot.bit}</span>
                              </span>
                            </div>
                          ))}
                        </div>

                        {!check.isValid && (
                          <div className="p-1.5 bg-rose-950/50 border border-rose-500/40 rounded text-rose-300 text-[10px] mb-2 font-bold">
                            ⚠️ Deck has duplicate parts!
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => setEditingBlader(b)}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-lg text-xs font-bold"
                        >
                          ✏️ Edit Deck
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete ${b.name}?`)) {
                              setBladers(prev => prev.filter(p => p.id !== b.id));
                            }
                          }}
                          className="px-2 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 rounded-lg border border-rose-900/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 5: ARENA MATCHES (WITH ON-CARD UNDO BUTTON)                        */}
        {/* ========================================================================= */}
        {activeTab === 'pairings' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400">
                  R{currentRound}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    Swiss Round {currentRound} of 5
                    {currentRoundFinished && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        ✓ Round Ready
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400">First to 4 points. Tap any arena match to open referee score controls.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentRoundFinished && currentRound < 5 && (
                  <button
                    onClick={handleNextRound}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider animate-pulse"
                  >
                    Pair Round {currentRound + 1} ➔
                  </button>
                )}
                {currentRound === 5 && currentRoundFinished && (
                  <button
                    onClick={() => setActiveTab('topcut')}
                    className="bg-gradient-to-r from-[#ff4500] to-amber-500 text-white font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider"
                  >
                    🏆 Launch Top 4 Finals
                  </button>
                )}
              </div>
            </div>

            {activeMatches.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <p className="text-slate-400 text-sm mb-4">No active matches paired yet.</p>
                <button
                  onClick={handleStartTournament}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs uppercase"
                >
                  Generate Round 1 Matches
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMatches.map((m) => {
                  const p1 = bladers.find(b => b.id === m.p1Id);
                  const p2 = bladers.find(b => b.id === m.p2Id);
                  const isBye = m.stadium === 'BYE';
                  const isFinished = m.status === 'finished';

                  return (
                    <div
                      key={m.id}
                      onClick={() => !isBye && setActiveMatchModal(JSON.parse(JSON.stringify(m)))}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isBye
                          ? 'bg-slate-900/40 border-slate-800 cursor-default opacity-75'
                          : isFinished
                          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-900 border-cyan-900/60 hover:border-cyan-400 shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-cyan-400">
                          {isBye ? "Automatic Bye" : `Table / Stadium ${m.stadium}`}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          isFinished ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#ff4500]/20 text-[#ff7744] border border-[#ff4500]/30'
                        }`}>
                          {isBye ? "Free Pass (+4)" : isFinished ? "Finished" : "Live Battle"}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-bold text-sm ${m.winnerId === p1?.id ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                              {p1?.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {p1?.deck[0].blade} ({p1?.deck[0].ratchet} {p1?.deck[0].bit})
                            </div>
                          </div>
                          <span className="text-xl font-black font-mono text-cyan-400">{m.p1Score}</span>
                        </div>

                        <div className="text-center text-[10px] text-slate-600 font-bold uppercase">VS</div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`font-bold text-sm ${m.winnerId === p2?.id ? 'text-amber-400 font-black' : 'text-slate-200'}`}>
                              {isBye ? 'No Opponent (Bye Round)' : p2?.name}
                            </div>
                            {!isBye && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                                {p2?.deck[0].blade} ({p2?.deck[0].ratchet} {p2?.deck[0].bit})
                              </div>
                            )}
                          </div>
                          <span className="text-xl font-black font-mono text-cyan-400">{m.p2Score}</span>
                        </div>
                      </div>

                      {/* CARD CONTROLS (INCLUDES DIRECT UNDO BUTTON) */}
                      {!isBye && (
                        <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                          {isFinished ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleUndoCompletedMatch(m.id, e)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-black transition flex items-center gap-1 active:scale-95"
                              >
                                <span>↺ Undo Result / Reopen</span>
                              </button>
                              <span className="text-[11px] text-slate-400 font-semibold">Score Locked</span>
                            </>
                          ) : (
                            <div className="w-full text-center">
                              <span className="text-xs font-bold text-cyan-400 hover:text-cyan-300">
                                <span>▶</span> Tap to Open Referee Scoring
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 6: STANDINGS TABLE WITH BUCHHOLZ TIEBREAKERS                      */}
        {/* ========================================================================= */}
        {activeTab === 'standings' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090d18] shadow-2xl">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 text-center w-12">Rank</th>
                  <th className="p-3">Blader</th>
                  <th className="p-3">Primary Bey Combo</th>
                  <th className="p-3 text-center">W - L</th>
                  <th className="p-3 text-center">Pts Diff</th>
                  <th className="p-3 text-center">Total Score</th>
                  <th className="p-3 text-center">Buchholz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {standings.map((b, idx) => (
                  <tr key={b.id} className={idx < 4 ? 'bg-cyan-950/20' : ''}>
                    <td className="p-3 text-center font-bold text-cyan-400">#{idx + 1}</td>
                    <td className="p-3 font-sans font-bold text-slate-100 flex items-center gap-1.5">
                      {b.name}
                      {idx < 4 && <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 rounded-sm">TOP 4</span>}
                    </td>
                    <td className="p-3 text-xs text-slate-400 font-sans">
                      {b.deck[0].blade} {b.deck[0].ratchet} {b.deck[0].bit}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-200">{b.wins} - {b.losses}</td>
                    <td className="p-3 text-center text-slate-300">
                      {b.pointDiff > 0 ? `+${b.pointDiff}` : b.pointDiff}
                    </td>
                    <td className="p-3 text-center text-cyan-300">{b.pointsFor}</td>
                    <td className="p-3 text-center text-slate-400">{b.buchholz}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODULE 7: TOP 4 FINALS                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'topcut' && topCutMatches && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{topCutMatches.semi1.title}</div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-bold text-xs">
                  <span>{topCutMatches.semi1.p1.name} (Seed 1)</span>
                  <span>{topCutMatches.semi1.p1Score}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-bold text-xs">
                  <span>{topCutMatches.semi1.p2.name} (Seed 4)</span>
                  <span>{topCutMatches.semi1.p2Score}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{topCutMatches.semi2.title}</div>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-bold text-xs">
                  <span>{topCutMatches.semi2.p1.name} (Seed 2)</span>
                  <span>{topCutMatches.semi2.p1Score}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between font-bold text-xs">
                  <span>{topCutMatches.semi2.p2.name} (Seed 3)</span>
                  <span>{topCutMatches.semi2.p2Score}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* REFEREE SCORING MODAL */}
      {activeMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                  Stadium {activeMatchModal.stadium} &bull; Referee Console
                </h3>
                <p className="text-[11px] text-slate-400">First to 4 points (Spin 1pt, Over 2pts, Burst 2pts, Xtreme 3pts)</p>
              </div>
              <button onClick={() => setActiveMatchModal(null)} className="text-slate-400 hover:text-white text-xl font-bold leading-none">&times;</button>
            </div>

            {activeMatchModal.winnerId && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center font-bold text-emerald-300 text-xs">
                🏆 Match Decided: {bladers.find(b => b.id === activeMatchModal.winnerId)?.name} Wins!
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Player 1 */}
              {(() => {
                const p1 = bladers.find(b => b.id === activeMatchModal.p1Id);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <div className="text-sm font-black text-white truncate">{p1?.name}</div>
                    <div className="text-[11px] text-cyan-400 truncate mb-2">{p1?.deck[0].blade}</div>
                    <div className="text-5xl font-black font-mono text-white mb-2">{activeMatchModal.p1Score}</div>
                    <div className="text-[11px] text-slate-400 mb-3">Launch Fouls: {activeMatchModal.p1Fouls}/2</div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                      <button onClick={() => handleApplyFinish(1, 'Spin', 1)} className="bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-slate-200">+1 Spin</button>
                      <button onClick={() => handleApplyFinish(1, 'Over', 2)} className="bg-cyan-950 text-cyan-300 py-2 rounded-lg border border-cyan-700">+2 Over</button>
                      <button onClick={() => handleApplyFinish(1, 'Burst', 2)} className="bg-blue-950 text-blue-300 py-2 rounded-lg border border-blue-700">+2 Burst</button>
                      <button onClick={() => handleApplyFinish(1, 'Xtreme', 3)} className="bg-amber-950 text-amber-300 py-2 rounded-lg border border-amber-600">+3 Xtreme</button>
                    </div>
                    <button onClick={() => handleFoul(1)} className="w-full mt-2 py-1 text-[10px] text-rose-400 border border-rose-500/20 rounded hover:bg-rose-950/20 font-semibold">
                      +1 Foul (False Launch)
                    </button>
                  </div>
                );
              })()}

              {/* Player 2 */}
              {(() => {
                const p2 = bladers.find(b => b.id === activeMatchModal.p2Id);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <div className="text-sm font-black text-white truncate">{p2?.name}</div>
                    <div className="text-[11px] text-cyan-400 truncate mb-2">{p2?.deck[0].blade}</div>
                    <div className="text-5xl font-black font-mono text-white mb-2">{activeMatchModal.p2Score}</div>
                    <div className="text-[11px] text-slate-400 mb-3">Launch Fouls: {activeMatchModal.p2Fouls}/2</div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                      <button onClick={() => handleApplyFinish(2, 'Spin', 1)} className="bg-slate-800 hover:bg-slate-700 py-2 rounded-lg text-slate-200">+1 Spin</button>
                      <button onClick={() => handleApplyFinish(2, 'Over', 2)} className="bg-cyan-950 text-cyan-300 py-2 rounded-lg border border-cyan-700">+2 Over</button>
                      <button onClick={() => handleApplyFinish(2, 'Burst', 2)} className="bg-blue-950 text-blue-300 py-2 rounded-lg border border-blue-700">+2 Burst</button>
                      <button onClick={() => handleApplyFinish(2, 'Xtreme', 3)} className="bg-amber-950 text-amber-300 py-2 rounded-lg border border-amber-600">+3 Xtreme</button>
                    </div>
                    <button onClick={() => handleFoul(2)} className="w-full mt-2 py-1 text-[10px] text-rose-400 border border-rose-500/20 rounded hover:bg-rose-950/20 font-semibold">
                      +1 Foul (False Launch)
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* UNDO BUTTON ROW */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-400 truncate max-w-[260px]">
                <strong className="text-slate-300 mr-1">Last Action:</strong>
                {activeMatchModal.history && activeMatchModal.history.length > 0
                  ? <span className="text-amber-400 font-mono">{activeMatchModal.history[activeMatchModal.history.length - 1].type}</span>
                  : <span className="italic text-slate-600">No score recorded</span>}
              </div>

              <button
                type="button"
                disabled={!activeMatchModal.history || activeMatchModal.history.length === 0}
                onClick={handleUndoStepInModal}
                className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <span>↺ Undo Last Point</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button onClick={() => setActiveMatchModal(null)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
              <button
                onClick={handleSaveMatchScore}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 uppercase"
              >
                Confirm Match Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EXISTING BLADER MODAL */}
      {editingBlader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black italic text-cyan-400 uppercase">
                Edit 3v3 Deck &bull; {editingBlader.name}
              </h3>
              <button onClick={() => setEditingBlader(null)} className="text-slate-400 hover:text-white font-bold text-xl leading-none">&times;</button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">Blader Tag / Handle</label>
              <input
                type="text"
                value={editingBlader.name}
                onChange={e => setEditingBlader({ ...editingBlader, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
              />
            </div>

            {[0, 1, 2].map((slotIdx) => (
              <div key={slotIdx} className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  Slot #{slotIdx + 1} Beyblade
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Blade</span>
                    <select
                      value={editingBlader.deck[slotIdx].blade}
                      onChange={e => {
                        const newDeck = [...editingBlader.deck] as [BeySlot, BeySlot, BeySlot];
                        newDeck[slotIdx].blade = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: newDeck });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {BLADES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Ratchet</span>
                    <select
                      value={editingBlader.deck[slotIdx].ratchet}
                      onChange={e => {
                        const newDeck = [...editingBlader.deck] as [BeySlot, BeySlot, BeySlot];
                        newDeck[slotIdx].ratchet = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: newDeck });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {RATCHETS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Bit</span>
                    <select
                      value={editingBlader.deck[slotIdx].bit}
                      onChange={e => {
                        const newDeck = [...editingBlader.deck] as [BeySlot, BeySlot, BeySlot];
                        newDeck[slotIdx].bit = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: newDeck });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {BITS.map(bit => <option key={bit} value={bit}>{bit}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setEditingBlader(null)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  setBladers(prev => prev.map(p => p.id === editingBlader.id ? editingBlader : p));
                  setEditingBlader(null);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 uppercase"
              >
                Save Deck
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POST MARKETPLACE LISTING MODAL */}
      {showMarketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-white">Post Item to BD Community Bazar</h3>
              <button onClick={() => setShowMarketModal(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-bold">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g., Wizard Rod 9-60 Ball"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Price (BDT ৳)</label>
                  <input
                    type="number"
                    placeholder="1500"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Blade">Blade</option>
                    <option value="Ratchet">Ratchet</option>
                    <option value="Bit">Bit</option>
                    <option value="Starter Set">Starter Set</option>
                    <option value="Stadium">Stadium</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Seller Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newItemSeller}
                    onChange={e => setNewItemSeller(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-bold">Phone Number</label>
                  <input
                    type="text"
                    placeholder="017xxxxxxxx"
                    value={newItemPhone}
                    onChange={e => setNewItemPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button onClick={() => setShowMarketModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-400">Cancel</button>
              <button
                onClick={() => {
                  if (!newItemTitle.trim() || !newItemPrice) return;
                  const item: MarketItem = {
                    id: `m-${Date.now()}`,
                    title: newItemTitle.trim(),
                    price: Number(newItemPrice),
                    seller: newItemSeller.trim() || 'Anonymous',
                    phone: newItemPhone.trim() || 'N/A',
                    condition: 'Authentic TT / Verified',
                    category: newItemCategory
                  };
                  setMarketItems(prev => [item, ...prev]);
                  setShowMarketModal(false);
                  setNewItemTitle("");
                  setNewItemPrice("");
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 uppercase"
              >
                Post Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}