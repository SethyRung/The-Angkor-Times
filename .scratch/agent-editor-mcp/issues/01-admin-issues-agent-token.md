# 01: An Admin issues an agent token

**What to build:** An Admin marks an Editor as an agent from the users screen, without a new role, and issues that Editor named tokens. The account control is Human or Agent. An agent has no password, so the password field stays hidden. An agent may hold more than one token. Each token has a name, a key hint (`atk_...` plus the last four characters), a created date, and an expiry. Issuing a token does not open a secret dialog. The list shows the hint and does not include the raw secret. An Admin copies the real secret from that token's menu; that read is a separate admin request. That agent cannot sign in to the admin. A human Editor's session is unchanged.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] An Admin can mark an Editor as an agent from the users screen (Human or Agent), and the user's role stays Editor. The password field is hidden for an agent.
- [x] An Admin session can issue a token for that agent Editor by giving it a name and an expiry. The response is the key hint, not the raw secret.
- [x] The issued token records a created date and an expiry. Expiry is one of 30 days, 90 days, 180 days, 1 year, or never.
- [x] An Admin can issue a second token for the same agent, and the first token remains.
- [x] A later read lists each token's name, key hint, created date, and expiry, and does not include the raw secret.
- [x] An Admin can copy the real secret from that token's menu. The secret is loaded on that action and is not in the list.
- [x] A human Editor session cannot issue a token.
- [x] An agent session cannot issue a token.
- [x] A token cannot be issued for a human Editor or an Admin.
- [x] The agent Editor cannot sign in to the admin with a password.
- [x] A human Editor can still sign in and use the admin.
- [x] The Vitest e2e suite covers this against the Nuxt app from `bun run dev`.
