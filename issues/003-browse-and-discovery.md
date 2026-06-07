## Parent PRD

`prd/trove.md`

## What to build

Implement the Browse page: display all active listings with keyword search, category filter, price range filter, and sort options (newest, price ascending, price descending, most viewed). Results are paginated. Sellers do not see their own listings in Browse. Each listing card shows title, price, primary image, category, and a heart toggle for saving.

## Acceptance criteria

- [ ] Browse page shows all active listings by default
- [ ] Keyword search filters results by title and description
- [ ] Category filter narrows results to a single category
- [ ] Price range filter excludes listings outside the specified min/max
- [ ] Sort by newest, price low-to-high, price high-to-low, and most viewed all work correctly
- [ ] Pagination loads the next page of results without reloading the page
- [ ] Authenticated sellers do not see their own listings in Browse results
- [ ] Unauthenticated users can browse without logging in

## Blocked by

- `issues/002-listing-crud-smart-templates.md`

## User stories addressed

- User story 1
- User story 2
- User story 3
