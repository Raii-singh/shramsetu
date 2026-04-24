# ShramSetu - Empowering India's Skilled Workforce 🛠️

Organizing and empowering India's vast unorganized skilled workforce. Creating sustainable livelihoods, promoting fair economics, and preserving cultural heritage.

> **Identity Layer + Marketplace + Financial Infrastructure** for India's 380M+ informal workers.

ShramSetu is a service marketplace (like Urban Company) that connects verified blue/grey-collar professionals with customers for home services — with fair pricing, UPI payments, and financial inclusion.

---

## 🌟 Mission

- **Verified Worker Profiles** to build client trust  
- **Standardized, Transparent Pricing** eliminating exploitation  
- **Digital Payments via UPI** for convenience and security  
- **Ratings & Reviews** for quality assurance  
- **Integrated Welfare Onboarding** connecting workers to government benefits  

---

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose

### 1. Database (MySQL in Docker)

```bash
docker-compose up -d
# This starts MySQL and automatically initializes the schema and seed data.
```

### 2. Backend (Express + TypeScript)

```bash
cd backend
npm install
npm run dev
# → http://localhost:5000
```

### 3. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

---

## Demo Mode

The frontend works **without the backend** using built-in mock data.

**Demo credentials (when backend is running):**
- Email: `rahul@demo.com` | Password: `password` (Customer)
- Email: `manoj@demo.com` | Password: `password` (Worker)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MySQL (raw SQL with mysql2/promise) |
| Auth | JWT (7-day expiry) |
| Payments | Razorpay (test mode) |

---

## Features (MVP)

- ✅ Customer & Worker registration/login
- ✅ Service marketplace with 16+ categories
- ✅ Worker profiles with skills, ratings, pricing
- ✅ Location + service-based search
- ✅ Multi-step booking flow
- ✅ Razorpay payment integration (test mode)
- ✅ Customer & Worker dashboards
- ✅ Accept/decline/complete booking flow
- ✅ Reviews & ratings system
- ✅ Seed data with realistic Indian workers

---

## Project Structure

```
ShramSetu/
├── frontend/          # Next.js App
├── backend/           # Express REST API
├── database/          # schema.sql + seed.sql
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login |
| GET | `/workers` | List/search workers |
| GET | `/workers/:id` | Worker profile |
| POST | `/bookings` | Create booking |
| GET | `/bookings` | My bookings |
| PATCH | `/bookings/:id/status` | Update booking status |
| POST | `/payments/create-order` | Razorpay order |
| POST | `/payments/verify` | Verify payment |
| POST | `/reviews` | Submit review |

---

Built with ❤️ for India's workforce.
