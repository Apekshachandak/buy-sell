# Brainstorming: Technical Architecture Decisions

These are the technical decisions I worked through before and during implementation. Most of them had tradeoffs I had to be deliberate about.

---

**Why Next.js with the App Router specifically?**

Next.js App Router lets me write both the frontend and the API routes in the same codebase without setting up a separate Express server. For a project of this scope, that's a significant simplicity win — I'm not managing two repos, two deployment configs, or two sets of environment variables. The App Router also gives me route-based code splitting and server components out of the box, though for this project most pages are client components because of the interactivity requirements. The main constraint is that any page using `useSearchParams` needs to be wrapped in a Suspense boundary for the production build — I ran into this on deployment and it's a minor but real gotcha.

---

**Why MongoDB and Mongoose instead of a relational database?**

The data model here has a lot of polymorphic, loosely-structured content — listing template data varies by category, notification messages are free text, user bios and profile fields are optional. A document database maps more naturally to this than a relational schema. Mongoose gives me schema validation on top of MongoDB, so I still get type safety and required field enforcement without the rigidity of SQL migrations every time a field changes. The main tradeoff is that joins (populates in Mongoose) are slower than SQL joins — but at the scale of a demo or small deployment, this doesn't matter.

---

**Why JWT stored in httpOnly cookies instead of localStorage?**

localStorage is accessible from JavaScript, which makes it vulnerable to XSS attacks. An httpOnly cookie cannot be read by JavaScript at all — it's only sent by the browser automatically with each request. This is a meaningfully better security posture, and it's not significantly harder to implement. The cookie is also set with `secure: true` in production and `sameSite: lax`, which provides CSRF protection for most attack vectors. The token expiry is set to 7 days, which balances session length against the risk of stolen tokens.

---

**Why Cloudinary for image storage instead of storing images directly in MongoDB or on disk?**

MongoDB is not a file store — storing binary image data in documents is wasteful and slow. Storing files on disk doesn't work with serverless deployment because Vercel's filesystem is ephemeral. Cloudinary gives me a persistent CDN-backed image store with a free tier that handles the upload, compression, and delivery. The upload flow is: the browser sends the image directly to Cloudinary, gets back a URL, and that URL is stored in the listing document in MongoDB. The server never handles the binary data at all, which keeps the API route fast.

---

**How do in-app notifications work, and why not WebSockets?**

Notifications are polled — the frontend fetches `/api/notifications` on page load and on a short interval on pages where real-time feedback matters. This is simpler to implement and sufficient for the use case. WebSockets would give true real-time push, but they require a persistent server connection, which doesn't work cleanly with Vercel's serverless architecture and would add significant complexity to the implementation. For a marketplace where offers and messages are not instant-response scenarios (unlike chat apps), polling every 30 seconds is fine in practice.

---

**How does ISO matching work technically?**

When a new listing is created, the server queries all active ISO posts. For each ISO, it checks whether the ISO's category matches the listing's category, and whether any keyword from the ISO's description appears in the listing title (case-insensitive). If there's a match, a notification is created for the ISO poster. This is O(n) over the number of ISO posts, which is fine at small scale. It runs synchronously as part of the listing creation request, so there's no background job needed. A more sophisticated system would use text embeddings or a search index for semantic matching, but that introduces cold-start problems and dependency on an ML service that's overkill for this scope.

---

**How is the offer system structured in the database to prevent conflicts?**

Each offer document stores `listingId`, `buyerId`, `sellerId`, `amount`, `status`, and `counterAmount`. The key constraint is that there is at most one offer per `(listingId, buyerId)` pair — enforced via a `findOneAndUpdate` with `upsert: true` rather than `insertOne`. When a buyer re-offers after a decline, it overwrites the previous offer record rather than creating a new one. This means the offer history is not preserved across re-offers, which is a deliberate simplification — storing full offer history would require a different data model and adds complexity without clear benefit for this use case.

---

**Why does `boughtBy` live on the Listing document?**

The `boughtBy` field on a listing tracks who the confirmed buyer was. This is used for two things: gating buyer reviews (you can only review if `listing.boughtBy === you`) and populating the seller's sold history. An alternative would be to derive this from the accepted offer, but that requires an extra query every time you need to answer "who bought this." Denormalizing it onto the listing is a standard tradeoff in document databases — you trade write complexity (update the listing when an offer is accepted) for read simplicity (it's right there on the document).

---

**Why is middleware-based route protection implemented at the Next.js middleware level rather than inside each page?**

Putting auth checks inside each individual page component would work, but it means every protected page has to repeat the same fetch-and-redirect logic, and there's a brief moment where the page renders before the redirect happens (a flash of protected content). Next.js middleware runs on the server before the response is sent, so the redirect is immediate and clean. The middleware reads the JWT from the cookie, verifies it, and redirects to login if it's missing or invalid — without any of that logic leaking into the page components themselves.
