## Parent PRD

`prd/trove.md`

## What to build

Implement the in-app notification feed and the transaction history tab in the dashboard. Notifications cover: new offers, offer accepted, offer declined, counter offer received, counter accepted, counter declined, price drops on watched listings, and ISO matches. Notifications are polled by the frontend — no WebSocket. The History tab in the dashboard shows two sections: Items I Bought (all accepted offers with final price paid and savings vs listed price) and Items I Sold (all sold listings with final sale price and buyer name).

## Acceptance criteria

- [ ] Notification bell in the navbar shows an unread count badge
- [ ] Clicking a notification navigates to the relevant listing and marks the notification read
- [ ] "Mark all as read" clears the unread badge and marks all notifications read
- [ ] Notifications are generated correctly for all offer state transitions
- [ ] Notifications are generated for price drops and ISO matches
- [ ] Dashboard History tab shows "Items I Bought" with final price and savings amount
- [ ] Dashboard History tab shows "Items I Sold" with final sale price and buyer name
- [ ] History entries are sorted by date, most recent first

## Blocked by

- `issues/004-offer-negotiation.md`
- `issues/006-iso-board.md`
- `issues/007-save-and-price-watch.md`

## User stories addressed

- User story 16
- User story 25
- User story 32
