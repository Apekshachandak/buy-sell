# Brainstorming: Feature Design Decisions

These are the questions I kept coming back to while designing the features. For most of them, there was an obvious option and a less obvious one — I tried to think through why I was picking one over the other.

---

**Why build a formal offer system instead of just a messaging thread for negotiation?**

Messaging threads work for simple "yes/no" conversations, but negotiation has state. When a buyer proposes a price, that proposal needs to be tracked, responded to, and eventually confirmed or rejected — and both parties need to be notified when any of that happens. If you do all of that through freeform chat, the seller has to remember what was offered, manually type a counter, and the buyer has no clear signal that a deal is confirmed. A formal offer model makes each step explicit: the buyer submits an amount, the seller gets a notification with a clear action (accept/decline/counter), and the outcome updates both sides automatically. It also prevents the confusion of "I said I'd take 500 in a message but then someone else offered 600" — there's a single tracked offer per buyer per listing.

---

**Why does "Accept Listed Price" exist separately from "Make Offer at listed price"?**

These look the same on the surface but they have different intent. Making an offer at the listed price would still require the seller to manually accept it, which creates delay for a buyer who's genuinely willing to pay the asking price. The buy-now button skips the seller confirmation step and confirms the deal instantly — because the seller already stated their price, there's no further negotiation needed. This is a meaningful distinction for sellers who are firm on price and for buyers who don't want to wait. It also mirrors the UX pattern from e-commerce (Buy Now vs. Make Offer) which users already understand.

---

**Why reveal contact details only after a deal is confirmed, and not before?**

The natural instinct is to let buyers and sellers communicate via phone or email directly. But that creates two problems: sellers get harassed with inquiries they don't want, and buyers share their contact with people before there's any commitment on either side. Revealing contact only after a deal is agreed on means both parties have already committed to a transaction before exchanging personal details. It also makes the platform the place where the deal happens, rather than a place where people just find each other and then leave immediately. For the demo, I expose email and phone (if the user has added it to their profile) in a green card that appears specifically in the accepted offer state.

---

**How did you decide what fields go into the smart listing templates?**

I picked the most commonly listed categories on second-hand platforms and thought about what a buyer actually needs to know before making a decision, not what a seller might think to write. For electronics, a buyer needs brand, model, RAM, storage, screen size, and condition — not "works great, barely used." For clothing, size, brand, and fabric matter. For furniture, dimensions and material. The key constraint was keeping the field list short enough that sellers would actually fill it out rather than abandoning the form. Five to eight fields per category feels about right. The answers assemble into a readable paragraph description automatically, so the seller gets a clean output without having to learn how to write a listing.

---

**What is the ISO board actually for, and who uses it?**

ISO stands for "I'm Looking For." The board is for buyers who have a specific item in mind and would rather post their demand than browse through listings hoping to find it. A good example is vintage clothing or specific electronics — if you want a particular vintage denim jacket in size M, browsing is inefficient. You post an ISO, and when a seller lists something that matches by category or keyword, the ISO poster gets notified automatically. The matching is intentionally simple — keyword overlap and category match — because the alternative (semantic similarity with ML) introduces cold-start problems and is overkill for this scope. Simple matching is fast, predictable, and doesn't require any training data.

---

**Why does the messaging system exist alongside the offer system? Aren't they redundant?**

They serve different purposes. The offer system handles price negotiation in a structured format. The messaging thread is for everything else: asking about condition, confirming pickup time, sharing photos, arranging logistics. After a deal is confirmed, the message thread is actually where most of the practical coordination happens — which is why the accepted offer state explicitly says "arrange pickup through the message thread below." The two systems are complementary, not redundant.

---

**How does price watch work, and why would a buyer use it?**

A buyer watches a listing when they're interested but the price is too high. If the seller lowers the price, the watcher gets an in-app notification with the old price and new price. The motivation for sellers to lower prices comes naturally — if a listing has high views but no inquiries (which the performance dashboard shows them), they might reduce the price to convert interest into conversations. Price watch closes that loop. It's also a signal of demand to the seller: a listing with many watchers tells them the interest is there, even if no one has committed yet.

---

**Should sellers be able to see and interact with their own listings in Browse?**

No, and I removed that explicitly. A seller browsing their own listing doesn't help them and clutters their view. More concretely, it creates weird UX edge cases — should they be able to save their own listing? Make an offer on it? The simplest answer is to filter them out client-side, and that's what the Browse page does once the current user's identity is loaded. The same logic applies to the offer card: if the viewer is the seller, the offer panel is replaced with the incoming offers panel.
