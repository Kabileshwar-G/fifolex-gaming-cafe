import {
  Station,
  Session,
  Booking,
  Customer,
  Product,
  Order,
  MaintenanceIssue,
  StaffUser,
  AuditEvent,
  CafeSettings
} from '@/types';

export const initialSettings: CafeSettings = {
  cafeName: "Fifolex Cyber Lounge & Esports Arena",
  tagline: "Next-Generation Gaming Sanctuary & Operations Center",
  address: "742 Nexus Boulevard, Neo District, Sector 4",
  phone: "+1 (555) 343-6539",
  email: "ops@fifolex.gg",
  operatingHours: {
    open: "10:00",
    close: "03:00"
  },
  timezone: "America/New_York",
  currencySymbol: "$",
  currencyCode: "USD",
  taxRatePercent: 8.5,
  gracePeriodMinutes: 10,
  bufferBetweenSessionsMinutes: 10,
  minSessionMinutes: 60,
  ratesPerHourCents: {
    pc: 600, // $6.00/hr
    ps5: 800, // $8.00/hr
    xbox: 700, // $7.00/hr
    vr: 1500, // $15.00/hr
    racing: 1400 // $14.00/hr
  },
  membershipDiscounts: {
    standard: 0,
    silver: 10, // 10% off
    gold: 20, // 20% off
    vip: 30 // 30% off
  },
  acceptedPaymentMethods: ["Cash", "Credit/Debit Card", "Apple/Google Pay", "Customer Wallet", "UPI / QR"]
};

