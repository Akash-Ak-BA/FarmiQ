export const currentUser = {
  name: "Murugan",
  phone: "98765 43210",
  district: "Madurai",
};

export const sampleNotifications = [
  {
    id: 1,
    title: "Apply fertilizer is due today",
    subtitle: "Paddy, Plot A. 7:00 am",
    isRead: false,
    link: "/crops/detail",
  },
  {
    id: 2,
    title: "Rain expected tomorrow",
    subtitle: "Delay spraying. Open Weather.",
    isRead: false,
    link: "/weather",
  },
  {
    id: 3,
    title: "Urea stock is low",
    subtitle: "2 bags left",
    isRead: false,
    link: "/inventory",
  },
  {
    id: 4,
    title: "Tomato price went up today",
    subtitle: "Open Market prices",
    isRead: true,
    link: "/market-prices",
  },
  {
    id: 5,
    title: "A buyer is interested in your tomatoes",
    subtitle: "Listing: Tomato, 50 kg",
    isRead: true,
    link: "/marketplace",
  },
];

export const sampleCrops = [
  {
    id: 1,
    cropName: "Paddy",
    plotName: "Plot A",
    stage: "Flowering",
    stageIndex: 3,
    stageTotal: 5,
    harvestInDays: 56,
    harvestDate: "12 Jan 2027",
    nextTask: "Apply fertilizer, tomorrow",
  },
  {
    id: 2,
    cropName: "Tomato",
    plotName: "Plot B",
    stage: "Fruiting",
    stageIndex: 4,
    stageTotal: 5,
    harvestInDays: 18,
    harvestDate: "5 Dec 2026",
    nextTask: "Spray neem oil, Fri 20 Nov",
  },
  {
    id: 3,
    cropName: "Groundnut",
    plotName: "Plot C",
    stage: "Just sown",
    stageIndex: 1,
    stageTotal: 5,
    harvestInDays: 98,
    harvestDate: "23 Feb 2027",
    nextTask: "Weeding, Mon 23 Nov",
  },
];

export const sampleCropDetail = {
  cropName: "Paddy",
  plotName: "Plot A",
  stage: "Flowering",
  stageIndex: 3,
  stageTotal: 5,
  predictedHarvest: "12 Jan 2027",
  daysLeft: 56,
  tasks: [
    {
      id: 1,
      title: "Apply fertilizer",
      due: "Tomorrow",
      status: "pending",
    },
    {
      id: 2,
      title: "Check for pests",
      due: "Fri 20 Nov",
      status: "pending",
    },
    {
      id: 3,
      title: "Drain field",
      due: "Mon 23 Nov",
      status: "pending",
    },
  ],
};

export const sampleCropDamage = {
  photoPlaceholder: "Your crop photo",
  detectedIssue: "Leaf blast (fungal)",
  confidence: "medium",
  description: "Brown spots with grey centres on the leaves.",
  naturalTreatment: "neem oil spray, remove infected leaves, avoid over-watering.",
  chemicalAdvice: "ask your agriculture officer for the right product and dose.",
  safetyNote: "Wear gloves and a mask. Check the waiting days before harvest. If unsure, call your agriculture officer.",
};

export const sampleWeather = {
  today: {
    temp: "31°C",
    condition: "Partly cloudy",
    rainChance: "20%",
  },
  next5Days: [
    { day: "Wed 18 Nov", condition: "Heavy rain", temp: "27° / 23°", rain: "80%", icon: "rain" },
    { day: "Thu 19 Nov", condition: "Light rain", temp: "28° / 23°", rain: "50%", icon: "rain" },
    { day: "Fri 20 Nov", condition: "Cloudy", temp: "30° / 24°", rain: "20%", icon: "cloud" },
    { day: "Sat 21 Nov", condition: "Sunny", temp: "32° / 24°", rain: "5%", icon: "sun" },
    { day: "Sun 22 Nov", condition: "Sunny", temp: "33° / 24°", rain: "0%", icon: "sun" },
  ],
};

export const sampleMarketPrices = [
  { crop: "Paddy", price: "₹2,320", change: "Up 1%", isUp: true, myCrop: true },
  { crop: "Tomato", price: "₹1,800", change: "Down 6%", isDown: true, myCrop: true },
  { crop: "Groundnut", price: "₹6,150", change: "Up 2%", isUp: true, myCrop: true },
  { crop: "Onion", price: "₹2,050", change: "No change", neutral: true, myCrop: false },
  { crop: "Banana", price: "₹2,400", change: "Up 3%", isUp: true, myCrop: false },
];

export const sampleInventory = [
  { id: 1, name: "Urea fertilizer", qty: "2 bags", isLow: true },
  { id: 2, name: "Groundnut seed", qty: "3 kg", isLow: true },
  { id: 3, name: "Paddy seed", qty: "10 kg", isLow: false },
  { id: 4, name: "Neem oil", qty: "3 litres", isLow: false },
];

export const sampleMarketListings = [
  {
    id: 1,
    title: "Tomato, 50 kg",
    price: "₹28 per kg",
    seller: "Selvam, 12 km away",
    phone: "9876543210",
  },
  {
    id: 2,
    title: "Groundnut, 200 kg",
    price: "₹62 per kg",
    seller: "Kavitha, 20 km away",
    phone: "9876543211",
  },
  {
    id: 3,
    title: "Banana, 80 kg",
    price: "₹24 per kg",
    seller: "Raman, 8 km away",
    phone: "9876543212",
  },
];
