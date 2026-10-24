# 01: An Admin issues an agent token

**What to build:** An Admin marks an Editor as an agent, without a new role, and issues that Editor named tokens. An agent may hold more than one. Each token has a name, a created date, and an expiry. The secret is shown once and cannot be read back. A later read lists the name, created date, and expiry. That agent cannot sign in to the admin. A human Editor's session is unchanged.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] An Admin can mark an Editor as an agent from the users screen, and the user's role stays Editor.
- [ ] An Admin session can issue a token for that agent Editor by giving it a name and an expiry, and the raw secret is returned only then.
- [ ] The issued token records a created date and an expiry. Expiry is one of 30 days, 90 days, 180 days, 1 year, or never.
- [ ] An Admin can issue a second token for the same agent, and the first token remains.
- [ ] A later read lists each token's name, created date, and expiry, and does not reveal the raw secret.
- [ ] A human Editor session cannot issue a token.
- [ ] An agent session cannot issue a token.
- [ ] A token cannot be issued for a human Editor or an Admin.
- [ ] The agent Editor cannot sign in to the admin with a password.
- [ ] A human Editor can still sign in and use the admin.
- [ ] The Vitest e2e suite covers this against the Nuxt app from `bun run dev`.