export const initialStations: Station[] = [
  // PC Arena (Rows of PCs)
  {
    id: "st-pc-01",
    name: "PC-01",
    type: "pc",
    zone: "Main PC Arena",
    status: "occupied",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "Apex Legends", "Cyberpunk 2077", "Dota 2"],
    position: [-6, 0, -4],
    rotation: [0, 0, 0],
    currentSessionId: "sess-01"
  },
  {
    id: "st-pc-02",
    name: "PC-02",
    type: "pc",
    zone: "Main PC Arena",
    status: "occupied",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "League of Legends", "Overwatch 2"],
    position: [-3.5, 0, -4],
    rotation: [0, 0, 0],
    currentSessionId: "sess-02"
  },
  {
    id: "st-pc-03",
    name: "PC-03",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "Apex Legends", "Fortnite"],
    position: [-1, 0, -4],
    rotation: [0, 0, 0]
  },
  {
    id: "st-pc-04",
    name: "PC-04",
    type: "pc",
    zone: "Main PC Arena",
    status: "reserved",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "Apex Legends", "Dota 2"],
    position: [1.5, 0, -4],
    rotation: [0, 0, 0]
  },
  {
    id: "st-pc-05",
    name: "PC-05",
    type: "pc",
    zone: "Main PC Arena",
    status: "cleaning",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "Rainbow Six Siege"],
    position: [4, 0, -4],
    rotation: [0, 0, 0]
  },
  {
    id: "st-pc-06",
    name: "PC-06",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Core i9-14900K", gpu: "RTX 4080 Super", ram: "32GB DDR5", screen: "27\" 240Hz OLED", peripherals: "Logitech G Pro X" },
    installedGames: ["Valorant", "Counter-Strike 2", "Warzone", "PUBG"],
    position: [6.5, 0, -4],
    rotation: [0, 0, 0]
  },
  {
    id: "st-pc-07",
    name: "PC-07",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Fortnite", "Minecraft", "Rocket League"],
    position: [-6, 0, -1.5],
    rotation: [0, Math.PI, 0]
  },
  {
    id: "st-pc-08",
    name: "PC-08",
    type: "pc",
    zone: "Main PC Arena",
    status: "maintenance",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Fortnite", "Apex Legends"],
    position: [-3.5, 0, -1.5],
    rotation: [0, Math.PI, 0],
    notes: "GPU fan bearing rattle under high load. Awaiting replacement fan."
  },
  {
    id: "st-pc-09",
    name: "PC-09",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Counter-Strike 2", "Apex Legends"],
    position: [-1, 0, -1.5],
    rotation: [0, Math.PI, 0]
  },
  {
    id: "st-pc-10",
    name: "PC-10",
    type: "pc",
    zone: "Main PC Arena",
    status: "occupied",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Counter-Strike 2", "Dota 2"],
    position: [1.5, 0, -1.5],
    rotation: [0, Math.PI, 0],
    currentSessionId: "sess-03"
  },
  {
    id: "st-pc-11",
    name: "PC-11",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Counter-Strike 2", "Warzone"],
    position: [4, 0, -1.5],
    rotation: [0, Math.PI, 0]
  },
  {
    id: "st-pc-12",
    name: "PC-12",
    type: "pc",
    zone: "Main PC Arena",
    status: "available",
    hourlyRateCents: 600,
    specs: { cpu: "Ryzen 7 7800X3D", gpu: "RTX 4070 Ti", ram: "32GB DDR5", screen: "27\" 180Hz IPS", peripherals: "Razer Huntsman" },
    installedGames: ["Valorant", "Counter-Strike 2", "Cyberpunk 2077"],
    position: [6.5, 0, -1.5],
    rotation: [0, Math.PI, 0]
  },

  // VIP Console Lounge (PS5 & Xbox)
  {
    id: "st-ps5-01",
    name: "PS5-VIP-01",
    type: "ps5",
    zone: "VIP Console Lounge",
    status: "occupied",
    hourlyRateCents: 800,
    specs: { platform: "PlayStation 5 Pro", screen: "55\" 4K 120Hz OLED", peripherals: "DualSense Edge + Astro A50" },
    installedGames: ["EA Sports FC 25", "Tekken 8", "Spider-Man 2", "Mortal Kombat 1", "Gran Turismo 7"],
    position: [-6, 0, 2],
    rotation: [0, 0, 0],
    currentSessionId: "sess-04"
  },
  {
    id: "st-ps5-02",
    name: "PS5-VIP-02",
    type: "ps5",
    zone: "VIP Console Lounge",
    status: "available",
    hourlyRateCents: 800,
    specs: { platform: "PlayStation 5 Pro", screen: "55\" 4K 120Hz OLED", peripherals: "DualSense Edge + Astro A50" },
    installedGames: ["EA Sports FC 25", "NBA 2K25", "Street Fighter 6", "Helldivers 2"],
    position: [-3.5, 0, 2],
    rotation: [0, 0, 0]
  },
  {
    id: "st-ps5-03",
    name: "PS5-VIP-03",
    type: "ps5",
    zone: "VIP Console Lounge",
    status: "available",
    hourlyRateCents: 800,
    specs: { platform: "PlayStation 5", screen: "55\" 4K 120Hz OLED", peripherals: "DualSense (x2)" },
    installedGames: ["EA Sports FC 25", "Tekken 8", "WWE 2K24"],
    position: [-1, 0, 2],
    rotation: [0, 0, 0]
  },
  {
    id: "st-ps5-04",
    name: "PS5-VIP-04",
    type: "ps5",
    zone: "VIP Console Lounge",
    status: "cleaning",
    hourlyRateCents: 800,
    specs: { platform: "PlayStation 5", screen: "55\" 4K 120Hz OLED", peripherals: "DualSense (x2)" },
    installedGames: ["EA Sports FC 25", "Mortal Kombat 1", "Overcooked 2"],
    position: [1.5, 0, 2],
    rotation: [0, 0, 0]
  },
  {
    id: "st-xbox-01",
    name: "XBOX-01",
    type: "xbox",
    zone: "VIP Console Lounge",
    status: "reserved",
    hourlyRateCents: 700,
    specs: { platform: "Xbox Series X", screen: "55\" 4K 120Hz TV", peripherals: "Xbox Elite Series 2 Controller" },
    installedGames: ["Forza Horizon 5", "Halo Infinite", "Gears 5", "Starfield"],
    position: [4, 0, 2],
    rotation: [0, 0, 0]
  },
  {
    id: "st-xbox-02",
    name: "XBOX-02",
    type: "xbox",
    zone: "VIP Console Lounge",
    status: "available",
    hourlyRateCents: 700,
    specs: { platform: "Xbox Series X", screen: "55\" 4K 120Hz TV", peripherals: "Xbox Wireless Controller (x2)" },
    installedGames: ["Forza Horizon 5", "EA Sports FC 25", "Sea of Thieves"],
    position: [6.5, 0, 2],
    rotation: [0, 0, 0]
  },

  // Sim Racing Paddock
  {
    id: "st-rig-01",
    name: "RIG-01",
    type: "racing",
    zone: "Sim Paddock",
    status: "occupied",
    hourlyRateCents: 1400,
    specs: { platform: "PC RTX 4090", screen: "Triple 32\" 165Hz Curved", peripherals: "Fanatec DD Pro 8Nm + Load Cell Pedals + Sparco Seat" },
    installedGames: ["Assetto Corsa Competizione", "iRacing", "F1 24", "Forza Motorsport", "Dirt Rally 2.0"],
    position: [-5, 0, 5],
    rotation: [0, 0, 0],
    currentSessionId: "sess-05"
  },
  {
    id: "st-rig-02",
    name: "RIG-02",
    type: "racing",
    zone: "Sim Paddock",
    status: "available",
    hourlyRateCents: 1400,
    specs: { platform: "PC RTX 4090", screen: "Triple 32\" 165Hz Curved", peripherals: "Fanatec DD Pro 8Nm + Load Cell Pedals + Sparco Seat" },
    installedGames: ["Assetto Corsa Competizione", "iRacing", "F1 24", "Automobilista 2"],
    position: [-2.5, 0, 5],
    rotation: [0, 0, 0]
  },

  // VR Holo-Bay
  {
    id: "st-vr-01",
    name: "VR-01",
    type: "vr",
    zone: "VR Holo-Bay",
    status: "available",
    hourlyRateCents: 1500,
    specs: { platform: "Valve Index + PC RTX 4080", screen: "Dual 144Hz Fresnel", peripherals: "Knuckles Controllers + Ceiling Cable Pulley" },
    installedGames: ["Half-Life: Alyx", "Beat Saber", "Superhot VR", "Boneworks"],
    position: [3, 0, 5],
    rotation: [0, 0, 0]
  },
  {
    id: "st-vr-02",
    name: "VR-02",
    type: "vr",
    zone: "VR Holo-Bay",
    status: "available",
    hourlyRateCents: 1500,
    specs: { platform: "Meta Quest 3 + PC RTX 4080", screen: "4K+ Infinite Display", peripherals: "Touch Plus Controllers + Haptic Vest" },
    installedGames: ["Beat Saber", "Pistol Whip", "The Walking Dead: Saints & Sinners", "Pavlov VR"],
    position: [5.8, 0, 5],
    rotation: [0, 0, 0]
  }
];

