// Base location IDs used across all maps
export type BaseLocationId = "home" | "shop" | "petrol" | "tnb" | "office" | "bank" | "bus";

// KL-specific new locations
export type KLExtraLocationId = "sunway_lagoon" | "post_office" | "fancy_restaurant" | "fancy_cafe" | "shopping_mall";

// Penang-specific new locations
export type PenangExtraLocationId = "penang_hill" | "post_office" | "restaurant" | "shopping_mall";

// Combined location type
export type LocationId = BaseLocationId | KLExtraLocationId | PenangExtraLocationId;

export interface Location {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  icon: string;
  isWeekendOnly?: boolean; // Only available during weekend
  objectiveType?: "work" | "groceries" | "petrol" | "debt"; // What objective this location fulfills
}

export interface MapConfig {
  locations: Record<string, Location>;
  theme: {
    name: string;
    primaryColor: string;
    bgGradient: string;
    gridColor: string;
    roadStyle: "city" | "island";
  };
  landmarks: Array<{
    icon: string;
    name: string;
    x: number;
    y: number;
    size: "sm" | "md" | "lg";
  }>;
}

// KL Map - Big City Theme with skyscrapers and urban feel
export const KL_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Apartment",
      description: "Your small studio apartment in Bangsar",
      x: 8,
      y: 85,
      icon: "🏢",
    },
    shop: {
      id: "shop",
      name: "Mini Market",
      description: "24-hour convenience store for groceries",
      x: 8,
      y: 50,
      icon: "🏪",
      objectiveType: "groceries",
    },
    petrol: {
      id: "petrol",
      name: "Petronas",
      description: "Petronas station near the highway",
      x: 92,
      y: 50,
      icon: "⛽",
      objectiveType: "petrol",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "Tenaga Nasional office",
      x: 35,
      y: 15,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Office",
      description: "Your company in the CBD",
      x: 35,
      y: 85,
      icon: "🏢",
      objectiveType: "work",
    },
    bank: {
      id: "bank",
      name: "Maybank",
      description: "Maybank branch - check credit score or pay debt",
      x: 92,
      y: 15,
      icon: "🏦",
      // No auto objectiveType - debt payment is manual via button
    },
    // New locations
    post_office: {
      id: "post_office",
      name: "Pejabat Pos",
      description: "Post office for bills and remittances",
      x: 8,
      y: 15,
      icon: "📮",
    },
    fancy_restaurant: {
      id: "fancy_restaurant",
      name: "Restaurant",
      description: "Nice restaurant in Bangsar for meals",
      x: 65,
      y: 15,
      icon: "🍽️",
    },
    fancy_cafe: {
      id: "fancy_cafe",
      name: "Hipster Cafe",
      description: "Trendy cafe with good coffee and WiFi",
      x: 65,
      y: 50,
      icon: "☕",
      isWeekendOnly: true,
    },
    shopping_mall: {
      id: "shopping_mall",
      name: "Mid Valley",
      description: "Shopping mall for weekend retail therapy",
      x: 65,
      y: 85,
      icon: "🏬",
      isWeekendOnly: true,
    },
    sunway_lagoon: {
      id: "sunway_lagoon",
      name: "Sunway Lagoon",
      description: "Famous theme park - expensive but super fun!",
      x: 35,
      y: 50,
      icon: "🎢",
      isWeekendOnly: true,
    },
  },
  theme: {
    name: "Kuala Lumpur",
    primaryColor: "#00d4ff",
    bgGradient: "from-slate-900 via-blue-950 to-slate-900",
    gridColor: "rgba(0, 212, 255, 0.1)",
    roadStyle: "city",
  },
  landmarks: [
    { icon: "🏙️", name: "KLCC", x: 50, y: 30, size: "lg" },
  ],
};

