## Parent PRD

`prd/trove.md`

## What to build

Implement purchase-gated seller reviews and listing performance analytics for sellers. After a confirmed purchase (accepted offer or buy-now), the buyer sees a "Leave a review" form in the accepted offer card. The review API verifies that the requester is `listing.boughtBy` or has an accepted offer for that listing before accepting the submission. The seller's public profile displays average rating and individual reviews. The dashboard shows per-listing view count, save count, and inquiry count, with a soft hint when views are high and inquiries are zero.

## Acceptance criteria

- [ ] Buyer sees a review form in the offer card after deal confirmation
- [ ] Review API rejects submissions from users who do not have a confirmed purchase on that listing
- [ ] Rating (1–5 stars) and optional comment are stored on the review document
- [ ] Seller's avgRating and ratingCount are recalculated after each new review
- [ ] Seller's public profile displays the average rating, review count, and individual reviews
- [ ] Dashboard shows view count, save count, and inquiry count per listing
- [ ] A hint is shown when a listing has more than a threshold of views and zero inquiries

## Blocked by

- `issues/001-auth-and-session.md`
- `issues/004-offer-negotiation.md`

## User stories addressed

- User story 9
- User story 23
- User story 24
- User story 30
