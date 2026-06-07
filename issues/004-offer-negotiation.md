## Parent PRD

`prd/trove.md`

## What to build

Implement the full offer and negotiation system. On the listing detail page, buyers see two actions: Accept Listed Price (buy-now, instantly confirmed) and Make Offer (enter a custom amount). Sellers see an incoming offers panel. The offer state machine supports: pending → accepted / declined / countered, and countered → accepted (by buyer) / declined (by buyer). Every state transition notifies the other party. When a deal is confirmed (accepted or buy-now), `listing.boughtBy` is set to the buyer's ID. Sellers see buyer contact details in the accepted offer card. Buyers see seller contact details in the accepted offer state.

## Acceptance criteria

- [ ] Buyer can accept the listed price; offer is created with status 'accepted' immediately
- [ ] Buyer can submit a custom offer amount; offer is created with status 'pending'
- [ ] Seller sees all pending offers with Accept, Decline, and Counter actions
- [ ] Accepting an offer sets status to 'accepted' and notifies the buyer
- [ ] Declining an offer sets status to 'declined' and notifies the buyer; listing stays active
- [ ] Countering sets status to 'countered' with the counter amount and notifies the buyer
- [ ] Buyer can accept or decline a counter; both transitions notify the seller
- [ ] Declining a counter resets the buyer's offer form to a fresh state (not a dead end)
- [ ] On deal confirmation, seller sees buyer contact (name, email, phone) in the offer card
- [ ] On deal confirmation, buyer sees seller contact (name, email, phone) in the offer card
- [ ] `listing.boughtBy` is set when any offer is accepted

## Blocked by

- `issues/001-auth-and-session.md`
- `issues/002-listing-crud-smart-templates.md`

## User stories addressed

- User story 4
- User story 5
- User story 6
- User story 7
- User story 8
- User story 19
- User story 20
- User story 21