// Penang Map - Island Paradise Theme with beaches and sea
export const PENANG_MAP: MapConfig = {
  locations: {
    // Column 1 (x: 8)
    home: {
      id: "home",
      name: "Rumah",
      description: "Your rented house near the beach",
      x: 8,
      y: 85,
      icon: "🏠",
    },
    shop: {
      id: "shop",
      name: "Kedai",
      description: "The friendly neighborhood shop for groceries",
      x: 8,
      y: 50,
      icon: "🏪",
      objectiveType: "groceries",
    },
    post_office: {
      id: "post_office",
      name: "Pejabat Pos",
      description: "Post office for bills and remittances",
      x: 8,
      y: 15,
      icon: "📮",
    },

    // Column 2 (x: 35)
    office: {
      id: "office",
      name: "Pejabat",
      description: "Your office in George Town",
      x: 35,
      y: 85,
      icon: "🏢",
      objectiveType: "work",
    },
    petrol: {
      id: "petrol",
      name: "Shell",
      description: "Shell station in town",
      x: 35,
      y: 50,
      icon: "⛽",
      objectiveType: "petrol",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "TNB office in town",
      x: 35,
      y: 15,
      icon: "💡",
    },

    // Column 3 (x: 63)
    penang_hill: {
      id: "penang_hill",
      name: "Penang Hill",
      description: "Take the funicular up for fresh air and beautiful views - cheap and relaxing!",
      x: 63,
      y: 85,
      icon: "⛰️",
      isWeekendOnly: true,
    },
    shopping_mall: {
      id: "shopping_mall",
      name: "Gurney Plaza",
      description: "Shopping mall for weekend window shopping with your child",
      x: 63,
      y: 50,
      icon: "🏬",
      isWeekendOnly: true,
    },
    restaurant: {
      id: "restaurant",
      name: "Restoran",
      description: "Family-friendly restaurant for meals with your child",
      x: 63,
      y: 15,
      icon: "🍽️",
    },

    // Column 4 (x: 90)
    bank: {
      id: "bank",
      name: "Bank",
      description: "Bank in George Town - check credit score or pay debt",
      x: 90,
      y: 15,
      icon: "🏦",
      // No auto objectiveType - debt payment is manual via button
    },
  },
  theme: {
    name: "Pulau Pinang",
    primaryColor: "#06b6d4",
    bgGradient: "from-cyan-900 via-blue-900 to-cyan-950",
    gridColor: "rgba(6, 182, 212, 0.1)",
    roadStyle: "island",
  },
  landmarks: [
    { icon: "🏖️", name: "Batu Ferringhi", x: 49, y: 32, size: "lg" },
  ],
};

// Map persona IDs to their maps
export const PERSONA_MAPS: Record<string, MapConfig> = {
  freshGrad: KL_MAP,
  singleParent: PENANG_MAP,
};

// Default locations for backwards compatibility
export const LOCATIONS = KL_MAP.locations;

// Character personas
export const PERSONAS = {
  freshGrad: {
    id: "freshGrad",
    name: "Fresh Graduate",
    name_bm: "Graduan Baru",
    description: "Just finished university, starting life in KL with degree debt",
    description_bm: "Baru tamat universiti, mulakan hidup di KL dengan hutang ijazah",
    location: "Kuala Lumpur",
    monthlySalary: 2200,
    initialMoney: 800,
    initialDebt: 30000,
    debtType: "Degree loan",
    debtType_bm: "Pinjaman Ijazah",
    initialCreditScore: 650,
    backstory:
      "You just graduated with a degree in Business Administration. You landed your first job at a startup in KL. Your degree loan payments start this month. Welcome to the big city life.",
    backstory_bm:
      "Anda baru sahaja tamat pengajian dengan ijazah Pengurusan Perniagaan. Anda mendapat kerja pertama di sebuah syarikat pemula di KL. Bayaran pinjaman ijazah anda bermula bulan ini. Selamat datang ke kota besar.",
  },
  singleParent: {
    id: "singleParent",
    name: "Single Parent",
    name_bm: "Ibu/Bapa Tunggal",
    description: "Raising a child alone in Penang, juggling work and family",
    description_bm: "Membesarkan anak sendirian di Pulau Pinang, mengimbangi kerja dan keluarga",
    location: "Pulau Pinang",
    monthlySalary: 1800,
    initialMoney: 500,
    initialDebt: 7000,
    debtType: "Personal Loan",
    debtType_bm: "Pinjaman Peribadi",
    initialCreditScore: 580,
    backstory:
      "After your divorce, you moved back to your hometown island of Penang. You work as an admin clerk while raising your 8-year-old child. The sea breeze is calming, but money is always tight.",
    backstory_bm:
      "Selepas bercerai, anda berpindah semula ke kampung halaman di Pulau Pinang. Anda bekerja sebagai kerani admin sambil membesarkan anak berumur 8 tahun. Angin laut menenangkan, tetapi kewangan sentiasa sempit.",
  },
} as const;

export type PersonaId = keyof typeof PERSONAS;

// Game configuration
export const GAME_CONFIG = {
  energyPerWeek: 11,
  totalWeeks: 4, // 1 month = 4 weeks
  daysPerWeek: 5, // weekdays only (Days 1-5)
  workDaysRequired: 5, // must attend work every weekday
  energyCostPerAction: 1, // every location visit costs 1 energy
  startingHealth: 100,
  startingStress: 20,
  creditScoreMin: 300,
  creditScoreMax: 850,
  // Objective costs (deducted immediately when objective is completed)
  groceryCostHealthy: 50,    // +10 health, -10 stress
  groceryCostUnhealthy: 30,  // -10 health, -15 stress (cheaper but hurts you)
  petrolCost: 80,
  // Energy breakdown (for student reference):
  //   Mandatory per week: 5 work + 1 groceries + 1 petrol = 7
  //   Free energy for choices: 11 - 7 = 4 actions
  workStressPerDay: 7,       // reduced from 10; work is tiring but not crushing alone
} as const;

