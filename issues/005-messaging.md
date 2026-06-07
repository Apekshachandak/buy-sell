## Parent PRD

`prd/trove.md`

## What to build

Implement per-listing message threads. A buyer initiates a thread from the listing detail page by sending a message. The seller can reply from the listing page or from the dashboard Messages tab. Each thread is scoped to a single listing and a single buyer-seller pair. The Messages tab shows an unread indicator for threads where the other party sent the last message.

## Acceptance criteria

- [ ] Buyer can send a message from the listing detail page; a thread is created
- [ ] Seller sees the thread in the dashboard Messages tab
- [ ] Seller can reply; the reply is visible to the buyer on the listing page and in their dashboard
- [ ] Message attribution is correct: "You" for the sender, other party's name for the recipient
- [ ] The Messages tab shows a count badge for threads where the other party sent the last message
- [ ] Multiple threads on the same listing (from different buyers) are displayed separately for the seller

## Blocked by

- `issues/001-auth-and-session.md`
- `issues/002-listing-crud-smart-templates.md`

## User stories addressed

- User story 14
- User story 15
