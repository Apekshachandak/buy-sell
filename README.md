# Trove — Second-Hand Marketplace

> A modern, lightweight alternative to Craigslist. Find it. Buy it. Pass it on.

---

## Live Demo

- **Frontend**: [your-vercel-url.vercel.app]
- **Demo video**: [your-youtube-link]

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt (httpOnly cookies) |
| Image Upload | Cloudinary |
| Styling | Vanilla CSS with CSS custom properties |
| Deployment | Vercel |

Single monorepo — frontend and API routes in one Next.js project.

---

## Features Built

### Core
- **Auth** — Signup, login, logout with JWT stored in httpOnly cookies
- **Listings CRUD** — Create, edit, delete listings with image upload (up to 3 photos via Cloudinary)
- **Mark as Sold** — Sellers can mark their listings as sold
- **Browse & Discovery** — Full listings page with keyword search, category filter, and price range filter
- **Seller Inquiry** — In-app message thread per listing (buyer initiates, seller replies)
- **User Profile** — Public profile with active listings and seller reviews/ratings
- **Save / Bookmark** — Buyers can save listings to revisit (heart toggle on every card)
- **Seller Ratings** — After marking a listing as sold, a review can be left on the seller

### Novel Add-Ons

#### ISO Board (In Search Of)
Buyers post "Wanted" requests — item, category, max budget. When a new listing is created matching an open Want, the buyer gets an instant in-app notification. Sellers can browse the ISO Board to see what's in demand.

#### Smart Listing Templates
Category-specific structured form fields (Brand, Model, Age, Condition, Includes, etc.) that auto-assemble a formatted description in real time as the seller types. No more blank textarea — every listing looks professional.

#### Price Drop Alerts
Buyers watch a listing. If the seller lowers the price, all watchers get an instant in-app notification with old and new price shown.

#### Listing Performance Dashboard
Sellers see views, saves, and inquiry count per listing. If a listing has many views but zero inquiries, a soft hint appears suggesting to lower the price or add more photos.

---

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)

### Steps

```bash
git clone <repo-url>
cd trove
npm install
```

Fill in `.env.local`:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Visit `/api/seed` once to populate demo data.

---

## Assumptions Made

- Notifications are polled on page load (no WebSocket — sufficient for demo scope)
- ISO matching uses keyword overlap on listing title — reliable, no cold start, no ML required
- Image upload limited to 3 per listing (Cloudinary free tier)
- No real-time chat — inquiry is a persistent message thread per listing
- Price drop alerts notify all watchers whenever the seller lowers the price
