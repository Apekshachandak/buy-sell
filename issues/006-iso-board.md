## Parent PRD

`prd/trove.md`

## What to build

Implement the ISO (I'm Looking For) board. Buyers can post a request describing an item they want, with a category and description. When a new listing is created, the server checks all active ISO posts for category and keyword matches. If a match is found, the ISO poster receives an in-app notification with a link to the new listing. ISO posts are displayed publicly and sellers can send a message directly to an ISO poster from the board.

## Acceptance criteria

- [ ] Buyer can create an ISO post with a title, description, and category
- [ ] ISO posts are visible on the ISO board page
- [ ] When a new listing is created, the server checks for matching ISO posts
- [ ] A match is defined as: same category OR a keyword from the ISO description/title appears in the listing title
- [ ] ISO poster receives an in-app notification when a match is found, with a link to the new listing
- [ ] Notification is not sent if the ISO poster is the same user who created the listing
- [ ] Sellers can see ISO posts and initiate contact with the poster

## Blocked by

- `issues/001-auth-and-session.md`
- `issues/002-listing-crud-smart-templates.md`

## User stories addressed

- User story 12
- User story 13
