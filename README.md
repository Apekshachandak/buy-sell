# Trove — Second-Hand Marketplace

> Find it. Buy it. Pass it on. A modern, community-driven platform for buying and selling pre-loved items — built for real people, not corporations.

---

## 🌐 Live Demo

**[https://buy-sell-drab.vercel.app](https://buy-sell-drab.vercel.app)**

> Full-stack Next.js app — not just a frontend. Includes real auth, MongoDB database, image uploads, real-time messaging, and a complete offer/negotiation system.

---

## Why Trove?

Existing platforms like OLX or Facebook Marketplace are cluttered, ad-heavy, and lack structured communication between buyers and sellers. Trove fixes this with:

- **Structured price negotiation** — no more awkward "is this available?" DMs. Buyers can make counter-offers, sellers can respond — all in one clean UI.
- **Contact reveal only on deal** — phone/email is shared only after both parties agree on a price, protecting privacy.
- **Purchase-gated reviews** — you can only rate a seller after actually buying from them, preventing fake reviews.
- **ISO (I'm Looking For) board** — buyers post what they want, sellers find them. Reverses the traditional model.
- **Price watch** — get notified automatically if a watched listing drops in price.

---

## ✨ Features

### 🔐 Auth & Accounts
- JWT-based authentication (httpOnly cookies — secure by default)
- Signup → lands on Browse so new users immediately discover listings
- Login error distinguishes "wrong password" from "account not found" — shows **Create an Account** CTA if email doesn't exist

### 🛒 Browse & Discovery
- Search by keyword + filter by 15 categories + sort by price/date/popularity
- Infinite pagination
- Sellers never see their own listings in Browse (why would they buy their own items?)

### 📦 Listings
- Multi-image upload via Cloudinary
- Smart listing templates per category (pre-filled fields for electronics, furniture, etc.)
- View count tracking per listing
- Price watch — authenticated users can subscribe to price drops
- Listing status: Active / Sold

### 🤝 Make an Offer — Negotiation System
> The core differentiator. Most marketplaces have zero negotiation structure.

| Flow | Description |
|---|---|
| **Accept Listed Price** | Buyer agrees to the asking price instantly — deal is done |
| **Make Offer** | Buyer proposes a lower price |
| **Seller: Accept** | Deal confirmed at offered price |
| **Seller: Decline** | Buyer is notified; listing stays active so they can re-offer |
| **Seller: Counter** | Seller proposes a middle ground |
| **Buyer: Accept Counter** | Final deal at counter price |
| **Buyer: Decline Counter** | Offer form resets — buyer can try again |

All state transitions send **in-app notifications** to the other party automatically.

### 📞 Contact Reveal on Deal
- Once a deal is agreed, both buyer and seller see each other's **email and phone number**
- Privacy-first: contact details are hidden until a price is locked in
- Removes the awkward "DM me for number" flow

### ⭐ Reviews — Purchase Gated
- Buyers can review sellers **only after completing a purchase** (accepted offer or buy-now)
- API enforces this server-side — not just a UI toggle
- Prevents fake/spam reviews from people who never transacted

### 💬 Messaging
- Per-listing inquiry threads between buyer and seller
- Unread message badge on dashboard Messages tab
- Thread labelled by the other person's name

### 🔔 Notifications
- Real-time in-app notifications for: new offers, offer accepted/declined/countered, price drops, ISO matches
- Unread count badge on bell icon in navbar
- Click notification → goes directly to relevant listing

### 📊 Dashboard
| Tab | What it shows |
|---|---|
| My Listings | All your active/sold listings with view/save/watch stats |
| Saved | Listings you hearted |
| Messages | All inquiry threads with unread badge |
| Notifications | All activity alerts |
| **History** | **Items you bought (with savings shown) + Items you sold (with buyer info)** |

### 🔍 ISO Board (I'm Looking For)
- Buyers post requests for items they want
- Sellers can browse ISOs and message matching buyers directly
- Auto-matches ISOs to new listings and sends notifications

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (httpOnly cookies) |
| Image Storage | Cloudinary |
| Styling | Vanilla CSS (custom design system) |
| Deployment | Vercel |

---

## 🚀 Run Locally

```bash
git clone https://github.com/Apekshachandak/buy-sell.git
cd buy-sell
npm install
```

Create `.env.local`:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
app/
  api/           ← All API routes (auth, listings, offers, reviews, history...)
  auth/          ← Login & Signup pages
  browse/        ← Marketplace browse with search/filter
  dashboard/     ← User dashboard (listings, messages, history)
  listings/      ← Listing detail + create + edit
  iso/           ← ISO board
components/      ← Navbar, ListingCard, StarRating, SmartTemplate
models/          ← Mongoose schemas (User, Listing, Offer, Review, Notification...)
lib/             ← DB connection, auth helpers, Cloudinary config
```

---

*Built with ❤️ — because good stuff deserves a second life.*