// Weekly auto-deductions per persona (mirrored from convex/games.ts WEEKLY_FINANCES).
// Salary paid at week end; rent + minimum debt installment auto-debited at same time.
// Used by the frontend to show the payday breakdown preview in the Weekend Dialog.
export const WEEKLY_FINANCES = {
  freshGrad: {
    weeklySalary: 550,   // RM 2,200 monthly salary ÷ 4 weeks
    weeklyRent: 138,      // RM 550/month KL apartment ÷ 4 weeks
    weeklyDebtMin: 150,   // PTPTN ~RM 600/month ÷ 4 weeks (auto-debit)
    netAfterAutoDebits: 262, // 550 - 138 - 150 (before groceries & petrol)
    debtLabel: "PTPTN",
  },
  singleParent: {
    weeklySalary: 450,   // RM 1,800 monthly salary ÷ 4 weeks
    weeklyRent: 113,      // RM 450/month Penang house ÷ 4 weeks
    weeklyDebtMin: 88,    // Personal loan ~RM 350/month ÷ 4 weeks
    netAfterAutoDebits: 249, // 450 - 113 - 88
    debtLabel: "Personal Loan",
  },
} as const;

// Credit score bands — shown to students to explain what the number means in real life.
export const CREDIT_SCORE_BANDS = [
  { min: 750, max: 850, label: "Excellent", colour: "#22c55e",
    meaning: "Easy loan approvals, lowest interest rates" },
  { min: 700, max: 749, label: "Good",      colour: "#84cc16",
    meaning: "Most loans approved with standard rates" },
  { min: 650, max: 699, label: "Fair",      colour: "#eab308",
    meaning: "Loans possible but at higher interest" },
  { min: 550, max: 649, label: "Poor",      colour: "#f97316",
    meaning: "Loan applications likely rejected" },
  { min: 300, max: 549, label: "Bad",       colour: "#ef4444",
    meaning: "Blacklisted — even phone plans get rejected" },
] as const;

// NPC names for consistent personality
export const NPCS = {
  pakAli: {
    name: "Pak Ali",
    role: "Shopkeeper",
    personality: "Kind old man who runs the kedai runcit. Gives credit sometimes.",
  },
  boss: {
    name: "Encik Ahmad",
    role: "Boss",
    personality: "Strict but fair. Values punctuality and hard work.",
  },
  roommate: {
    name: "Farid",
    role: "Roommate",
    personality: "Friendly but sometimes borrows money without returning.",
  },
  bankOfficer: {
    name: "Puan Siti",
    role: "Bank Officer",
    personality: "Professional, follows rules strictly.",
  },
  loanShark: {
    name: "Along",
    role: "Loan Shark",
    personality: "Seems friendly at first, but dangerous when you owe money.",
  },
} as const;

// Emotion types for UI display
export const EMOTIONS = [
  "neutral",
  "happy",
  "sad",
  "stressed",
  "angry",
  "hopeful",
  "desperate",
  "relieved",
] as const;

export type Emotion = (typeof EMOTIONS)[number];

