# Trove — Second-Hand Marketplace

A full-stack marketplace for buying and selling pre-loved items. Built to solve the real friction points in peer-to-peer commerce: unstructured negotiation, no accountability, and zero transaction visibility.

**Live:** [https://buy-sell-drab.vercel.app](https://buy-sell-drab.vercel.app)  
**Stack:** Next.js 15 · MongoDB Atlas · Cloudinary · Vercel

---

## Why Trove

Existing platforms like OLX and Facebook Marketplace are functional but shallow. They treat every interaction as a message thread, leaving pricing, intent, and accountability entirely unstructured.

Trove was designed from the ground up to address this:

- **Negotiation has no standard format** on existing platforms. Buyers send informal messages, sellers ignore them, and deals fall through. Trove introduces a formal offer system where buyers submit prices, sellers respond with accept/decline/counter, and both parties are notified at every step.

- **Contact details are publicly exposed or never shared at the right time.** Trove reveals phone and email only after a price is agreed on — protecting privacy while ensuring the transaction can actually close.

- **Reviews are gamed on most platforms.** Trove enforces server-side verification — a buyer can only rate a seller after a confirmed purchase (accepted offer or buy-now). No fake reviews.

- **Sellers have no visibility into listing performance.** Trove gives sellers per-listing analytics: view count, save count, and inquiry count, with soft hints when a listing has high views but no engagement — so sellers can adjust pricing or description.

- **Buyers have no way to signal demand.** Trove includes an ISO (I'm Looking For) board where buyers post what they want. When a matching listing is created, the buyer is notified instantly — reversing the typical discovery flow.

- **There is no transaction record.** Trove tracks buying and selling history for every user, including final negotiated prices and how much was saved versus the listed price.

---

## Feature Set

### Authentication and Accounts

- Signup and login with email and password
- JWT stored in httpOnly cookies — immune to XSS, no localStorage exposure
- Middleware-protected routes: unauthenticated users are redirected to login
- New users land on Browse immediately after signup, not an empty dashboard
- Login error distinguishes between "account not found" and "wrong password" — if the email does not exist, a Create Account prompt appears inline

---

### Listings

- Create, edit, and delete listings
- Multi-image upload via Cloudinary with live preview (up to 3 images per listing)
- 15 categories supported
- Listings can be marked as sold by the seller
- View count tracked per listing

---

### Smart Listing Templates

Writing a good listing description is the biggest friction point for sellers on any marketplace. Most people either write nothing useful ("selling my laptop, good condition") or spend time figuring out what details buyers actually care about.

Trove solves this with category-specific structured templates. When a seller selects a category, a set of relevant fields appears — for Electronics: brand, model, RAM, storage, screen size, condition; for Clothing: brand, size, color, fabric, condition; for Furniture: material, dimensions, condition; and so on across all 15 categories.

As the seller fills in these fields, the listing description is assembled automatically in real time and displayed as a live preview. The seller sees exactly what buyers will read before publishing. No free-text writing required, no blank description fields, and no inconsistency between listings in the same category.

The template data is also stored structurally alongside the listing, making it available for future filtering by spec (e.g., filter Electronics by RAM or storage size).

---

### Browse and Discovery

- Browse all active listings with keyword search, category filter, price range filter, and sort (newest, price low-to-high, price high-to-low, most viewed)
- Sellers do not see their own listings in Browse — prevents irrelevant results
- Paginated results

---

### Offer and Negotiation System

The core differentiator. Most marketplaces have no structure for price negotiation.

| Action | Description |
|---|---|
| Accept Listed Price | Buyer agrees to the asking price. Deal is confirmed instantly. |
| Make Offer | Buyer proposes a lower price. Seller is notified. |
| Accept | Seller accepts the buyer's offer. Deal confirmed. |
| Decline | Seller declines. Buyer is notified; listing stays active. Buyer can re-offer. |
| Counter | Seller proposes a middle ground price. Buyer is notified. |
| Accept Counter | Buyer agrees to the counter price. Deal confirmed. |
| Decline Counter | Buyer declines. Offer form resets; buyer can make a fresh offer. |

Every state transition triggers an in-app notification to the other party. One active offer per buyer per listing at a time — prevents spam.

---

### Contact Reveal on Confirmed Deal

Once a deal is agreed on (via Accept, Accept Counter, or Accept Listed Price):

- The buyer sees the seller's name, email, and phone number
- The seller sees the buyer's name, email, and phone number

Contact details are not visible before a deal is confirmed. This removes the privacy risk of publicly exposing contact information while ensuring the transaction can actually close.

---

### Seller Inquiry (Messaging)

- Per-listing message thread initiated by the buyer
- Seller can respond from the listing detail page or from the dashboard
- Unread indicator on the Messages tab — shows count of threads where the other party sent the last message
- Thread labelled by the other person's name, not by listing title

---

### Save and Price Watch

- Buyers can save listings to a personal bookmark list
- Buyers can watch a listing for price changes
- If the seller lowers the price, all watchers receive an in-app notification with the old and new price
- Heart toggle on every listing card and detail page

---

### ISO Board (I'm Looking For)

- Buyers post requests for specific items they want
- Sellers can browse ISO posts and message matching buyers directly
- When a new listing is created that matches an existing ISO request (by category or keyword), the ISO poster is notified automatically

---

### Notifications

- In-app notification feed for: new offers, offer accepted, offer declined, counter offers, counter accepted, counter declined, price drops on watched listings, ISO matches
- Unread count badge on the notification bell in the navbar
- Clicking a notification navigates directly to the relevant listing
- Mark individual notifications as read, or mark all as read at once

---

### Seller Rating and Reviews

- After marking a listing as sold, the seller can leave a review for the transaction
- Buyers can rate and review sellers after a confirmed purchase only — enforced at the API level using the accepted offer record
- 1 to 5 star rating with an optional comment
- Seller's average rating and review count are displayed on their public profile

---

### Listing Performance Dashboard

- Each seller listing shows: total views, save count, and inquiry count
- Soft hint displayed when a listing has a high view count but zero inquiries — signals that the price or description may need adjustment
- Gives sellers actionable visibility instead of a passive listing status

---

### Transaction History

- Dashboard History tab shows two sections:
  - **Items Bought:** all listings purchased, with the final price paid and the amount saved compared to the listed price
  - **Items Sold:** all listings sold, with the final sale price, buyer name, and date
- Provides a permanent record of all transactions for both sides

---

### User Profile

- Public profile page showing name, bio, avatar, join date, and average seller rating
- Lists all active and sold listings by the user
- Ratings and reviews from past transactions displayed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Database | MongoDB Atlas with Mongoose |
| Authentication | JWT via httpOnly cookies |
| Image Storage | Cloudinary |
| Styling | Vanilla CSS with a custom design system |
| Deployment | Vercel |

---

## Run Locally

```bash
git clone https://github.com/Apekshachandak/buy-sell.git
cd buy-sell
npm install
```

Create `.env.local` in the project root:

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

## Project Structure

```
app/
  api/           API routes — auth, listings, offers, reviews, history, notifications
  auth/          Login and signup pages
  browse/        Marketplace browse with search, filter, and pagination
  dashboard/     User dashboard — listings, messages, history, notifications
  listings/      Listing detail, create, and edit pages
  iso/           ISO board
components/      Navbar, ListingCard, StarRating, SmartTemplate
models/          Mongoose schemas — User, Listing, Offer, Review, Notification, Inquiry, Saved, Watched, Want
lib/             Database connection, auth helpers, Cloudinary configuration
```
