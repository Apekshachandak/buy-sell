## Parent PRD

`prd/trove.md`

## What to build

Implement signup and login with email/password. On successful auth, issue a JWT stored in an httpOnly cookie. Protect all non-public routes via Next.js middleware that reads the cookie and redirects to `/auth/login` if the token is missing or invalid. On login, distinguish between "email not found" and "wrong password" and return a specific actionable error for the former. After signup, redirect to Browse rather than an empty dashboard.

## Acceptance criteria

- [ ] User can sign up with name, email, and password; account is created in the database
- [ ] User can log in with correct credentials and the JWT cookie is set
- [ ] User is redirected to `/auth/login` when attempting to access a protected page without a valid session
- [ ] Login returns "No account found with this email. Please sign up first." when the email does not exist in the database
- [ ] Login page renders a "Create an Account" button inline when the not-found error is returned
- [ ] Signing up redirects to `/browse`, not `/dashboard`
- [ ] Logging out clears the cookie and redirects to home

## Blocked by

None — can start immediately.

## User stories addressed

- User story 27
- User story 28
- User story 29
- User story 31
