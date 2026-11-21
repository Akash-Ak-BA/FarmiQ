# FarmiQ — Smart Farming Assistant 🌾

**FarmiQ** is a multilingual, mobile-first Progressive Web App (PWA) built for Indian farmers to digitize and simplify their daily farming operations.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🌱 **My Crops** | Live MySQL crop tracking — sowing date, expected harvest, growth stages, 5-step task schedule auto-generated |
| 📋 **Daily Log** | Log farming activities (watering, fertilizer, pesticide) with auto-sync when tasks are completed |
| 🔬 **Crop Check** | Upload or capture a photo of a damaged leaf → AI analysis (dynamic per image) → Natural & Chemical remedies with CIBRC safety advisory |
| 🤖 **FarmiQ Chatbot** | Agricultural Q&A: harvest countdowns, task scheduling (always future dates), crop health Q&A — in Tamil, Telugu, English |
| 🌤️ **Weather Forecast** | Real Open-Meteo weather for your district updated every 1 hour with 5-day forecast and spraying advisories |
| 🏪 **Marketplace** | Direct farmer-to-buyer produce listings within 100 km radius — 0% commission, phone number privacy |
| 📦 **Inventory** | Track seeds, fertilizer, pesticides; photo verification required when "Used" |
| 💰 **Daily Spend Tracking** | Total spend broken down per crop (Paddy / Tomato / Groundnut) for cost analysis |
| 🔔 **Notifications** | Task reminders scoped by crop and date |
| 🌐 **3 Languages** | English, தமிழ் (Tamil), తెలుగు (Telugu) — 100% translated UI |
| 🌙 **Dark / Light Mode** | Full theme support |
| 🔐 **Secure Auth** | bcrypt passwords, SHA-256 session tokens in HTTP-only cookies, 1-year stay signed in |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| **Database** | MySQL 8.4 (local) / TiDB Cloud (production) via Prisma ORM |
| **Auth** | bcrypt + SHA-256 session tokens, HTTP-only secure cookies |
| **Weather API** | Open-Meteo (free, no API key needed) |
| **PWA** | Offline-ready Progressive Web App |
| **i18n** | Custom LanguageContext — Tamil, Telugu, English |
| **Privacy** | Row-Level Privacy: every query scoped by `user_id` |

---

## 📱 All 15 Screens

1. Sign In (Phone + Password)
2. Create Account (Name, Phone, District, Language)
3. Home (Dynamic farmer greeting, real date, avatar, notifications)
4. Notifications
5. My Crops (Live MySQL crop list with stage progress)
6. Crop Detail & Task Schedule (Paddy / Tomato / Groundnut — 5 tasks each)
7. Crop Check (Photo upload + AI analysis + CIBRC safety advisory)
8. FarmiQ Chatbot (Harvest Q&A, smart task scheduling)
9. Weather Forecast (Real Open-Meteo + IMD advisory)
10. Market Prices
11. Inventory (Add item, Use with photo verification)
12. Marketplace (100 km radius buyer-seller direct)
13. Sell Product
14. Daily Log (Activity log + Total Spend by crop)
15. Settings & Profile (Photo, language, theme, Privacy Policy, App version, Logout)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MySQL 8+ (local) or TiDB Cloud connection string
- npm

### 1. Clone the repository
```bash
git clone https://github.com/Akash-Ak-BA/Farmiq.git
cd Farmiq
npm install
```

### 2. Create `.env.local`
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@127.0.0.1:3306/farmiq"
```

### 3. Set up the MySQL database
```bash
mysql -u root -p < Database/farmiq_schema.sql
```

### 4. Generate Prisma client
```bash
npx prisma generate
```

### 5. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Security Architecture

- **Passwords**: bcrypt with salt rounds = 10 (never stored in plain text)
- **Sessions**: Cryptographically random 256-bit tokens, hashed with SHA-256, stored in `sessions` table, HTTP-only secure cookies, 1-year expiry
- **Row-Level Privacy**: Every database query uses `scopeToUser(userId)` — no cross-user data leakage possible
- **Input Validation**: All API routes validate and sanitize input before database writes
- **CORS**: Next.js default same-origin policy
- **Phone Privacy**: Phone numbers hidden in marketplace by default; only shown if farmer opts in

---

## ⚖️ Regulatory Compliance

| Standard | Status |
|---|---|
| Digital Personal Data Protection (DPDP) Act, 2023 | ✅ Compliant |
| ICAR (Indian Council of Agricultural Research) advisories | ✅ Cited |
| CIBRC (Central Insecticides Board & Registration Committee) | ✅ Safety notices shown |
| Ministry of Agriculture & Farmers Welfare (MoA&FW) | ✅ Aligned |
| IT Act 2000 / IT Rules 2021 | ✅ Grievance officer listed |

---

## 📄 Legal

- [Privacy Policy](PRIVACY_POLICY.md)
- [Terms of Use](TERMS_OF_USE.md)
- [Agricultural Disclaimer](AGRICULTURAL_DISCLAIMER.md)

---

## 👨‍💻 Developer

- **Developer**: Akash (Akash-Ak-BA)
- **Contact**: privacy@farmiq.app
- **Version**: v1.0.0 (Build 2026.11-PROD)
- **License**: Proprietary — All Rights Reserved

---

> *FarmiQ is built with ❤️ for the farmers of Tamil Nadu, Andhra Pradesh, and Telangana.*
