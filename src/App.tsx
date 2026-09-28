import React, { useState, useEffect, useMemo } from 'react';

export interface BeySlot {
  blade: string;
  ratchet: string;
  bit: string;
}

export interface Blader {
  id: string;
  name: string;
  rank: number;
  location: string;
  deck: [BeySlot, BeySlot, BeySlot];
  checkedIn: boolean;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  pastOpponents: string[];
  hadBye: boolean;
}

export interface MatchAction {
  type: string;
  pts: number;
  player: 1 | 2;
  isFoul?: boolean;
}

export interface Match {
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

export interface MarketplaceItem {
  id: string;
  title: string;
  priceBDT: number;
  type: 'Starter' | 'Booster' | 'Stadium' | 'Part / Bit';
  condition: 'Brand New (Sealed)' | 'Like New (Opened)' | 'Used';
  seller: string;
  location: string;
  phoneOrFb: string;
  verifiedTT: boolean;
}

export interface PartInfo {
  name: string;
  type: 'Blade' | 'Ratchet' | 'Bit';
  category: 'Attack' | 'Stamina' | 'Defense' | 'Balance';
  tier: 'S' | 'A' | 'B';
  weight: string;
  description: string;
}

const CODEX_PARTS: PartInfo[] = [
  {
    name: 'Phoenix Wing',
    type: 'Blade',
    category: 'Attack',
    tier: 'S',
    weight: '38.2g',
    description: 'Heaviest attack metal wheel with massive recoil impact.',
  },
  {
    name: 'Wizard Rod',
    type: 'Blade',
    category: 'Stamina',
    tier: 'S',
    weight: '35.5g',
    description: 'Peak stamina circular outward weight distribution.',
  },
  {
    name: 'Dran Buster',
    type: 'Blade',
    category: 'Attack',
    tier: 'S',
    weight: '36.8g',
    description: 'Extreme 1-point concentrated smash burst attack blade.',
  },
  {
    name: 'Cobalt Dragoon',
    type: 'Blade',
    category: 'Attack',
    tier: 'A',
    weight: '37.9g',
    description: 'Left-spin high smash blade designed for reverse rush.',
  },
  {
    name: 'Shark Edge',
    type: 'Blade',
    category: 'Attack',
    tier: 'S',
    weight: '34.8g',
    description:
      'Deadly upward uppercut hooks that easily eject opponents into Over Finish.',
  },
  {
    name: 'Hells Chain',
    type: 'Blade',
    category: 'Balance',
    tier: 'A',
    weight: '34.2g',
    description: 'Versatile defensive ridges with moderate stamina retention.',
  },
  {
    name: 'Unicorn Sting',
    type: 'Blade',
    category: 'Balance',
    tier: 'A',
    weight: '33.9g',
    description: 'Dual offense/defense asymmetrical blade structure.',
  },
  {
    name: 'Tyranno Beat',
    type: 'Blade',
    category: 'Attack',
    tier: 'A',
    weight: '37.1g',
    description:
      'Upper-slanted thick blades providing heavy downforce punches.',
  },
  {
    name: 'Silver Wolf',
    type: 'Blade',
    category: 'Stamina',
    tier: 'A',
    weight: '36.2g',
    description: 'Free-spinning ring mechanism diffusing rotational friction.',
  },
  {
    name: 'Aero Pegasus',
    type: 'Blade',
    category: 'Attack',
    tier: 'S',
    weight: '37.4g',
    description: 'Rare high-tier metal smash blade with aerodynamic cuts.',
  },
  {
    name: 'Knight Shield',
    type: 'Blade',
    category: 'Defense',
    tier: 'B',
    weight: '32.8g',
    description: 'Multi-deflection ribbed perimeter for counter defense.',
  },
  {
    name: 'Ghost Circle',
    type: 'Blade',
    category: 'Defense',
    tier: 'A',
    weight: '35.0g',
    description: 'Smooth rounded profile resisting burst pinches.',
  },
  {
    name: '9-60',
    type: 'Ratchet',
    category: 'Stamina',
    tier: 'S',
    weight: '6.5g',
    description:
      '9 low-profile teeth resisting burst unlocks under heavy impacts.',
  },
  {
    name: '5-60',
    type: 'Ratchet',
    category: 'Balance',
    tier: 'S',
    weight: '6.4g',
    description:
      'Balanced 5-point weight distribution with low center of gravity.',
  },
  {
    name: '3-60',
    type: 'Ratchet',
    category: 'Attack',
    tier: 'S',
    weight: '6.3g',
    description:
      'Tri-wing low ratchet pairing with Dran Buster and Shark Edge.',
  },
  {
    name: '1-60',
    type: 'Ratchet',
    category: 'Attack',
    tier: 'A',
    weight: '6.2g',
    description: 'Eccentric single heavy point to align with one-hit smashes.',
  },
  {
    name: '7-60',
    type: 'Ratchet',
    category: 'Defense',
    tier: 'A',
    weight: '6.6g',
    description: 'Dense multi-sided design to minimize outward gaps.',
  },
  {
    name: 'Ball (B)',
    type: 'Bit',
    category: 'Stamina',
    tier: 'S',
    weight: '2.4g',
    description:
      'Spherical tip offering unparalleled center stamina stability.',
  },
  {
    name: 'Orb (O)',
    type: 'Bit',
    category: 'Defense',
    tier: 'A',
    weight: '2.3g',
    description:
      'Smaller contact ball surface maintaining central tilt defense.',
  },
  {
    name: 'Point (P)',
    type: 'Bit',
    category: 'Balance',
    tier: 'S',
    weight: '2.5g',
    description:
      'Flat base with central pin for hybrid outer rush and inner spin.',
  },
  {
    name: 'Gear Flat (GF)',
    type: 'Bit',
    category: 'Attack',
    tier: 'S',
    weight: '2.6g',
    description: 'Extended gear perimeter creating hyperspeed Xtreme Dashes.',
  },
  {
    name: 'Low Flat (LF)',
    type: 'Bit',
    category: 'Attack',
    tier: 'A',
    weight: '2.4g',
    description: 'Low ground clearance for uppercut strikes into pockets.',
  },
  {
    name: 'Hexa (H)',
    type: 'Bit',
    category: 'Defense',
    tier: 'A',
    weight: '2.5g',
    description:
      'Hexagonal tip maintaining high tilt resistance and burst friction.',
  },
];

const INITIAL_BLADERS_ROSTER: Blader[] = [
  {
    id: 'p1',
    name: 'Khaled',
    rank: 1,
    location: 'Dhanmondi, Dhaka',
    deck: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Gear Flat (GF)' },
      { blade: 'Wizard Rod', ratchet: '5-60', bit: 'Ball (B)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 8,
    losses: 0,
    pointsFor: 16,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p2',
    name: 'Rusab',
    rank: 2,
    location: 'Banani, Dhaka',
    deck: [
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Phoenix Wing', ratchet: '5-60', bit: 'Point (P)' },
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 0,
    pointsFor: 4,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p3',
    name: 'Samsul',
    rank: 3,
    location: 'Uttara, Dhaka',
    deck: [
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Gear Flat (GF)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Point (P)' },
      { blade: 'Silver Wolf', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 0,
    pointsFor: 4,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p4',
    name: 'Azraf',
    rank: 4,
    location: 'Mirpur 10, Dhaka',
    deck: [
      { blade: 'Cobalt Dragoon', ratchet: '2-60', bit: 'Point (P)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 3,
    losses: 1,
    pointsFor: 6,
    pointsAgainst: 2,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p5',
    name: 'Didar',
    rank: 5,
    location: 'Mohammadpur, Dhaka',
    deck: [
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point (P)' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Hexa (H)' },
    ],
    checkedIn: true,
    wins: 5,
    losses: 2,
    pointsFor: 10,
    pointsAgainst: 4,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p6',
    name: 'Shakib',
    rank: 6,
    location: 'Bashundhara, Dhaka',
    deck: [
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Hexa (H)' },
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Gear Flat (GF)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 12,
    losses: 6,
    pointsFor: 24,
    pointsAgainst: 12,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p7',
    name: 'Mymuna',
    rank: 7,
    location: 'Dhanmondi, Dhaka',
    deck: [
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Point (P)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 4,
    losses: 2,
    pointsFor: 8,
    pointsAgainst: 4,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p8',
    name: 'Ahnaf',
    rank: 8,
    location: 'Khilgaon, Dhaka',
    deck: [
      { blade: 'Tyranno Beat', ratchet: '4-70', bit: 'Gear Flat (GF)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Point (P)' },
    ],
    checkedIn: true,
    wins: 4,
    losses: 4,
    pointsFor: 8,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p9',
    name: 'Joy',
    rank: 9,
    location: 'Chittagong GEC',
    deck: [
      { blade: 'Tyranno Beat', ratchet: '4-70', bit: 'Point (P)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Gear Flat (GF)' },
      { blade: 'Silver Wolf', ratchet: '5-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 3,
    losses: 3,
    pointsFor: 6,
    pointsAgainst: 6,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p10',
    name: 'Hrid',
    rank: 10,
    location: 'Badda, Dhaka',
    deck: [
      { blade: 'Silver Wolf', ratchet: '3-80', bit: 'Ball (B)' },
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Low Flat (LF)' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Point (P)' },
    ],
    checkedIn: true,
    wins: 3,
    losses: 3,
    pointsFor: 6,
    pointsAgainst: 6,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p11',
    name: 'Ayon',
    rank: 11,
    location: 'Old Dhaka',
    deck: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point (P)' },
      { blade: 'Wizard Rod', ratchet: '5-60', bit: 'Ball (B)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 3,
    losses: 4,
    pointsFor: 6,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p12',
    name: 'Anadi',
    rank: 12,
    location: 'Gulshan 1, Dhaka',
    deck: [
      { blade: 'Phoenix Wing', ratchet: '9-70', bit: 'Gear Flat (GF)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Hexa (H)' },
      { blade: 'Wizard Rod', ratchet: '3-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 8,
    losses: 11,
    pointsFor: 16,
    pointsAgainst: 22,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p13',
    name: 'Adib',
    rank: 13,
    location: 'Mirpur 2, Dhaka',
    deck: [
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Low Flat (LF)' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Point (P)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 3,
    pointsFor: 4,
    pointsAgainst: 6,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p14',
    name: 'Tamim',
    rank: 14,
    location: 'Shyamoli, Dhaka',
    deck: [
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point (P)' },
      { blade: 'Ghost Circle', ratchet: '5-60', bit: 'Orb (O)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 4,
    pointsFor: 4,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p15',
    name: 'Mir Sakib',
    rank: 15,
    location: 'Dhanmondi 27, Dhaka',
    deck: [
      { blade: 'Aero Pegasus', ratchet: '3-70', bit: 'Gear Flat (GF)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Point (P)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 4,
    pointsFor: 4,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p16',
    name: 'Sayham',
    rank: 16,
    location: 'Uttara Sector 11',
    deck: [
      { blade: 'Knight Shield', ratchet: '3-80', bit: 'Hexa (H)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point (P)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
    ],
    checkedIn: true,
    wins: 2,
    losses: 4,
    pointsFor: 4,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p17',
    name: 'Shohana',
    rank: 17,
    location: 'Wari, Dhaka',
    deck: [
      { blade: 'Ghost Circle', ratchet: '0-80', bit: 'Orb (O)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Phoenix Wing', ratchet: '5-60', bit: 'Point (P)' },
    ],
    checkedIn: true,
    wins: 3,
    losses: 8,
    pointsFor: 6,
    pointsAgainst: 16,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p18',
    name: 'Ayan Arabi',
    rank: 18,
    location: 'Lalmatia, Dhaka',
    deck: [
      { blade: 'Tyranno Beat', ratchet: '4-70', bit: 'Gear Flat (GF)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Hexa (H)' },
      { blade: 'Silver Wolf', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 1,
    losses: 4,
    pointsFor: 2,
    pointsAgainst: 8,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p19',
    name: 'Ehsan',
    rank: 19,
    location: 'Banani DOHS',
    deck: [
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Gear Flat (GF)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Point (P)' },
      { blade: 'Wizard Rod', ratchet: '5-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 3,
    pointsFor: 0,
    pointsAgainst: 6,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p20',
    name: 'Rafin',
    rank: 20,
    location: 'Nikunja 2, Dhaka',
    deck: [
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Point (P)' },
      { blade: 'Ghost Circle', ratchet: '9-60', bit: 'Orb (O)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 3,
    pointsFor: 0,
    pointsAgainst: 6,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p21',
    name: 'Zidan',
    rank: 21,
    location: 'Mirpur DOHS',
    deck: [
      { blade: 'Cobalt Dragoon', ratchet: '2-60', bit: 'Point (P)' },
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Hexa (H)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p22',
    name: 'Salman',
    rank: 22,
    location: 'Dhanmondi, Dhaka',
    deck: [
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Gear Flat (GF)' },
      { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
      { blade: 'Silver Wolf', ratchet: '5-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p23',
    name: 'Kento',
    rank: 23,
    location: 'Gulshan 2, Dhaka',
    deck: [
      { blade: 'Dran Buster', ratchet: '1-60', bit: 'Low Flat (LF)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
      { blade: 'Unicorn Sting', ratchet: '5-60', bit: 'Point (P)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p24',
    name: 'Rocche',
    rank: 24,
    location: 'Uttara Sector 4',
    deck: [
      { blade: 'Hells Chain', ratchet: '5-60', bit: 'Hexa (H)' },
      { blade: 'Tyranno Beat', ratchet: '4-70', bit: 'Gear Flat (GF)' },
      { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
  {
    id: 'p25',
    name: 'Challenger 25',
    rank: 25,
    location: 'Dhaka Central',
    deck: [
      { blade: 'Aero Pegasus', ratchet: '3-70', bit: 'Point (P)' },
      { blade: 'Phoenix Wing', ratchet: '9-60', bit: 'Gear Flat (GF)' },
      { blade: 'Ghost Circle', ratchet: '5-60', bit: 'Ball (B)' },
    ],
    checkedIn: true,
    wins: 0,
    losses: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pastOpponents: [],
    hadBye: false,
  },
];

const DHAKA_VENUES = [
  {
    name: 'Dhanmondi Arena Hub (Cafe Rio Rooftop)',
    address: 'Road 27 (Old), Dhanmondi, Dhaka',
    meetDay: 'Every Friday & Saturday (3:30 PM - 8:00 PM)',
    tables: 6,
    coordinator: 'Khaled & Didar',
    contact: '+880 1712-345678',
    mapArea: 'Central Dhaka',
  },
  {
    name: 'Banani Bey-Lounge (Club Matrix)',
    address: 'Road 11, Block D, Banani, Dhaka',
    meetDay: 'Alternate Fridays (4:00 PM - 9:00 PM)',
    tables: 4,
    coordinator: 'Rusab & Shakib',
    contact: '+880 1819-987654',
    mapArea: 'North Dhaka',
  },
  {
    name: 'Uttara Sector 11 Community Arena',
    address: 'Park Sector 11, Uttara, Dhaka',
    meetDay: 'Saturdays (4:30 PM - 7:30 PM)',
    tables: 5,
    coordinator: 'Samsul & Sayham',
    contact: '+880 1670-112233',
    mapArea: 'North Dhaka',
  },
  {
    name: 'Mirpur Stadium Collective',
    address: 'Sony Cinema Hall Circle, Mirpur 2, Dhaka',
    meetDay: 'Sundays & Holidays (4:00 PM)',
    tables: 4,
    coordinator: 'Azraf & Adib',
    contact: '+880 1911-445566',
    mapArea: 'West Dhaka',
  },
];

const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'm1',
    title: 'Takara Tomy BX-00 Aero Pegasus 3-70A (Rare Booster)',
    priceBDT: 5800,
    type: 'Booster',
    condition: 'Brand New (Sealed)',
    seller: 'Khaled (Dhanmondi)',
    location: 'Dhanmondi / Courier',
    phoneOrFb: 'fb.com/khaled.blade',
    verifiedTT: true,
  },
  {
    id: 'm2',
    title: 'BX-23 Phoenix Wing 9-60GF Starter + String Launcher',
    priceBDT: 3400,
    type: 'Starter',
    condition: 'Brand New (Sealed)',
    seller: 'Rusab (Banani)',
    location: 'Banani / Delivery',
    phoneOrFb: '+880 1819-987654',
    verifiedTT: true,
  },
  {
    id: 'm3',
    title: 'Official BX-07 Xtreme Stadium (Black Rail, Takara Tomy)',
    priceBDT: 4800,
    type: 'Stadium',
    condition: 'Like New (Opened)',
    seller: 'Didar (Mohammadpur)',
    location: 'Mohammadpur Pickup',
    phoneOrFb: '+880 1711-223344',
    verifiedTT: true,
  },
  {
    id: 'm4',
    title: 'Loose Bit: Ball (B) & 9-60 Ratchet Mint Condition',
    priceBDT: 1400,
    type: 'Part / Bit',
    condition: 'Like New (Opened)',
    seller: 'Shakib (Bashundhara)',
    location: 'Bashundhara R/A',
    phoneOrFb: 'WhatsApp +8801700-112233',
    verifiedTT: true,
  },
  {
    id: 'm5',
    title: 'BX-35 Random Booster Vol 4 - Black Shell 4-60D',
    priceBDT: 2100,
    type: 'Booster',
    condition: 'Brand New (Sealed)',
    seller: 'Samsul (Uttara)',
    location: 'Uttara Sector 11',
    phoneOrFb: '+880 1670-112233',
    verifiedTT: true,
  },
];

export default function App() {
  const [mainNav, setMainNav] = useState<
    'hub' | 'codex' | 'tournament' | 'market'
  >('hub');
  const [bladers, setBladers] = useState<Blader[]>(INITIAL_BLADERS_ROSTER);
  const [marketItems, setMarketItems] =
    useState<MarketplaceItem[]>(INITIAL_MARKETPLACE);

  // Tournament Engine States
  const [tourneyTab, setTourneyTab] = useState<
    'matches' | 'standings' | 'roster' | 'topcut'
  >('matches');
  const [currentRound, setCurrentRound] = useState(1);
  const [rounds, setRounds] = useState<{ [key: number]: Match[] }>({});
  const [activeMatchModal, setActiveMatchModal] = useState<Match | null>(null);
  const [editingBlader, setEditingBlader] = useState<Blader | null>(null);
  const [topCutMatches, setTopCutMatches] = useState<any>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Codex / Deck Builder States
  const [codexFilter, setCodexFilter] = useState<
    'All' | 'Attack' | 'Stamina' | 'Defense' | 'Balance'
  >('All');
  const [codexSearch, setCodexSearch] = useState('');
  const [deckBuilder, setDeckBuilder] = useState<[BeySlot, BeySlot, BeySlot]>([
    { blade: 'Wizard Rod', ratchet: '9-60', bit: 'Ball (B)' },
    { blade: 'Phoenix Wing', ratchet: '5-60', bit: 'Point (P)' },
    { blade: 'Shark Edge', ratchet: '3-60', bit: 'Low Flat (LF)' },
  ]);

  // Market Modal State
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    priceBDT: '',
    type: 'Starter',
    condition: 'Brand New (Sealed)',
    seller: '',
    location: 'Dhaka',
    phoneOrFb: '',
  });

  // Swiss Pairings Generation with rematch prevention and BYE calculation
  const generateSwissPairings = (pool: Blader[], roundNumber: number) => {
    const active = pool.filter((b) => b.checkedIn);
    if (active.length < 2) return [];

    const sorted = [...active].sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.pointsFor - b.pointsAgainst - (a.pointsFor - a.pointsAgainst);
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
      const p1 = pool.find((b) => b.id === id1);
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
          history: [],
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
        history: [{ type: 'Automatic Bye (+4 PTS)', pts: 4, player: 1 }],
      });
    }

    return pairings;
  };

  useEffect(() => {
    if (!rounds[1]) {
      const r1 = generateSwissPairings(bladers, 1);
      setRounds({ 1: r1 });
    }
  }, []);

  const checkDeckLegality = (deck: [BeySlot, BeySlot, BeySlot]) => {
    const errors: string[] = [];
    const blades = [deck[0].blade, deck[1].blade, deck[2].blade].filter(
      Boolean
    );
    const ratchets = [deck[0].ratchet, deck[1].ratchet, deck[2].ratchet].filter(
      Boolean
    );
    const bits = [deck[0].bit, deck[1].bit, deck[2].bit].filter(Boolean);

    if (new Set(blades).size !== blades.length)
      errors.push(
        'Duplicate Blade detected! Takara Tomy regulations forbid duplicate blades across 3 slots.'
      );
    if (new Set(ratchets).size !== ratchets.length)
      errors.push(
        'Duplicate Ratchet detected! Two identical ratchets are prohibited.'
      );
    if (new Set(bits).size !== bits.length)
      errors.push('Duplicate Bit detected! All three bits must be different.');

    return errors;
  };

  const standings = useMemo(() => {
    return [...bladers]
      .filter((b) => b.checkedIn)
      .map((blader) => {
        const buchholz = (blader.pastOpponents || []).reduce(
          (acc: number, oppId: string) => {
            const opp = bladers.find((b) => b.id === oppId);
            return acc + (opp ? opp.wins : 0);
          },
          0
        );
        return {
          ...blader,
          pointDiff: blader.pointsFor - blader.pointsAgainst,
          buchholz,
        };
      })
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        if (b.buchholz !== a.buchholz) return b.buchholz - a.buchholz;
        return b.pointDiff - a.pointDiff;
      });
  }, [bladers]);

  const handleApplyFinish = (
    playerNum: 1 | 2,
    finishType: string,
    points: number
  ) => {
    if (!activeMatchModal || activeMatchModal.winnerId) return;
    const cur = { ...activeMatchModal };
    const newP1 = playerNum === 1 ? cur.p1Score + points : cur.p1Score;
    const newP2 = playerNum === 2 ? cur.p2Score + points : cur.p2Score;

    cur.history = [
      ...(cur.history || []),
      {
        type: `${playerNum === 1 ? 'P1' : 'P2'} ${finishType} (+${points})`,
        pts: points,
        player: playerNum,
        isFoul: false,
      },
    ];

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
        if (cur.p2Score >= 4) {
          cur.winnerId = cur.p2Id;
          cur.status = 'finished';
        }
      }
      cur.history = [
        ...(cur.history || []),
        {
          type: `P1 Foul (${cur.p1Fouls}/2)${
            penaltyAwarded ? ' -> Penalty +1 to P2' : ''
          }`,
          pts: penaltyAwarded ? 1 : 0,
          player: 1,
          isFoul: true,
        },
      ];
    } else {
      cur.p2Fouls += 1;
      const penaltyAwarded = cur.p2Fouls % 2 === 0;
      if (penaltyAwarded) {
        cur.p1Score += 1;
        if (cur.p1Score >= 4) {
          cur.winnerId = cur.p1Id;
          cur.status = 'finished';
        }
      }
      cur.history = [
        ...(cur.history || []),
        {
          type: `P2 Foul (${cur.p2Fouls}/2)${
            penaltyAwarded ? ' -> Penalty +1 to P1' : ''
          }`,
          pts: penaltyAwarded ? 1 : 0,
          player: 2,
          isFoul: true,
        },
      ];
    }
    setActiveMatchModal(cur);
  };

  const handleUndoInModal = () => {
    if (
      !activeMatchModal ||
      !activeMatchModal.history ||
      activeMatchModal.history.length === 0
    )
      return;
    const cur = { ...activeMatchModal };
    const history = [...cur.history];
    const lastAction = history.pop()!;

    if (lastAction.isFoul) {
      if (lastAction.player === 1) {
        if (lastAction.pts > 0)
          cur.p2Score = Math.max(0, cur.p2Score - lastAction.pts);
        cur.p1Fouls = Math.max(0, cur.p1Fouls - 1);
      } else {
        if (lastAction.pts > 0)
          cur.p1Score = Math.max(0, cur.p1Score - lastAction.pts);
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

  const handleUndoFinishedCard = (matchId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const roundMatches = rounds[currentRound] || [];
    const target = roundMatches.find((m) => m.id === matchId);
    if (!target || target.status !== 'finished') return;

    if (
      !window.confirm(
        'Undo this match result and return both bladers to unplayed status for this round?'
      )
    )
      return;

    const { p1Id, p2Id, p1Score, p2Score, winnerId } = target;

    // Roll back blader records
    setBladers((prev) =>
      prev.map((b) => {
        if (b.id === p1Id) {
          const wasWin = winnerId === p1Id;
          const opps = [...b.pastOpponents];
          if (p2Id) {
            const idx = opps.lastIndexOf(p2Id);
            if (idx !== -1) opps.splice(idx, 1);
          }
          return {
            ...b,
            wins: Math.max(0, b.wins - (wasWin ? 1 : 0)),
            losses: Math.max(0, b.losses - (!wasWin ? 1 : 0)),
            pointsFor: Math.max(0, b.pointsFor - p1Score),
            pointsAgainst: Math.max(0, b.pointsAgainst - p2Score),
            pastOpponents: opps,
            hadBye: p2Id === null ? false : b.hadBye,
          };
        }
        if (b.id === p2Id) {
          const wasWin = winnerId === p2Id;
          const opps = [...b.pastOpponents];
          const idx = opps.lastIndexOf(p1Id);
          if (idx !== -1) opps.splice(idx, 1);
          return {
            ...b,
            wins: Math.max(0, b.wins - (wasWin ? 1 : 0)),
            losses: Math.max(0, b.losses - (!wasWin ? 1 : 0)),
            pointsFor: Math.max(0, b.pointsFor - p2Score),
            pointsAgainst: Math.max(0, b.pointsAgainst - p1Score),
            pastOpponents: opps,
          };
        }
        return b;
      })
    );

    // Reset match slot to pending
    const reopened: Match = {
      ...target,
      status: 'pending',
      winnerId: null,
      p1Score: 0,
      p2Score: 0,
      p1Fouls: 0,
      p2Fouls: 0,
      history: [],
    };

    setRounds((prev) => ({
      ...prev,
      [currentRound]: prev[currentRound].map((m) =>
        m.id === matchId ? reopened : m
      ),
    }));
  };

  const handleSaveMatchScore = () => {
    if (!activeMatchModal) return;
    setRounds((prev) => {
      const arr = [...(prev[currentRound] || [])];
      const idx = arr.findIndex((m) => m.id === activeMatchModal.id);
      if (idx !== -1) arr[idx] = activeMatchModal;
      return { ...prev, [currentRound]: arr };
    });

    if (activeMatchModal.status === 'finished') {
      const { p1Id, p2Id, p1Score, p2Score, winnerId } = activeMatchModal;
      setBladers((prev) =>
        prev.map((b) => {
          if (b.id === p1Id) {
            const isWin = winnerId === p1Id;
            return {
              ...b,
              wins: b.wins + (isWin ? 1 : 0),
              losses: b.losses + (isWin ? 0 : 1),
              pointsFor: b.pointsFor + p1Score,
              pointsAgainst: b.pointsAgainst + p2Score,
              pastOpponents: p2Id
                ? [...b.pastOpponents, p2Id]
                : b.pastOpponents,
              hadBye: p2Id === null ? true : b.hadBye,
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
              pastOpponents: [...b.pastOpponents, p1Id],
            };
          }
          return b;
        })
      );
    }
    setActiveMatchModal(null);
  };

  const handleNextRound = () => {
    const curMatches = rounds[currentRound] || [];
    const allDone = curMatches.every((m) => m.status === 'finished');
    if (!allDone) {
      alert(
        'Please finish and confirm all active stadium tables before creating Round ' +
          (currentRound + 1)
      );
      return;
    }

    const nextR = currentRound + 1;
    if (nextR > 5) {
      generateTopCut();
      setTourneyTab('topcut');
      return;
    }
    const nextPairings = generateSwissPairings(bladers, nextR);
    setRounds((prev) => ({ ...prev, [nextR]: nextPairings }));
    setCurrentRound(nextR);
  };

  const generateTopCut = () => {
    const qualified = standings.slice(0, 4);
    if (qualified.length < 4) return;
    setTopCutMatches({
      semi1: {
        title: 'Semi-Final 1 (Seed 1 vs 4)',
        p1: qualified[0],
        p2: qualified[3],
        p1Score: 0,
        p2Score: 0,
        winner: null,
        status: 'pending',
      },
      semi2: {
        title: 'Semi-Final 2 (Seed 2 vs 3)',
        p1: qualified[1],
        p2: qualified[2],
        p1Score: 0,
        p2Score: 0,
        winner: null,
        status: 'pending',
      },
      final: {
        title: 'Grand Championship Title Battle',
        p1: null,
        p2: null,
        p1Score: 0,
        p2Score: 0,
        winner: null,
        status: 'waiting',
      },
    });
  };

  const handleScoreTopCutMatch = (matchKey: string, p1Win: boolean) => {
    setTopCutMatches((prev: any) => {
      const match = prev[matchKey];
      const winner = p1Win ? match.p1 : match.p2;
      const updated = {
        ...prev,
        [matchKey]: {
          ...match,
          winner,
          p1Score: p1Win ? 4 : 2,
          p2Score: p1Win ? 2 : 4,
          status: 'finished',
        },
      };

      if (matchKey === 'semi1' || matchKey === 'semi2') {
        const finalP1 = matchKey === 'semi1' ? winner : prev.final.p1;
        const finalP2 = matchKey === 'semi2' ? winner : prev.final.p2;
        updated.final = {
          ...prev.final,
          p1: finalP1,
          p2: finalP2,
          status: finalP1 && finalP2 ? 'ready' : 'waiting',
        };
      }
      return updated;
    });
  };

  const handleCopySchedule = () => {
    const list = rounds[currentRound] || [];
    let text = `⚡ BEYBLADE X BANGLADESH - ROUND ${currentRound} PAIRINGS ⚡\n`;
    text += `Takara Tomy Official Format (First to 4 Points)\n`;
    text += `========================================\n`;
    list.forEach((m) => {
      const p1 = bladers.find((b) => b.id === m.p1Id);
      if (m.stadium === 'BYE') {
        text += `🎁 BYE SLOT: ${p1?.name} [Auto 4-0 Win]\n`;
      } else {
        const p2 = bladers.find((b) => b.id === m.p2Id);
        text += `🏟️ Table ${m.stadium}: ${p1?.name} vs ${p2?.name} (Score: ${m.p1Score}-${m.p2Score})\n`;
      }
    });
    text += `========================================\n`;
    text += `Call: 3, 2, 1, GO SHOOT!`;
    navigator.clipboard.writeText(text);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const activeMatches = rounds[currentRound] || [];
  const currentRoundFinished =
    activeMatches.length > 0 &&
    activeMatches.every((m) => m.status === 'finished');

  const filteredParts = useMemo(() => {
    return CODEX_PARTS.filter((p) => {
      const matchCat = codexFilter === 'All' || p.category === codexFilter;
      const matchSearch =
        p.name.toLowerCase().includes(codexSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(codexSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [codexFilter, codexSearch]);

  const deckErrors = checkDeckLegality(deckBuilder);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-[#00f0ff] selection:text-black">
      {/* GLOBAL NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setMainNav('hub')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff4500] via-cyan-400 to-[#00f0ff] p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070b14] rounded-[10px] flex items-center justify-center font-black text-cyan-400 text-lg">
                X
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-wider uppercase text-white">
                  BEYBLADE X
                </span>
                <span className="text-[10px] font-black tracking-widest uppercase bg-[#ff4500]/20 text-[#ff7744] border border-[#ff4500]/40 px-1.5 py-0.5 rounded">
                  BANGLADESH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Beyblade Universe BD Community Platform
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'hub', label: 'Dhaka Hub', icon: '🏛️' },
              { id: 'codex', label: 'Meta Codex & 3v3', icon: '⚡' },
              {
                id: 'tournament',
                label: 'Pro Tournament',
                icon: '🏆',
                highlight: true,
              },
              { id: 'market', label: 'BDT Bazar', icon: '৳' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainNav(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  mainNav === tab.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:bg-slate-800/70 border border-transparent hover:border-slate-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* VIEW 1: DHAKA COMMUNITY HUB */}
      {mainNav === 'hub' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1427] via-[#090d1a] to-[#140b17] border border-cyan-500/30 p-6 sm:p-10 shadow-2xl">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-[#ff4500]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#ff7744] bg-[#ff4500]/10 border border-[#ff4500]/30 px-3 py-1 rounded-full">
                <span>🔥</span> Official Dhaka Circuit Stage
              </span>
              <h1 className="text-3xl sm:text-5xl font-black italic tracking-wide text-white uppercase leading-none">
                GEAR UP FOR THE{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-300 to-[#ff4500]">
                  XTREME ERA
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Welcome to the unified digital headquarters of Bangladesh&apos;s
                competitive Beyblade X circuit. Powered by the Beyblade Universe
                BD community, track official Dhaka meetups, check 3v3 deck
                legality, and follow live Takara Tomy tournament brackets.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={() => setMainNav('tournament')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:brightness-110 transition active:scale-95 flex items-center gap-2"
                >
                  <span>⚔️</span> Open Tournament Engine
                </button>
                <button
                  onClick={() => setMainNav('codex')}
                  className="px-5 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-xs uppercase tracking-wider transition"
                >
                  Test 3v3 Deck Combinations
                </button>
              </div>
            </div>
          </div>

          {/* Live BD Stats Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Ranked Bladers',
                val: '25 Active',
                sub: 'Seeded Circuit Roster',
                color: 'text-cyan-400',
              },
              {
                label: 'Current #1 Seed',
                val: 'Khaled',
                sub: '8W - 0L (+18 Diff)',
                color: 'text-amber-400',
              },
              {
                label: 'Top Dhaka Hubs',
                val: '4 Arenas',
                sub: 'Dhanmondi, Banani, Uttara, Mirpur',
                color: 'text-emerald-400',
              },
              {
                label: 'Meta Combo of Month',
                val: 'Wizard Rod',
                sub: '9-60 Ball (Stamina S-Tier)',
                color: 'text-[#ff7744]',
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1"
              >
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className={`text-xl font-black ${stat.color}`}>{stat.val}</p>
                <p className="text-[10px] text-slate-500 truncate">
                  {stat.sub}
                </p>
              </div>
            ))}
          </div>

          {/* Dhaka Meetup Directory */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                  <span>📍</span> Dhaka Meetup & Tournament Stadiums
                </h2>
                <p className="text-xs text-slate-400">
                  Regular training sessions and ranking cups held across the
                  capital.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DHAKA_VENUES.map((v, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-base">
                        {v.name}
                      </h3>
                      <p className="text-xs text-cyan-400/90">{v.address}</p>
                    </div>
                    <span className="text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded">
                      {v.tables} Stadiums
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <p>
                      🕒 <span className="text-slate-400">Schedule:</span>{' '}
                      {v.meetDay}
                    </p>
                    <p>
                      👤 <span className="text-slate-400">Organizers:</span>{' '}
                      {v.coordinator}
                    </p>
                    <p>
                      📞 <span className="text-slate-400">Contact:</span>{' '}
                      {v.contact}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center py-2 rounded-xl bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-600/40 text-xs font-bold transition"
                    >
                      Connect on Facebook
                    </a>
                    <button
                      onClick={() =>
                        alert(
                          `Coordinator details for ${v.name}: ${v.contact} (${v.coordinator}). Join the weekly meetup slot!`
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                    >
                      Venue Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genuine Gear & Counterfeit Lead Warning Notice */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border border-amber-500/40 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase">
              <span>⚠️</span> BD Community Safety Alert: Genuine Takara Tomy vs
              Lead Fakes
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official Beyblade X gear utilizes heavy zinc alloy die-cast metals
              manufactured to strict non-toxic safety parameters with
              specialized tri-wing security screws. Counterfeit versions sold on
              local generic retail apps frequently contain dangerous{' '}
              <strong>lead contaminants</strong> and fracture at high RPM. Only
              use authentic Takara Tomy or Hasbro gear at local tournaments!
            </p>
          </div>
        </div>
      )}

      {/* VIEW 2: CODEX & 3v3 DECK BUILDER */}
      {mainNav === 'codex' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
          {/* Deck Builder Simulator */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 shadow-2xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-black uppercase text-cyan-400 flex items-center gap-2">
                  <span>🛠️</span> Official 3-on-3 Deck Builder & Legality Check
                </h2>
                <p className="text-xs text-slate-400">
                  Configure your 3 Beys and verify compliance with the Takara
                  Tomy No-Repeat rule.
                </p>
              </div>
              {deckErrors.length === 0 ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
                  ✓ Legal Deck Composition
                </span>
              ) : (
                <span className="px-3 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
                  ⚠️ Illegal: Repeats Detected
                </span>
              )}
            </div>

            {/* 3 Slot Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((slotIdx) => (
                <div
                  key={slotIdx}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
                >
                  <div className="flex justify-between items-center text-xs font-black text-amber-400 uppercase">
                    <span>Slot #{slotIdx + 1} Beyblade</span>
                    <span className="text-[10px] text-slate-500">
                      Order Locked
                    </span>
                  </div>

                  {/* Blade */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Blade
                    </label>
                    <select
                      value={deckBuilder[slotIdx].blade}
                      onChange={(e) => {
                        const next = [...deckBuilder] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].blade = e.target.value;
                        setDeckBuilder(next);
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Blade').map(
                        (p) => (
                          <option key={p.name} value={p.name}>
                            {p.name} ({p.category})
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Ratchet */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Ratchet
                    </label>
                    <select
                      value={deckBuilder[slotIdx].ratchet}
                      onChange={(e) => {
                        const next = [...deckBuilder] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].ratchet = e.target.value;
                        setDeckBuilder(next);
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Ratchet').map(
                        (p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Bit */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Bit
                    </label>
                    <select
                      value={deckBuilder[slotIdx].bit}
                      onChange={(e) => {
                        const next = [...deckBuilder] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].bit = e.target.value;
                        setDeckBuilder(next);
                      }}
                      className="w-full p-2 bg-slate-900 border border-slate-800 rounded-lg text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Bit').map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Error alerts if rule broken */}
            {deckErrors.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                <strong>Takara Tomy Regulation Infraction:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  {deckErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Parts Codex Catalog */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black uppercase text-white">
                  Beyblade X Parts Codex
                </h2>
                <p className="text-xs text-slate-400">
                  Competitive specifications, balance classes, and tier ratings.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Search parts..."
                  value={codexSearch}
                  onChange={(e) => setCodexSearch(e.target.value)}
                  className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                />
                {(
                  ['All', 'Attack', 'Stamina', 'Defense', 'Balance'] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCodexFilter(cat)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      codexFilter === cat
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredParts.map((p) => (
                <div
                  key={p.name}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        {p.type} &bull; {p.category}
                      </span>
                      <h4 className="font-bold text-white text-base">
                        {p.name}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                          p.tier === 'S'
                            ? 'bg-amber-400 text-black font-black'
                            : p.tier === 'A'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Tier {p.tier}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {p.weight}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TOURNAMENT ENGINE */}
      {mainNav === 'tournament' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setTourneyTab('matches')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tourneyTab === 'matches'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ⚔️ Arena Matches (R{currentRound})
              </button>
              <button
                onClick={() => setTourneyTab('standings')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tourneyTab === 'standings'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🎖️ Live Standings & Buchholz
              </button>
              <button
                onClick={() => setTourneyTab('roster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tourneyTab === 'roster'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                👥 Bladers Roster ({bladers.filter((b) => b.checkedIn).length})
              </button>
              <button
                onClick={() => setTourneyTab('topcut')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  tourneyTab === 'topcut'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                🏆 Top 4 Finals {topCutMatches && '🔥'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySchedule}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-bold transition"
              >
                {copiedNotice ? '✓ Copied to Clipboard!' : '📋 Copy Schedule'}
              </button>
              {currentRoundFinished && currentRound < 5 && (
                <button
                  onClick={handleNextRound}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black text-xs uppercase animate-pulse shadow-md"
                >
                  Pair Round {currentRound + 1} ➔
                </button>
              )}
            </div>
          </div>

          {/* TOURNAMENT SUB-TAB 1: MATCHES */}
          {tourneyTab === 'matches' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>
                  Swiss Stage &bull; Round {currentRound} of 5 &bull; Takara
                  Tomy 4-point win rule
                </span>
                <span>
                  Tap any active stadium to score. Tap{' '}
                  <strong>&quot;Undo Result&quot;</strong> on card to reopen.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMatches.map((m) => {
                  const p1 = bladers.find((b) => b.id === m.p1Id);
                  const p2 = bladers.find((b) => b.id === m.p2Id);
                  const isBye = m.stadium === 'BYE';
                  const isFinished = m.status === 'finished';

                  return (
                    <div
                      key={m.id}
                      onClick={() =>
                        !isBye &&
                        setActiveMatchModal(JSON.parse(JSON.stringify(m)))
                      }
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                        isBye
                          ? 'bg-slate-900/40 border-slate-800 cursor-default opacity-75'
                          : isFinished
                          ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                          : 'bg-slate-900 border-cyan-900/70 hover:border-cyan-400 shadow-xl'
                      }`}
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2 mb-3">
                        <span className="font-black text-xs uppercase text-cyan-400">
                          {isBye
                            ? 'Automatic Bye'
                            : `Table / Stadium ${m.stadium}`}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            isFinished
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-[#ff4500]/20 text-[#ff7744] border border-[#ff4500]/30'
                          }`}
                        >
                          {isBye
                            ? 'Free Win (+4)'
                            : isFinished
                            ? 'Finished'
                            : 'Ready / Live'}
                        </span>
                      </div>

                      {/* Bladers and score */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <div
                              className={`font-bold text-sm ${
                                m.winnerId === p1?.id
                                  ? 'text-amber-400 font-black'
                                  : 'text-slate-200'
                              }`}
                            >
                              {p1?.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                              {p1?.deck[0].blade} ({p1?.deck[0].ratchet}{' '}
                              {p1?.deck[0].bit})
                            </div>
                          </div>
                          <span className="text-xl font-black font-mono text-cyan-400">
                            {m.p1Score}
                          </span>
                        </div>

                        <div className="text-center text-[10px] text-slate-600 font-bold uppercase">
                          VS
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div
                              className={`font-bold text-sm ${
                                m.winnerId === p2?.id
                                  ? 'text-amber-400 font-black'
                                  : 'text-slate-200'
                              }`}
                            >
                              {isBye ? 'No Opponent (Bye Pass)' : p2?.name}
                            </div>
                            {!isBye && (
                              <div className="text-[11px] text-slate-400 truncate max-w-[170px]">
                                {p2?.deck[0].blade} ({p2?.deck[0].ratchet}{' '}
                                {p2?.deck[0].bit})
                              </div>
                            )}
                          </div>
                          <span className="text-xl font-black font-mono text-cyan-400">
                            {m.p2Score}
                          </span>
                        </div>
                      </div>

                      {/* Card Action: Dedicated Undo & Details */}
                      {!isBye && (
                        <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                          {isFinished ? (
                            <>
                              <button
                                type="button"
                                onClick={(e) => handleUndoFinishedCard(m.id, e)}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-black transition flex items-center gap-1 active:scale-95"
                                title="Undo match score and reopen for refereeing"
                              >
                                <span>↺ Undo Result / Reopen</span>
                              </button>
                              <span className="text-[11px] text-slate-400 hover:text-white font-semibold">
                                View Details ➔
                              </span>
                            </>
                          ) : (
                            <div className="w-full text-center">
                              <span className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center justify-center gap-1">
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
            </div>
          )}

          {/* TOURNAMENT SUB-TAB 2: STANDINGS */}
          {tourneyTab === 'standings' && (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#090d18] shadow-2xl">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3 text-center w-12">Rank</th>
                    <th className="p-3">Blader & Location</th>
                    <th className="p-3">Primary Combo</th>
                    <th className="p-3 text-center">W - L</th>
                    <th className="p-3 text-center">Net Diff</th>
                    <th className="p-3 text-center">Points</th>
                    <th className="p-3 text-center">Buchholz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {standings.map((b, idx) => (
                    <tr key={b.id} className={idx < 4 ? 'bg-cyan-950/20' : ''}>
                      <td className="p-3 text-center font-bold text-cyan-400">
                        #{idx + 1}
                      </td>
                      <td className="p-3 font-sans">
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          {b.name}
                          {idx < 4 && (
                            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 rounded-sm">
                              TOP 4
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {b.location}
                        </div>
                      </td>
                      <td className="p-3 text-xs text-slate-300 font-sans">
                        {b.deck[0].blade} {b.deck[0].ratchet} {b.deck[0].bit}
                      </td>
                      <td className="p-3 text-center font-bold text-slate-200">
                        {b.wins} - {b.losses}
                      </td>
                      <td className="p-3 text-center text-slate-300 font-bold">
                        {b.pointDiff > 0 ? `+${b.pointDiff}` : b.pointDiff}
                      </td>
                      <td className="p-3 text-center text-cyan-300">
                        {b.pointsFor}
                      </td>
                      <td className="p-3 text-center text-slate-400 font-bold">
                        {b.buchholz}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TOURNAMENT SUB-TAB 3: ROSTER */}
          {tourneyTab === 'roster' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {bladers.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-mono font-bold text-xs">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-sm text-white">
                          {b.name}
                        </span>
                      </div>
                      <label className="flex items-center gap-1.5 text-xs text-slate-300 font-bold cursor-pointer">
                        <span>{b.checkedIn ? 'Active' : 'Absent'}</span>
                        <input
                          type="checkbox"
                          checked={b.checkedIn}
                          onChange={() =>
                            setBladers((prev) =>
                              prev.map((p) =>
                                p.id === b.id
                                  ? { ...p, checkedIn: !p.checkedIn }
                                  : p
                              )
                            )
                          }
                          className="accent-cyan-400 w-4 h-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    <div className="space-y-1 font-mono text-[11px] text-slate-400">
                      <div>
                        1. {b.deck[0].blade} {b.deck[0].ratchet} {b.deck[0].bit}
                      </div>
                      <div>
                        2. {b.deck[1].blade} {b.deck[1].ratchet} {b.deck[1].bit}
                      </div>
                      <div>
                        3. {b.deck[2].blade} {b.deck[2].ratchet} {b.deck[2].bit}
                      </div>
                    </div>

                    <button
                      onClick={() => setEditingBlader(b)}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold rounded-xl transition"
                    >
                      ✏️ Edit Deck Combos
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TOURNAMENT SUB-TAB 4: TOP 4 FINALS */}
          {tourneyTab === 'topcut' && (
            <div className="space-y-6">
              {!topCutMatches ? (
                <div className="text-center py-20 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
                  <div className="text-4xl">🏆</div>
                  <h3 className="text-lg font-bold text-white">
                    Championship Top 4 Cut Bracket
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Complete Swiss rounds to seed the top 4 contenders
                    automatically based on Wins, Net Diff, and Buchholz.
                  </p>
                  <button
                    onClick={generateTopCut}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#ff4500] text-slate-950 font-black text-xs uppercase"
                  >
                    Seed Top 4 from Standings
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Semi 1 */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {topCutMatches.semi1.title}
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`p-3 rounded-xl border flex justify-between font-bold text-xs ${
                          topCutMatches.semi1.winner?.id ===
                          topCutMatches.semi1.p1.id
                            ? 'bg-cyan-950/40 border-cyan-400'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span>{topCutMatches.semi1.p1.name} (Seed 1)</span>
                        <span>{topCutMatches.semi1.p1Score}</span>
                      </div>
                      <div
                        className={`p-3 rounded-xl border flex justify-between font-bold text-xs ${
                          topCutMatches.semi1.winner?.id ===
                          topCutMatches.semi1.p2.id
                            ? 'bg-cyan-950/40 border-cyan-400'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span>{topCutMatches.semi1.p2.name} (Seed 4)</span>
                        <span>{topCutMatches.semi1.p2Score}</span>
                      </div>
                    </div>
                    {topCutMatches.semi1.status !== 'finished' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleScoreTopCutMatch('semi1', true)}
                          className="flex-1 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold"
                        >
                          {topCutMatches.semi1.p1.name} Wins
                        </button>
                        <button
                          onClick={() => handleScoreTopCutMatch('semi1', false)}
                          className="flex-1 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold"
                        >
                          {topCutMatches.semi1.p2.name} Wins
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Semi 2 */}
                  <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      {topCutMatches.semi2.title}
                    </div>
                    <div className="space-y-2">
                      <div
                        className={`p-3 rounded-xl border flex justify-between font-bold text-xs ${
                          topCutMatches.semi2.winner?.id ===
                          topCutMatches.semi2.p1.id
                            ? 'bg-cyan-950/40 border-cyan-400'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span>{topCutMatches.semi2.p1.name} (Seed 2)</span>
                        <span>{topCutMatches.semi2.p1Score}</span>
                      </div>
                      <div
                        className={`p-3 rounded-xl border flex justify-between font-bold text-xs ${
                          topCutMatches.semi2.winner?.id ===
                          topCutMatches.semi2.p2.id
                            ? 'bg-cyan-950/40 border-cyan-400'
                            : 'bg-slate-950 border-slate-800'
                        }`}
                      >
                        <span>{topCutMatches.semi2.p2.name} (Seed 3)</span>
                        <span>{topCutMatches.semi2.p2Score}</span>
                      </div>
                    </div>
                    {topCutMatches.semi2.status !== 'finished' && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleScoreTopCutMatch('semi2', true)}
                          className="flex-1 py-1.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-bold"
                        >
                          {topCutMatches.semi2.p1.name} Wins
                        </button>
                        <button
                          onClick={() => handleScoreTopCutMatch('semi2', false)}
                          className="flex-1 py-1.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-bold"
                        >
                          {topCutMatches.semi2.p2.name} Wins
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Grand Final Card */}
                  <div className="md:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 border-2 border-amber-500/40 shadow-2xl space-y-4 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      GRAND CHAMPIONSHIP FINAL
                    </span>
                    <h3 className="text-xl font-black text-white">
                      Title Decider Match
                    </h3>
                    <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 font-bold">
                          Finalist 1
                        </p>
                        <p className="text-base font-black text-white">
                          {topCutMatches.final.p1?.name || 'Winner Semi 1'}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <p className="text-xs text-slate-400 font-bold">
                          Finalist 2
                        </p>
                        <p className="text-base font-black text-white">
                          {topCutMatches.final.p2?.name || 'Winner Semi 2'}
                        </p>
                      </div>
                    </div>
                    {topCutMatches.final.p1 &&
                      topCutMatches.final.p2 &&
                      !topCutMatches.final.winner && (
                        <div className="flex gap-3 max-w-md mx-auto pt-2">
                          <button
                            onClick={() =>
                              handleScoreTopCutMatch('final', true)
                            }
                            className="flex-1 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase"
                          >
                            Crown {topCutMatches.final.p1.name}
                          </button>
                          <button
                            onClick={() =>
                              handleScoreTopCutMatch('final', false)
                            }
                            className="flex-1 py-2 rounded-xl bg-amber-400 text-slate-950 font-black text-xs uppercase"
                          >
                            Crown {topCutMatches.final.p2.name}
                          </button>
                        </div>
                      )}
                    {topCutMatches.final.winner && (
                      <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/40 text-amber-300 font-black text-base">
                        🎉 BEYBLADE X BANGLADESH CHAMPION:{' '}
                        {topCutMatches.final.winner.name} 🏆
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: BDT COMMUNITY BAZAR */}
      {mainNav === 'market' && (
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div>
              <h2 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <span>৳</span> Bangladeshi Bladers Marketplace
              </h2>
              <p className="text-xs text-slate-400">
                Buy, sell, and trade authentic Takara Tomy items in Bangladeshi
                Taka (BDT).
              </p>
            </div>
            <button
              onClick={() => setShowPostModal(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider transition"
            >
              + Post New Listing
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {item.type}
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      ৳ {item.priceBDT.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm">{item.title}</h3>
                  <div className="text-xs text-slate-400 space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    <p>
                      📦 Condition:{' '}
                      <strong className="text-slate-200">
                        {item.condition}
                      </strong>
                    </p>
                    <p>📍 Location: {item.location}</p>
                    <p>👤 Seller: {item.seller}</p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    alert(`Contact seller (${item.seller}): ${item.phoneOrFb}`)
                  }
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold rounded-xl transition"
                >
                  Contact Seller: {item.phoneOrFb}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REFEREE SCORING MODAL WITH CLEAR UNDO POINT */}
      {activeMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider text-white">
                  Stadium {activeMatchModal.stadium} &bull; Referee Console
                </h3>
                <p className="text-[11px] text-slate-400">
                  First to 4 points (Spin 1pt, Over 2pts, Burst 2pts, Xtreme
                  3pts)
                </p>
              </div>
              <button
                onClick={() => setActiveMatchModal(null)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {activeMatchModal.winnerId && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center font-bold text-emerald-300 text-xs">
                🏆 Match Winner Decided:{' '}
                {bladers.find((b) => b.id === activeMatchModal.winnerId)?.name}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* P1 Console */}
              {(() => {
                const p1 = bladers.find((b) => b.id === activeMatchModal.p1Id);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <div className="text-sm font-black text-white truncate">
                      {p1?.name}
                    </div>
                    <div className="text-[11px] text-cyan-400 truncate mb-2">
                      {p1?.deck[0].blade}
                    </div>
                    <div className="text-5xl font-black font-mono text-white mb-2">
                      {activeMatchModal.p1Score}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-3">
                      Launch Fouls: {activeMatchModal.p1Fouls}/2
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                      <button
                        onClick={() => handleApplyFinish(1, 'Spin', 1)}
                        className="bg-slate-800 py-2 rounded-lg text-slate-200"
                      >
                        +1 Spin
                      </button>
                      <button
                        onClick={() => handleApplyFinish(1, 'Over', 2)}
                        className="bg-cyan-950 text-cyan-300 py-2 rounded-lg border border-cyan-700"
                      >
                        +2 Over
                      </button>
                      <button
                        onClick={() => handleApplyFinish(1, 'Burst', 2)}
                        className="bg-blue-950 text-blue-300 py-2 rounded-lg border border-blue-700"
                      >
                        +2 Burst
                      </button>
                      <button
                        onClick={() => handleApplyFinish(1, 'Xtreme', 3)}
                        className="bg-amber-950 text-amber-300 py-2 rounded-lg border border-amber-600"
                      >
                        +3 Xtreme
                      </button>
                    </div>
                    <button
                      onClick={() => handleFoul(1)}
                      className="w-full mt-2 py-1 text-[10px] text-rose-400 border border-rose-500/20 rounded font-semibold"
                    >
                      +1 Foul (False Launch)
                    </button>
                  </div>
                );
              })()}

              {/* P2 Console */}
              {(() => {
                const p2 = bladers.find((b) => b.id === activeMatchModal.p2Id);
                return (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center">
                    <div className="text-sm font-black text-white truncate">
                      {p2?.name}
                    </div>
                    <div className="text-[11px] text-cyan-400 truncate mb-2">
                      {p2?.deck[0].blade}
                    </div>
                    <div className="text-5xl font-black font-mono text-white mb-2">
                      {activeMatchModal.p2Score}
                    </div>
                    <div className="text-[11px] text-slate-400 mb-3">
                      Launch Fouls: {activeMatchModal.p2Fouls}/2
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
                      <button
                        onClick={() => handleApplyFinish(2, 'Spin', 1)}
                        className="bg-slate-800 py-2 rounded-lg text-slate-200"
                      >
                        +1 Spin
                      </button>
                      <button
                        onClick={() => handleApplyFinish(2, 'Over', 2)}
                        className="bg-cyan-950 text-cyan-300 py-2 rounded-lg border border-cyan-700"
                      >
                        +2 Over
                      </button>
                      <button
                        onClick={() => handleApplyFinish(2, 'Burst', 2)}
                        className="bg-blue-950 text-blue-300 py-2 rounded-lg border border-blue-700"
                      >
                        +2 Burst
                      </button>
                      <button
                        onClick={() => handleApplyFinish(2, 'Xtreme', 3)}
                        className="bg-amber-950 text-amber-300 py-2 rounded-lg border border-amber-600"
                      >
                        +3 Xtreme
                      </button>
                    </div>
                    <button
                      onClick={() => handleFoul(2)}
                      className="w-full mt-2 py-1 text-[10px] text-rose-400 border border-rose-500/20 rounded font-semibold"
                    >
                      +1 Foul (False Launch)
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* UNDO ROW IN CONSOLE */}
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="text-slate-400 truncate max-w-[260px]">
                <strong className="text-slate-300 mr-1">Last Action:</strong>
                {activeMatchModal.history &&
                activeMatchModal.history.length > 0 ? (
                  <span className="text-amber-400 font-mono">
                    {
                      activeMatchModal.history[
                        activeMatchModal.history.length - 1
                      ].type
                    }
                  </span>
                ) : (
                  <span className="italic text-slate-600">
                    No action recorded yet
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={
                  !activeMatchModal.history ||
                  activeMatchModal.history.length === 0
                }
                onClick={handleUndoInModal}
                className="px-4 py-2 text-xs font-black rounded-xl bg-amber-500 text-slate-950 hover:bg-amber-400 disabled:opacity-30 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition active:scale-95"
              >
                <span>↺ Undo Last Point</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => setActiveMatchModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMatchScore}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 uppercase tracking-wider"
              >
                Confirm Match Result
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DECK MODAL */}
      {editingBlader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-cyan-400 uppercase">
                3v3 Deck Combos &bull; {editingBlader.name}
              </h3>
              <button
                onClick={() => setEditingBlader(null)}
                className="text-slate-400 hover:text-white text-xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {[0, 1, 2].map((slotIdx) => (
              <div
                key={slotIdx}
                className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2"
              >
                <span className="text-xs font-bold text-amber-400 uppercase">
                  Slot #{slotIdx + 1} Beyblade
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Blade
                    </label>
                    <select
                      value={editingBlader.deck[slotIdx].blade}
                      onChange={(e) => {
                        const next = [...editingBlader.deck] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].blade = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: next });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Blade').map(
                        (p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Ratchet
                    </label>
                    <select
                      value={editingBlader.deck[slotIdx].ratchet}
                      onChange={(e) => {
                        const next = [...editingBlader.deck] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].ratchet = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: next });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Ratchet').map(
                        (p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">
                      Bit
                    </label>
                    <select
                      value={editingBlader.deck[slotIdx].bit}
                      onChange={(e) => {
                        const next = [...editingBlader.deck] as [
                          BeySlot,
                          BeySlot,
                          BeySlot
                        ];
                        next[slotIdx].bit = e.target.value;
                        setEditingBlader({ ...editingBlader, deck: next });
                      }}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-lg p-2 text-xs"
                    >
                      {CODEX_PARTS.filter((p) => p.type === 'Bit').map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingBlader(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setBladers((prev) =>
                    prev.map((p) =>
                      p.id === editingBlader.id ? editingBlader : p
                    )
                  );
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

      {/* POST LISTING MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0d1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">
                Post to Bangladeshi Bazar
              </h3>
              <button
                onClick={() => setShowPostModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. BX-00 Dran Dagger Gold Edition"
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">
                    Price in BDT (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={newPost.priceBDT}
                    onChange={(e) =>
                      setNewPost({ ...newPost, priceBDT: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">
                    Product Type
                  </label>
                  <select
                    value={newPost.type}
                    onChange={(e) =>
                      setNewPost({ ...newPost, type: e.target.value as any })
                    }
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Booster">Booster</option>
                    <option value="Stadium">Stadium</option>
                    <option value="Part / Bit">Part / Bit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Your Name & Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir (Dhanmondi, Dhaka)"
                  value={newPost.seller}
                  onChange={(e) =>
                    setNewPost({ ...newPost, seller: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Phone / WhatsApp / Facebook URL
                </label>
                <input
                  type="text"
                  placeholder="+880 1700-000000"
                  value={newPost.phoneOrFb}
                  onChange={(e) =>
                    setNewPost({ ...newPost, phoneOrFb: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowPostModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newPost.title || !newPost.priceBDT) {
                    alert('Please fill in the title and price!');
                    return;
                  }
                  setMarketItems([
                    {
                      id: `m-${Date.now()}`,
                      title: newPost.title,
                      priceBDT: Number(newPost.priceBDT),
                      type: newPost.type as any,
                      condition: newPost.condition as any,
                      seller: newPost.seller || 'Anonymous Blader',
                      location: newPost.location,
                      phoneOrFb: newPost.phoneOrFb || 'Contact via group',
                      verifiedTT: true,
                    },
                    ...marketItems,
                  ]);
                  setShowPostModal(false);
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-slate-950 uppercase"
              >
                Publish Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
