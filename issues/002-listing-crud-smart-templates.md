## Parent PRD

`prd/trove.md`

## What to build

Implement listing creation, editing, deletion, and mark-as-sold. Listings include multi-image upload via Cloudinary (up to 3 images). Category selection triggers the Smart Listing Template: a set of structured form fields specific to that category (e.g., brand, RAM, storage for Electronics) that assembles a live description preview in real time as the seller types. Template values are stored as `templateData` on the listing document. Sellers can edit and delete their own listings. Sellers can mark listings as sold from the dashboard.

## Acceptance criteria

- [ ] Seller can create a listing with title, price, category, and images
- [ ] Selecting a category renders the correct set of structured fields for that category
- [ ] The live description preview updates in real time as fields are filled
- [ ] Images are uploaded to Cloudinary and URLs stored on the listing document
- [ ] Listing appears in Browse immediately after creation
- [ ] Seller can edit any field of their listing
- [ ] Seller can delete their listing; it is removed from Browse
- [ ] Seller can mark a listing as sold; status changes to 'sold' and it is removed from active Browse
- [ ] View count increments each time the listing detail page is loaded by a non-owner

## Blocked by

- `issues/001-auth-and-session.md`

## User stories addressed

- User story 17
- User story 18
- User story 22
- User story 26
