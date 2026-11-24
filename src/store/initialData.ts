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
  tagline: "Premier Esports Arena & Gaming Lounge",
  address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
  phone: "+91 98765 43210",
  email: "contact@fifolex.in",
  operatingHours: {
    open: "10:00",
    close: "03:00"
  },
  timezone: "Asia/Kolkata",
  currencySymbol: "₹",
  currencyCode: "INR",
  taxRatePercent: 18.0,
  gracePeriodMinutes: 10,
  bufferBetweenSessionsMinutes: 10,
  minSessionMinutes: 60,
  ratesPerHourCents: {
    pc: 10000, // ₹100.00/hr
    ps5: 18000, // ₹180.00/hr
    xbox: 15000, // ₹150.00/hr
    vr: 35000, // ₹350.00/hr
    racing: 30000 // ₹300.00/hr
  },
  membershipDiscounts: {
    standard: 0,
    silver: 10, // 10% off
    gold: 20, // 20% off
    vip: 30 // 30% off
  },
  acceptedPaymentMethods: ["UPI (GPay / PhonePe / Paytm / QR)", "Cash", "Debit / Credit Card", "Customer Wallet", "Net Banking"]
};

export const initialStations: Station[] = [
  // PC Arena (Rows of PCs)
  {
    id: "st-pc-01",
    name: "PC-01",
    type: "pc",
    zone: "Main PC Arena",
    status: "occupied",
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 10000,
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
    hourlyRateCents: 18000,
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
    hourlyRateCents: 18000,
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
    hourlyRateCents: 18000,
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
    hourlyRateCents: 18000,
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
    hourlyRateCents: 15000,
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
    hourlyRateCents: 15000,
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
    hourlyRateCents: 30000,
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
    hourlyRateCents: 30000,
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
    hourlyRateCents: 35000,
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
    hourlyRateCents: 35000,
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
    customerName: "Aarav Sharma",
    customerPhone: "+91 98201 12345",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(75),
    durationMinutes: 120,
    expectedEndTime: minutesFromNow(45),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 10000,
    discountCents: 0,
    orderItemIds: ["ord-01"],
    totalChargedCents: 20000,
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-02",
    stationId: "st-pc-02",
    stationName: "PC-02",
    customerId: "cust-02",
    customerName: "Priya Nair",
    customerPhone: "+91 98450 67890",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(50),
    durationMinutes: 60,
    expectedEndTime: minutesFromNow(10), // Ending soon!
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 10000,
    discountCents: 1000, // 10% member discount (₹10.00)
    discountReason: "Silver Member (10%)",
    orderItemIds: [],
    totalChargedCents: 9000, // ₹90.00
    paymentStatus: "paid",
    paymentMethod: "UPI (GPay / PhonePe / Paytm / QR)",
    transferHistory: []
  },
  {
    id: "sess-03",
    stationId: "st-pc-10",
    stationName: "PC-10",
    customerId: "cust-03",
    customerName: "Rohan Mehta",
    customerPhone: "+91 99001 23456",
    staffId: "staff-manager",
    staffName: "David Miller",
    startTime: minutesAgo(130),
    durationMinutes: 120,
    expectedEndTime: minutesAgo(10), // Overdue alert!
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 10000,
    discountCents: 0,
    orderItemIds: [],
    totalChargedCents: 20000, // ₹200.00
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-04",
    stationId: "st-ps5-01",
    stationName: "PS5-VIP-01",
    customerId: "cust-04",
    customerName: "Ananya Patel",
    customerPhone: "+91 97123 45678",
    staffId: "staff-cashier",
    staffName: "Elena Rostova",
    startTime: minutesAgo(30),
    durationMinutes: 180,
    expectedEndTime: minutesFromNow(150),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 18000,
    discountCents: 10800, // 20% Gold Member (₹108.00)
    discountReason: "Gold Member (20%)",
    orderItemIds: ["ord-02"],
    totalChargedCents: 43200, // ₹432.00
    paymentStatus: "unpaid",
    transferHistory: []
  },
  {
    id: "sess-05",
    stationId: "st-rig-01",
    stationName: "RIG-01",
    customerId: "cust-05",
    customerName: "Vikram Singh",
    customerPhone: "+91 96543 21098",
    staffId: "staff-manager",
    staffName: "David Miller",
    startTime: minutesAgo(40),
    durationMinutes: 60,
    expectedEndTime: minutesFromNow(20),
    status: "active",
    totalPausedSeconds: 0,
    rateCentsPerHour: 30000,
    discountCents: 0,
    orderItemIds: [],
    totalChargedCents: 30000, // ₹300.00
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
    customerName: "Rahul Verma",
    customerPhone: "+91 98111 22334",
    customerEmail: "rahul.v@gmail.com",
    date: new Date().toISOString().split('T')[0],
    startTime: "21:00",
    durationMinutes: 120,
    status: "confirmed",
    depositCents: 10000, // ₹100.00
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
    customerName: "Sneha Reddy",
    customerPhone: "+91 98480 33445",
    customerEmail: "sneha.r@gmail.com",
    date: new Date().toISOString().split('T')[0],
    startTime: "21:30",
    durationMinutes: 90,
    status: "confirmed",
    depositCents: 15000, // ₹150.00
    depositPaid: true,
    notes: "Bringing 2 guests for Forza Horizon party",
    createdAt: minutesAgo(180)
  },
  {
    id: "bk-03",
    stationId: "st-vr-01",
    stationName: "VR-01",
    stationType: "vr",
    customerName: "Aditya Kulkarni",
    customerPhone: "+91 98220 55667",
    customerEmail: "aditya.vr@gmail.com",
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
    name: "Aarav Sharma",
    email: "aarav.s@gmail.com",
    phone: "+91 98201 12345",
    membershipTier: "silver",
    walletBalanceCents: 150000, // ₹1,500.00
    loyaltyPoints: 340,
    totalHoursPlayed: 54,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-01",
    notes: "Prefers Logitech mechanical switches and high DPI",
    createdAt: "2026-08-14T10:00:00Z"
  },
  {
    id: "cust-02",
    name: "Priya Nair",
    email: "priya.n@outlook.com",
    phone: "+91 98450 67890",
    membershipTier: "silver",
    walletBalanceCents: 85000, // ₹850.00
    loyaltyPoints: 180,
    totalHoursPlayed: 28,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-02",
    notes: "Regular Wednesday evening player",
    createdAt: "2026-09-02T14:30:00Z"
  },
  {
    id: "cust-03",
    name: "Rohan Mehta",
    email: "rohan.m@proton.me",
    phone: "+91 99001 23456",
    membershipTier: "standard",
    walletBalanceCents: 25000, // ₹250.00
    loyaltyPoints: 80,
    totalHoursPlayed: 14,
    preferredPlatform: "pc",
    preferredStationId: "st-pc-10",
    createdAt: "2026-10-10T18:20:00Z"
  },
  {
    id: "cust-04",
    name: "Ananya Patel",
    email: "ananya.p@gmail.com",
    phone: "+91 97123 45678",
    membershipTier: "gold",
    walletBalanceCents: 320000, // ₹3,200.00
    loyaltyPoints: 950,
    totalHoursPlayed: 110,
    preferredPlatform: "ps5",
    preferredStationId: "st-ps5-01",
    notes: "EA Sports FC competitive player, tournament participant",
    createdAt: "2026-06-01T12:00:00Z"
  },
  {
    id: "cust-05",
    name: "Vikram Singh",
    email: "vikram.racing@gmail.com",
    phone: "+91 96543 21098",
    membershipTier: "vip",
    walletBalanceCents: 500000, // ₹5,000.00
    loyaltyPoints: 2400,
    totalHoursPlayed: 180,
    preferredPlatform: "racing",
    preferredStationId: "st-rig-01",
    notes: "Demands triple-screen calibration check before start",
    createdAt: "2026-04-12T09:15:00Z"
  },
  {
    id: "cust-06",
    name: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 98111 22334",
    membershipTier: "standard",
    walletBalanceCents: 40000, // ₹400.00
    loyaltyPoints: 120,
    totalHoursPlayed: 16,
    preferredPlatform: "pc",
    createdAt: "2026-10-25T16:40:00Z"
  },
  {
    id: "cust-07",
    name: "Sneha Reddy",
    email: "sneha.r@gmail.com",
    phone: "+91 98480 33445",
    membershipTier: "silver",
    walletBalanceCents: 120000, // ₹1,200.00
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
    priceCents: 12500, // ₹125.00
    costCents: 9500,
    stockQuantity: 42,
    lowStockThreshold: 15,
    available: true
  },
  {
    id: "prod-02",
    name: "Monster Energy Ultra White (500ml)",
    category: "beverage",
    priceCents: 12000, // ₹120.00
    costCents: 9000,
    stockQuantity: 36,
    lowStockThreshold: 12,
    available: true
  },
  {
    id: "prod-03",
    name: "Iced Cold Coffee with Ice Cream",
    category: "beverage",
    priceCents: 9000, // ₹90.00
    costCents: 3500,
    stockQuantity: 50,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-04",
    name: "Special Cutting Masala Chai",
    category: "beverage",
    priceCents: 3000, // ₹30.00
    costCents: 1000,
    stockQuantity: 40,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-05",
    name: "Kinley Mineral Water (1L)",
    category: "beverage",
    priceCents: 2000, // ₹20.00
    costCents: 1200,
    stockQuantity: 8, // Low stock alert!
    lowStockThreshold: 10,
    available: true
  },

  // Hot Food & Snacks
  {
    id: "prod-06",
    name: "Cheese Chilli Maggi",
    category: "hot_food",
    priceCents: 7000, // ₹70.00
    costCents: 2500,
    stockQuantity: 30,
    lowStockThreshold: 8,
    available: true
  },
  {
    id: "prod-07",
    name: "Crispy Peri-Peri French Fries",
    category: "hot_food",
    priceCents: 9000, // ₹90.00
    costCents: 3000,
    stockQuantity: 28,
    lowStockThreshold: 10,
    available: true
  },
  {
    id: "prod-08",
    name: "Paneer Tikka Grilled Sandwich",
    category: "hot_food",
    priceCents: 12000, // ₹120.00
    costCents: 4500,
    stockQuantity: 18,
    lowStockThreshold: 6,
    available: true
  },
  {
    id: "prod-09",
    name: "Steamed Chicken Momos (6 pcs)",
    category: "hot_food",
    priceCents: 13000, // ₹130.00
    costCents: 5000,
    stockQuantity: 20,
    lowStockThreshold: 5,
    available: true
  },
  {
    id: "prod-10",
    name: "Kurkure Masala Munch (Large)",
    category: "snack",
    priceCents: 2000, // ₹20.00
    costCents: 1400,
    stockQuantity: 45,
    lowStockThreshold: 15,
    available: true
  },
  {
    id: "prod-11",
    name: "Cadbury Dairy Milk Silk Chocolate",
    category: "snack",
    priceCents: 8000, // ₹80.00
    costCents: 6500,
    stockQuantity: 4, // Low stock alert!
    lowStockThreshold: 10,
    available: true
  },

  // Merch
  {
    id: "prod-12",
    name: "Fifolex XL RGB Speed Gaming Mousepad",
    category: "merch",
    priceCents: 99900, // ₹999.00
    costCents: 45000,
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
    customerName: "Aarav Sharma",
    items: [
      { productId: "prod-01", productName: "Red Bull Energy Drink (250ml)", quantity: 1, unitPriceCents: 12500 },
      { productId: "prod-07", productName: "Crispy Peri-Peri French Fries", quantity: 1, unitPriceCents: 9000 }
    ],
    status: "served",
    totalCents: 21500, // ₹215.00
    paid: false,
    createdAt: minutesAgo(40)
  },
  {
    id: "ord-02",
    orderNumber: "ORD-1082",
    sessionId: "sess-04",
    stationName: "PS5-VIP-01",
    customerName: "Ananya Patel",
    items: [
      { productId: "prod-02", productName: "Monster Energy Ultra White (500ml)", quantity: 2, unitPriceCents: 12000 },
      { productId: "prod-06", productName: "Cheese Chilli Maggi", quantity: 1, unitPriceCents: 7000 }
    ],
    status: "preparing",
    totalCents: 31000, // ₹310.00
    paid: false,
    createdAt: minutesAgo(15)
  },
  {
    id: "ord-03",
    orderNumber: "ORD-1083",
    stationName: "Bar Counter",
    customerName: "Walk-in Guest",
    items: [
      { productId: "prod-03", productName: "Iced Cold Coffee with Ice Cream", quantity: 1, unitPriceCents: 9000 }
    ],
    status: "new",
    totalCents: 9000, // ₹90.00
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
    reportedBy: "Karan Joshi (Floor Staff)",
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
    reportedBy: "Karan Joshi (Floor Staff)",
    reportedAt: minutesAgo(1440),
    status: "scheduled",
    resolutionNotes: "Replacement strap pack received in stock room."
  }
];