// Special random events per persona
export const SPECIAL_EVENTS = {
  freshGrad: {
    negative: [
      {
        id: "vehicle_breakdown",
        title: "Vehicle Broke Down",
        description: "Your car broke down on the highway. Need to pay for tow truck and repairs.",
        moneyChange: -300,
        stressChange: 20,
        healthChange: 0,
        isPositive: false,
      },
      {
        id: "clinic_visit",
        title: "Clinic Visit",
        description: "You've been feeling unwell. Time to visit the clinic for medicine.",
        moneyChange: -150,
        stressChange: 10,
        healthChange: 20,
        isPositive: false,
      },
      {
        id: "samun_rempit",
        title: "Samun by Mat Rempit",
        description: "You were robbed by mat rempit near your apartment. Lost your wallet.",
        moneyChange: -200,
        stressChange: 30,
        healthChange: -10,
        isPositive: false,
      },
      {
        id: "relatives_money",
        title: "Relatives Need Money",
        description: "Your aunt from kampung called. Family emergency, they need help.",
        moneyChange: -500,
        stressChange: 15,
        healthChange: 0,
        isPositive: false,
      },
    ],
    positive: [
      {
        id: "parent_gift",
        title: "Parent Give Money",
        description: "Your parents sent you some money. They're worried about you in the big city.",
        moneyChange: 300,
        stressChange: -10,
        healthChange: 0,
        isPositive: true,
      },
      {
        id: "gig_job",
        title: "Gig Job Opportunity",
        description: "Found a weekend gig delivering food. Extra income!",
        moneyChange: 200,
        stressChange: 5,
        healthChange: 0,
        isPositive: true,
      },
      {
        id: "girlfriend_present",
        title: "Girlfriend Gift",
        description: "Your girlfriend surprised you with a homemade meal. Feeling loved.",
        moneyChange: 0,
        stressChange: -20,
        healthChange: 5,
        isPositive: true,
      },
    ],
    neutral: [
      {
        id: "girlfriend_conflict",
        title: "Conflict with Girlfriend",
        description: "Had a big argument with your girlfriend. She thinks you work too much.",
        moneyChange: 0,
        stressChange: 25,
        healthChange: 0,
        isPositive: false,
      },
    ],
  },
  singleParent: {
    negative: [
      {
        id: "vehicle_breakdown",
        title: "Vehicle Broke Down",
        description: "Your motorcycle broke down. Need to repair it to get to work.",
        moneyChange: -250,
        stressChange: 20,
        healthChange: 0,
        isPositive: false,
      },
      {
        id: "clinic_visit",
        title: "Clinic Visit",
        description: "Your child is sick. Need to take them to the clinic.",
        moneyChange: -100,
        stressChange: 10,
        healthChange: 15,
        isPositive: false,
      },
      {
        id: "natural_disaster",
        title: "Natural Disaster",
        description: "Flash flood damaged some of your belongings at home.",
        moneyChange: -400,
        stressChange: 35,
        healthChange: 0,
        isPositive: false,
      },
      {
        id: "school_supplies",
        title: "Kids Need School Supplies",
        description: "Your child needs new school uniforms and books for the new term.",
        moneyChange: -200,
        stressChange: 10,
        healthChange: 0,
        isPositive: false,
      },
    ],
    positive: [
      {
        id: "bantuan_mysara",
        title: "Bantuan MySara",
        description: "Good news! You received government assistance from Bantuan MySara.",
        moneyChange: 500,
        stressChange: -15,
        healthChange: 0,
        isPositive: true,
      },
      {
        id: "gig_job",
        title: "Gig Job",
        description: "Found extra work doing data entry from home. Can do it while watching your kid.",
        moneyChange: 150,
        stressChange: 5,
        healthChange: 0,
        isPositive: true,
      },
      {
        id: "kids_drawing",
        title: "Drawing from Kids",
        description: "Your child drew you a beautiful picture saying 'I love you, Mama/Papa'. Priceless.",
        moneyChange: 0,
        stressChange: -25,
        healthChange: 5,
        isPositive: true,
      },
    ],
    neutral: [
      {
        id: "kids_bullied",
        title: "Children Get Bullied",
        description: "Your child came home crying. Some kids at school were bullying them.",
        moneyChange: 0,
        stressChange: 30,
        healthChange: 0,
        isPositive: false,
      },
    ],
  },
} as const;

// Weekend activities per persona
export const WEEKEND_ACTIVITIES = {
  skip: {
    id: "skip",
    name: "Skip Weekend",
    description: "Stay home and rest (but stress builds up from no relaxation)",
    moneyCost: 0,
    stressChange: 15, // stress INCREASES
    healthChange: 0,
  },
  freshGrad: [
    {
      id: "fancy_restaurant",
      name: "Fancy Restaurant",
      description: "Treat yourself to a nice dinner at a restaurant in Bangsar",
      locationId: "fancy_restaurant",
      moneyCost: 150,
      stressChange: -25,
      healthChange: 5,
    },
    {
      id: "fancy_cafe",
      name: "Fancy Cafe",
      description: "Chill at a hipster cafe with good coffee and WiFi",
      locationId: "fancy_cafe",
      moneyCost: 80,
      stressChange: -15,
      healthChange: 0,
    },
    {
      id: "sunway_lagoon",
      name: "Sunway Lagoon",
      description: "Full day of fun at the famous theme park!",
      locationId: "sunway_lagoon",
      moneyCost: 200,
      stressChange: -35,
      healthChange: 10,
    },
  ],
  singleParent: [
    {
      id: "restaurant_kids",
      name: "Restaurant with Kids",
      description: "Take your child out for a nice meal at a family restaurant",
      locationId: "restaurant",
      moneyCost: 100,
      stressChange: -20,
      healthChange: 5,
    },
    {
      id: "shopping_mall",
      name: "Shopping Mall",
      description: "Window shopping with your child at Gurney Plaza",
      locationId: "shopping_mall",
      moneyCost: 50,
      stressChange: -10,
      healthChange: 0,
    },
    {
      id: "penang_hill",
      name: "Penang Hill",
      description: "Take the funicular up Penang Hill for fresh air and beautiful views",
      locationId: "penang_hill",
      moneyCost: 30,
      stressChange: -30,
      healthChange: 15,
    },
  ],
} as const;
