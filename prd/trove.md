# PRD: Trove — Peer-to-Peer Second-Hand Marketplace

## Problem Statement

Buying and selling second-hand items between individuals is a high-friction experience on existing platforms. The friction is not in finding listings — it is in everything that happens after. Negotiation is unstructured and happens through freeform chat, leaving both parties uncertain about what was agreed. Contact details are shared prematurely or never at all. There is no record of transactions, no accountability mechanism for sellers, and no way for buyers to signal demand for items that haven't been listed yet. Existing platforms like OLX and Facebook Marketplace are effectively classified ad boards with a messaging layer — they do not structure the actual transaction.

## Solution

Trove is a full-stack marketplace that structures the peer-to-peer transaction end-to-end. The core additions over a basic listing board are:

- A formal offer and negotiation system with explicit accept / decline / counter states
- Contact detail reveal only after both parties confirm a price
- A purchase-gated review system that ties accountability to real transactions
- An ISO (I'm Looking For) board that reverses the discovery flow — buyers post demand, sellers find them
- Smart Listing Templates that guide sellers through structured data entry per category
- Price drop alerts that close the loop between seller pricing decisions and buyer interest

## User Stories

1. As a buyer, I want to browse all active listings with search and category filters, so that I can find items relevant to what I'm looking for.
2. As a buyer, I want to filter listings by price range and sort by recency, price, or popularity, so that I can narrow down options efficiently.
3. As a buyer, I want to view a listing's full details including photos, description, and seller information, so that I can assess whether to engage.
4. As a buyer, I want to accept the listed price instantly, so that I can confirm a deal without waiting for seller approval when I'm happy with the price.
5. As a buyer, I want to make a lower offer on a listing, so that I can negotiate without committing to the full price.
6. As a buyer, I want to be notified when a seller responds to my offer (accept, decline, or counter), so that I know when to take action.
7. As a buyer, I want to accept or decline a seller's counter offer, so that I can respond to their proposed middle ground.
8. As a buyer, I want to see the seller's contact details after a deal is confirmed, so that I can arrange pickup or payment.
9. As a buyer, I want to leave a star rating and comment for a seller after purchasing from them, so that future buyers can make informed decisions.
10. As a buyer, I want to save listings I'm interested in, so that I can revisit them later without searching again.
11. As a buyer, I want to watch a listing for price drops, so that I can be notified if the seller reduces the price.
12. As a buyer, I want to post an ISO request describing what I'm looking for, so that sellers with matching items can find me.
13. As a buyer, I want to receive a notification when a new listing matches my ISO request, so that I don't have to check the board manually.
14. As a buyer, I want to send a message to a seller about a specific listing, so that I can ask questions before making an offer.
15. As a buyer, I want to receive a notification when a seller replies to my message, so that I know the conversation has progressed.
16. As a buyer, I want to see my purchase history with the price I paid and how much I saved, so that I have a record of past transactions.
17. As a seller, I want to create a listing with photos, price, and structured details, so that buyers have the information they need to make a decision.
18. As a seller, I want category-specific form fields to auto-assemble my listing description, so that I don't have to write free-text from scratch.
19. As a seller, I want to see all incoming offers on my listing, so that I can respond to buyer proposals.
20. As a seller, I want to accept, decline, or counter a buyer's offer, so that I can negotiate to a price that works for me.
21. As a seller, I want to see the buyer's contact details after confirming a deal, so that I can coordinate the handoff.
22. As a seller, I want to mark a listing as sold, so that it is removed from active browse and my sold history is updated.
23. As a seller, I want to see how many views, saves, and inquiries each listing has received, so that I can gauge interest and adjust if needed.
24. As a seller, I want a performance hint when a listing has high views but no inquiries, so that I know to reconsider my pricing or description.
25. As a seller, I want to see my selling history with the final sale price and buyer, so that I have a record of past transactions.
26. As a seller, I want to edit and delete my listings, so that I can correct mistakes or remove items I no longer want to sell.
27. As a user, I want to sign up with email and password, so that I can access the marketplace.
28. As a user, I want to log in securely and stay logged in across sessions, so that I don't have to re-authenticate constantly.
29. As a user, I want to receive an actionable error if I try to log in with an email that has no account, so that I know to sign up instead.
30. As a user, I want a public profile page showing my listings and seller rating, so that buyers and sellers can assess my credibility.
31. As a user, I want all protected pages to redirect to login if I am not authenticated, so that my account data is not exposed.
32. As a user, I want an in-app notification feed for all activity, so that I don't miss offer updates, price drops, or messages.

## Implementation Decisions

### Auth
- JWT issued on login and signup, stored in an httpOnly cookie (not localStorage) to prevent XSS
- Middleware intercepts unauthenticated requests to protected routes and redirects to login before the page renders
- JWT payload contains user ID, email, and name; full user data is fetched from the database when needed
- Token expiry: 7 days

### User Model
- Fields: name, email, passwordHash (bcrypt), bio, avatar (Cloudinary URL), phone (optional, revealed on deal), avgRating, ratingCount
- Phone is stored but hidden in all API responses except when a deal is confirmed between two specific parties

### Listing Model
- Fields: title, description, price, category, images (array of Cloudinary URLs), sellerId, status (active/sold), templateData (structured per-category fields), viewCount, boughtBy
- `boughtBy` is set when an offer is accepted or buy-now is used; used to gate buyer reviews and populate seller history
- Text index on title and description for keyword search

### Offer Model
- Fields: listingId, buyerId, sellerId, amount, status (pending/accepted/declined/countered), counterAmount
- Unique constraint: one offer per (listingId, buyerId) pair — upserted, not inserted, on re-offer
- Status transitions trigger notifications to the other party automatically

### Notification Model
- Fields: userId, type (iso_match / price_drop / inquiry / offer / general), message, listingId, read
- Polled by the frontend — no WebSocket required for this scope

### Smart Templates
- Template field definitions live as a static constant per category (not in the database)
- Filled values stored as `templateData` on the listing document
- Description assembled from templateData at render time for display; also stored as the listing's description field for search indexing

### ISO Matching
- Runs synchronously on listing creation: iterate all active ISOs, check category match and keyword overlap on title
- No ML or embedding — simple string matching is predictable and has no cold-start problem

### Contact Reveal
- Offer API populates buyerId and sellerId with name, email, and phone when returning an accepted offer
- The client shows contact details only when `offer.status === 'accepted'` — not a separate API call

### Reviews
- API enforces: reviewer must be `listing.boughtBy` or have an accepted offer for that listingId
- Seller's avgRating and ratingCount are recalculated on every new review submission

### History
- Buyer history: all offers where `buyerId === me AND status === 'accepted'`, populated with listing and seller
- Seller history: all listings where `sellerId === me AND status === 'sold'`, enriched with accepted offer amount

## Testing Decisions

A good test covers external behavior: given this input to the API, what is the response? Tests should not care about how the internals work, only what the endpoint returns.

Modules worth testing:
- Auth routes (signup, login, me): test correct cookie setting, rejection of invalid credentials, and account-not-found error specifically
- Offer state machine: test that invalid transitions (e.g., buyer accepting a non-countered offer) are rejected; test that notifications are created on each transition
- Review gating: test that a review POST is rejected when the user has no accepted offer for that listing
- ISO matching: test that a notification is created for a matching ISO poster when a new listing is created

## Out of Scope

- Real-time notifications (WebSocket or SSE) — polling is sufficient for this scope
- Location-based filtering or map views
- Payment processing
- Identity verification
- Image upload beyond 3 per listing (Cloudinary free tier constraint)
- Full offer history (previous offers are overwritten on re-offer)
- Admin moderation tools

## Further Notes

- ISO keyword matching uses simple string overlap; semantic matching is a natural future extension
- Smart template field definitions are static — adding a new category requires a code change, not a database migration
- The platform currently has no concept of "reserved" listings — accepting an offer does not remove the listing from Browse immediately; only marking as sold does
- Notifications are not deleted — they are marked read; the full history is preserved in the feed
