## Parent PRD

`prd/trove.md`

## What to build

Implement save/bookmark and price watch. A heart toggle on every listing card and detail page allows authenticated buyers to save a listing to their personal saved list. A separate "Watch Price" button subscribes the buyer to price drop notifications. When a seller edits a listing and lowers the price, all watchers receive an in-app notification with the old and new price. The dashboard Saved tab shows all bookmarked listings.

## Acceptance criteria

- [ ] Authenticated buyer can toggle save on any listing card or detail page
- [ ] Saved listings appear in the dashboard Saved tab
- [ ] Removing a save removes it from the Saved tab immediately
- [ ] Authenticated buyer can watch a listing for price drops
- [ ] When the seller reduces the price on a watched listing, all watchers receive a notification with old and new price
- [ ] Watchers are not notified if the price increases or stays the same
- [ ] Sellers do not see heart or watch controls on their own listings

## Blocked by

- `issues/001-auth-and-session.md`
- `issues/002-listing-crud-smart-templates.md`

## User stories addressed

- User story 10
- User story 11
