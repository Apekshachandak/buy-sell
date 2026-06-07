# Brainstorming: Problem, Users, and Scope

These are the questions I worked through before writing a single line of code. The goal was to make sure I actually understood the problem space and wasn't just building features for the sake of it.

---

**What is the core problem this project solves?**

The honest answer is that buying and selling second-hand stuff between people is messier than it needs to be. On existing platforms, a buyer sends "is this available?" and then communication happens in an unstructured chat where pricing, intent, and trust are all mixed together. There's no standard format for negotiation, no accountability system, and no record of what actually happened. I wanted to build something where the interaction has more structure — you can make an offer, the seller can counter, the deal gets confirmed — instead of everything being a free-form conversation.

---

**Who is the primary user, and are buyer and seller the same person?**

Yes, the same person is often both. Someone sells their old laptop and uses that money to buy a second-hand book. So the design can't treat buyers and sellers as completely different personas — it needs to work well for the same person switching between both roles depending on the listing. That shaped a lot of decisions, like having a single dashboard that shows both what you're selling and what you've saved.

---

**Why not just use OLX or Facebook Marketplace?**

I thought about this seriously because the instinct is always "this already exists." The gap I identified is that those platforms are essentially classified ad boards with a messaging layer bolted on. The negotiation, contact exchange, and post-sale accountability are all handled informally through chat. There's no structure. Trove's offer system, contact reveal on deal confirmation, and purchase-gated reviews are things those platforms genuinely don't have. The goal wasn't to replace them at scale — it was to explore whether a more structured interaction model makes the experience better.

---

**What does success look like for this project in its current scope?**

Success is being able to demo a complete end-to-end transaction: a user lists an item, another user finds it through browse or ISO, makes an offer, negotiates, the deal is confirmed, contact details are exchanged, and both parties can leave a record of the transaction. If all of that works without manual workarounds or placeholder UIs, the project has achieved what it set out to do.

---

**Who initiates first contact — the buyer or the seller?**

The buyer always initiates. A seller lists an item and waits. This is the natural model for marketplaces and it simplifies the data model significantly — every conversation thread is associated with a specific listing and starts from the buyer's side. The seller responds through the same thread. This also meant I could build the ISO board as a complementary reversal of that flow, where buyers post demand and sellers come to them.

---

**How does trust work when there's no payment processing or identity verification?**

Trust in Trove is built through seller ratings. After a transaction is confirmed — either through an accepted offer or buy-now — the buyer can leave a star rating and comment. The rating shows on the seller's public profile. The key design decision was gating this at the server level, not just the UI: the review API checks whether the requesting user actually has an accepted offer for that listing before allowing a submission. This means ratings reflect real transactions, not just familiarity or grudges.

---

**Is this local or national? Does location matter?**

For this version, there's no location filtering or map view. The scope is intentionally limited to demonstrating the transactional flow cleanly. In a real product, location filtering would be critical — you can't pick up a sofa from someone three cities away. But adding geolocation adds complexity (user location storage, distance queries, privacy considerations) that would have taken the project away from the more interesting parts of the problem. It's explicitly out of scope.

---

**What happens if a deal falls through after contact is exchanged?**

Once contact is shared, Trove has done its job. The in-person or out-of-platform part of the transaction is outside the system's control. The seller can still mark the listing as sold, and the buyer can leave a review based on the overall experience. If the deal genuinely doesn't close, the offer can be declined and the listing stays active for other buyers. Trove doesn't try to enforce real-world behavior — it just structures the digital handshake cleanly.