// Helper to calculate timestamps relative to current time
const now = new Date();
const minutesAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
const minutesFromNow = (m: number) => new Date(now.getTime() + m * 60000).toISOString();

export const initialSessions: Session[] = [
  {
    id: "sess-01",
    stationId: "st-pc-01",
    stationName: "PC-01",
    customerId: "cust-01",
    customerName: "Marcus Vance",
    customerPhone: "+1 (555) 234-8901",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(75),
    durationMinutes: 120,
    expectedEndTime: minutesFromNow(45),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 600,
    discountCents: 0,
    orderItemIds: ["ord-01"],
    totalChargedCents: 1200,
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-02",
    stationId: "st-pc-02",
    stationName: "PC-02",
    customerId: "cust-02",
    customerName: "Chloe Zhang",
    customerPhone: "+1 (555) 789-1234",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(50),
    durationMinutes: 60,
    expectedEndTime: minutesFromNow(10), // Ending soon!
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 600,
    discountCents: 60, // 10% member discount
    discountReason: "Silver Member (10%)",
    orderItemIds: [],
    totalChargedCents: 540,
    paymentStatus: "paid",
    paymentMethod: "Credit/Debit Card",
    transferHistory: []
  },
  {
    id: "sess-03",
    stationId: "st-pc-10",
    stationName: "PC-10",
    customerId: "cust-03",
    customerName: "Dmitri Volkov",
    customerPhone: "+1 (555) 456-7890",
    staffId: "staff-manager",
    staffName: "David Miller",
    startTime: minutesAgo(130),
    durationMinutes: 120,
    expectedEndTime: minutesAgo(10), // Overdue alert!
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 600,
    discountCents: 0,
    orderItemIds: [],
    totalChargedCents: 1200,
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-04",
    stationId: "st-ps5-01",
    stationName: "PS5-VIP-01",
    customerId: "cust-04",
    customerName: "Jaylen Brooks",
    customerPhone: "+1 (555) 901-2345",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(30),
    durationMinutes: 180,
    expectedEndTime: minutesFromNow(150),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 800,
    discountCents: 480, // 20% Gold Member
    discountReason: "Gold Member (20%)",
    orderItemIds: ["ord-02"],
    totalChargedCents: 1920,
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-05",
    stationId: "st-rig-01",
    stationName: "RIG-01",
    customerId: "cust-05",
    customerName: "Sebastian Vettel Fan",
    customerPhone: "+1 (555) 333-8899",
    staffId: "staff-manager",
    staffName: "David Miller",
    startTime: minutesAgo(40),
    durationMinutes: 60,
    expectedEndTime: minutesFromNow(20),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 1400,
    discountCents: 0,
    orderItemIds: [],
    totalChargedCents: 1400,
    paymentStatus: "paid",
    paymentMethod: "Customer Wallet",
    transferHistory: []
  }
];