export const initialStaffUsers: StaffUser[] = [
  { id: "staff-owner", name: "Rajesh Malhotra", email: "rajesh@fifolex.in", role: "owner" },
  { id: "staff-manager", name: "David Miller", email: "david@fifolex.in", role: "manager", activeShiftId: "shift-01" },
  { id: "staff-cashier", name: "Elena Rostova", email: "elena@fifolex.in", role: "cashier", activeShiftId: "shift-02" },
  { id: "staff-floor", name: "Karan Joshi", email: "karan@fifolex.in", role: "floor_staff", activeShiftId: "shift-03" }
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
    details: "Started 120-min session on PC-10 for Rohan Mehta"
  },
  {
    id: "aud-02",
    timestamp: minutesAgo(75),
    staffName: "Elena Rostova",
    role: "cashier",
    action: "SESSION_START",
    targetType: "session",
    targetId: "sess-01",
    details: "Started 120-min session on PC-01 for Aarav Sharma"
  },
  {
    id: "aud-03",
    timestamp: minutesAgo(50),
    staffName: "Elena Rostova",
    role: "cashier",
    action: "DISCOUNT_APPLIED",
    targetType: "session",
    targetId: "sess-02",
    details: "Applied 10% Silver tier discount (₹10.00) on Priya Nair session"
  },
  {
    id: "aud-04",
    timestamp: minutesAgo(35),
    staffName: "Karan Joshi",
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
    details: "Order ORD-1082 (Cheese Chilli Maggi + 2x Monster) created for PS5-VIP-01"
  }
];