export const initialBookings: Booking[] = [
  {
    id: "bk-01",
    stationId: "st-pc-04",
    stationName: "PC-04",
    stationType: "pc",
    customerId: "cust-06",
    customerName: "Aiden Scott",
    customerPhone: "+1 (555) 777-6655",
    customerEmail: "aiden@nexus.io",
    date: new Date().toISOString().split('T')[0],
    startTime: "21:00",
    durationMinutes: 120,
    status: "confirmed",
    depositCents: 600,
    depositPaid: true,
    notes: "Requires CS2 tournament settings configured",
    createdAt: minutesAgo(240)
  },
  {
    id: "bk-02",
    stationId: "st-xbox-01",
    stationName: "XBOX-01",
    stationType: "xbox",
    customerId: "cust-07",
    customerName: "Sophia Hernandez",
    customerPhone: "+1 (555) 222-3344",
    customerEmail: "sophia.h@gmail.com",
    date: new Date().toISOString().split('T')[0],
    startTime: "21:30",
    durationMinutes: 90,
    status: "confirmed",
    depositCents: 500,
    depositPaid: true,
    notes: "Bringing 2 guests for Forza party",
    createdAt: minutesAgo(180)
  },
  {
    id: "bk-03",
    stationId: "st-vr-01",
    stationName: "VR-01",
    stationType: "vr",
    customerName: "Liam O'Connor",
    customerPhone: "+1 (555) 444-1122",
    customerEmail: "liam.vr@yahoo.com",
    date: new Date(now.getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
    startTime: "18:00",
    durationMinutes: 60,
    status: "pending",
    depositCents: 0,
    depositPaid: false,
    notes: "First time VR user, wants Half-Life Alyx tutorial",
    createdAt: minutesAgo(60)
  }
];

export const initialCustomers: Customer[] = [
  {
    id: "cust-01",
    name: "Marcus Vance",
    email: "marcus.v@gmail.com",
    phone: "+1 (555) 234-8901",
    membershipTier: "silver",
    walletBalanceCents: 4500, // $45.00
    loyaltyPoints: 340,
    totalHoursPlayed: 54,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-01",
    notes: "Prefers Logitech mechanical switches and high DPI",
    createdAt: "2026-08-14T10:00:00Z"
  },
  {
    id: "cust-02",
    name: "Chloe Zhang",
    email: "chloe.z@outlook.com",
    phone: "+1 (555) 789-1234",
    membershipTier: "silver",
    walletBalanceCents: 2200,
    loyaltyPoints: 180,
    totalHoursPlayed: 28,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-02",
    notes: "Regular Wednesday evening player",
    createdAt: "2026-09-02T14:30:00Z"
  },
  {
    id: "cust-03",
    name: "Dmitri Volkov",
    email: "dmitri.v@proton.me",
    phone: "+1 (555) 456-7890",
    membershipTier: "standard",
    walletBalanceCents: 500,
    loyaltyPoints: 80,
    totalHoursPlayed: 14,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-10",
    createdAt: "2026-10-10T18:20:00Z"
  },
  {
    id: "cust-04",
    name: "Jaylen Brooks",
    email: "jaylen.b@gmail.com",
    phone: "+1 (555) 901-2345",
    membershipTier: "gold",
    walletBalanceCents: 12000, // $120.00
    loyaltyPoints: 950,
    totalHoursPlayed: 110,
    preferredPlatform: "ps5",
    preferredStationId: "st-ps5-01",
    notes: "EA Sports FC competitive player, tournament participant",
    createdAt: "2026-06-01T12:00:00Z"
  },
  {
    id: "cust-05",
    name: "Sebastian Vettel Fan",
    email: "seb.sim@racing.net",
    phone: "+1 (555) 333-8899",
    membershipTier: "vip",
    walletBalanceCents: 35000, // $350.00
    loyaltyPoints: 2400,
    totalHoursPlayed: 180,
    preferredPlatform: "racing",
    preferredStationId: "st-rig-01",
    notes: "Demands triple-screen calibration check before start",
    createdAt: "2026-04-12T09:15:00Z"
  },
  {
    id: "cust-06",
    name: "Aiden Scott",
    email: "aiden@nexus.io",
    phone: "+1 (555) 777-6655",
    membershipTier: "standard",
    walletBalanceCents: 1500,
    loyaltyPoints: 120,
    totalHoursPlayed: 16,
    preferredPlatform: "pc",
    createdAt: "2026-10-25T16:40:00Z"
  },
  {
    id: "cust-07",
    name: "Sophia Hernandez",
    email: "sophia.h@gmail.com",
    phone: "+1 (555) 222-3344",
    membershipTier: "silver",
    walletBalanceCents: 3000,
    loyaltyPoints: 210,
    totalHoursPlayed: 32,
    preferredPlatform: "xbox",
    createdAt: "2026-09-18T11:00:00Z"
  }
];

export const initialProducts: Product[] = [
  // Beverages
  {
    id: "prod-01",
    name: "Red Bull Energy Drink (250ml)",
    category: "beverage",
    priceCents: 350,
    costCents: 160,
    stockQuantity: 42,
    lowStockThreshold: 15,
    available: true
  },
  {
    id: "prod-02",
    name: "Monster Energy Ultra White (500ml)",
    category: "beverage",
    priceCents: 400,
    costCents: 180,
    stockQuantity: 36,
    lowStockThreshold: 12,
    available: true
  },
  {
    id: "prod-03",
    name: "Iced Caramel Macchiato",
    category: "beverage",
    priceCents: 450,
    costCents: 120,
    stockQuantity: 50,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-04",
    name: "Matcha Latte",
    category: "beverage",
    priceCents: 450,
    costCents: 110,
    stockQuantity: 30,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-05",
    name: "Electrolyte Sports Water",
    category: "beverage",
    priceCents: 250,
    costCents: 80,
    stockQuantity: 8, // Low stock alert!
    lowStockThreshold: 10,
    available: true
  },

  // Hot Food & Snacks
  {
    id: "prod-06",
    name: "Loaded Cyber Nachos",
    category: "hot_food",
    priceCents: 850,
    costCents: 290,
    stockQuantity: 24,
    lowStockThreshold: 8,
    available: true
  },
  {
    id: "prod-07",
    name: "Crispy Truffle Fries",
    category: "hot_food",
    priceCents: 650,
    costCents: 180,
    stockQuantity: 28,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-08",
    name: "Pepperoni Flatbread Pizza",
    category: "hot_food",
    priceCents: 1100,
    costCents: 380,
    stockQuantity: 18,
    lowStockThreshold: 6,
    available: true
  },
  {
    id: "prod-09",
    name: "Chicken Teriyaki Gyoza (6pcs)",
    category: "hot_food",
    priceCents: 750,
    costCents: 240,
    stockQuantity: 15,
    lowStockThreshold: 5,
    available: true
  },
  {
    id: "prod-10",
    name: "Doritos Sweet Chili Heat (Bag)",
    category: "snack",
    priceCents: 250,
    costCents: 90,
    stockQuantity: 45,
    lowStockThreshold: 15,
    available: true
  },
  {
    id: "prod-11",
    name: "Chocolate Pocky Sticks",
    category: "snack",
    priceCents: 300,
    costCents: 110,
    stockQuantity: 4, // Low stock alert!
    lowStockThreshold: 10,
    available: true
  },

  // Merch
  {
    id: "prod-12",
    name: "Fifolex XL RGB Speed Mousepad",
    category: "merch",
    priceCents: 2999,
    costCents: 1100,
    stockQuantity: 12,
    lowStockThreshold: 4,
    available: true
  }
];

export const initialOrders: Order[] = [
  {
    id: "ord-01",
    orderNumber: "ORD-1081",
    sessionId: "sess-01",
    stationName: "PC-01",
    customerName: "Marcus Vance",
    items: [
      { productId: "prod-01", productName: "Red Bull Energy Drink (250ml)", quantity: 1, unitPriceCents: 350 },
      { productId: "prod-07", productName: "Crispy Truffle Fries", quantity: 1, unitPriceCents: 650 }
    ],
    status: "served",
    totalCents: 1000,
    paid: false,
    createdAt: minutesAgo(40)
  },
  {
    id: "ord-02",
    orderNumber: "ORD-1082",
    sessionId: "sess-04",
    stationName: "PS5-VIP-01",
    customerName: "Jaylen Brooks",
    items: [
      { productId: "prod-02", productName: "Monster Energy Ultra White (500ml)", quantity: 2, unitPriceCents: 400 },
      { productId: "prod-06", productName: "Loaded Cyber Nachos", quantity: 1, unitPriceCents: 850 }
    ],
    status: "preparing",
    totalCents: 1650,
    paid: false,
    createdAt: minutesAgo(15)
  },
  {
    id: "ord-03",
    orderNumber: "ORD-1083",
    stationName: "Bar Counter",
    customerName: "Walk-in Guest",
    items: [
      { productId: "prod-03", productName: "Iced Caramel Macchiato", quantity: 1, unitPriceCents: 450 }
    ],
    status: "new",
    totalCents: 450,
    paid: true,
    createdAt: minutesAgo(5)
  }
];

export const initialIssues: MaintenanceIssue[] = [
  {
    id: "iss-01",
    stationId: "st-pc-08",
    stationName: "PC-08",
    severity: "high",
    description: "GPU fan bearing rattle detected during benchmarks. High thermal throttling risk.",
    reportedBy: "Leo Chen (Floor Staff)",
    reportedAt: minutesAgo(320),
    status: "investigating",
    resolutionNotes: "Ordered replacement Noctua GPU bracket fan. Expected tomorrow."
  },
  {
    id: "iss-02",
    stationId: "st-vr-02",
    stationName: "VR-02",
    severity: "low",
    description: "Left controller strap slightly frayed. Still safe, scheduled for replacement.",
    reportedBy: "Leo Chen (Floor Staff)",
    reportedAt: minutesAgo(1440),
    status: "scheduled",
    resolutionNotes: "Replacement strap pack received in stock room."
  }
];

export const initialStaffUsers: StaffUser[] = [
  { id: "staff-owner", name: "Sarah Connor", email: "sarah@fifolex.gg", role: "owner" },
  { id: "staff-manager", name: "David Miller", email: "david@fifolex.gg", role: "manager", activeShiftId: "shift-01" },
  { id: "staff-cashier", name: "Elena Rostova", email: "elena@fifolex.gg", role: "cashier", activeShiftId: "shift-02" },
  { id: "staff-floor", name: "Leo Chen", email: "leo@fifolex.gg", role: "floor_staff", activeShiftId: "shift-03" }
];

export const initialAuditLogs: AuditEvent[] = [
  {
    id: "aud-01",
    timestamp: minutesAgo(130),
    staffName: "David Miller",
    role: "manager",
    action: "SESSION_START",
    targetType: "session",
    targetId: "sess-03",
    details: "Started 120-min session on PC-10 for Dmitri Volkov"
  },
  {
    id: "aud-02",
    timestamp: minutesAgo(75),
    staffName: "Elena Rostova",
    role: "cashier",
    action: "SESSION_START",
    targetType: "session",
    targetId: "sess-01",
    details: "Started 120-min session on PC-01 for Marcus Vance"
  },
  {
    id: "aud-03",
    timestamp: minutesAgo(50),
    staffName: "Elena Rostova",
    role: "cashier",
    action: "DISCOUNT_APPLIED",
    targetType: "session",
    targetId: "sess-02",
    details: "Applied 10% Silver tier discount ($0.60) on Chloe Zhang session"
  },
  {
    id: "aud-04",
    timestamp: minutesAgo(35),
    staffName: "Leo Chen",
    role: "floor_staff",
    action: "STATION_MAINTENANCE",
    targetType: "station",
    targetId: "st-pc-08",
    details: "Flagged PC-08 as Maintenance: GPU Fan Rattle"
  },
  {
    id: "aud-05",
    timestamp: minutesAgo(20),
    staffName: "Elena Rostova",
    role: "cashier",
    action: "ORDER_CREATED",
    targetType: "inventory",
    targetId: "ord-02",
    details: "Order ORD-1082 (Loaded Cyber Nachos + 2x Monster) created for PS5-VIP-01"
  }
];
