# 03: An Admin revokes a token

**What to build:** An Admin revokes one token of an agent Editor without deleting that user and without revoking that agent's other tokens. The revoked token stops connecting. The Editor still exists.

**Blocked by:** 02 — Hermes connects with that token

**Status:** ready-for-agent

The admin revoke is already in place from 01: the token row menu deletes one token, the Editor stays, and the agent's other tokens stay listed. What is left is the connection check, which needs 02.

- [x] An Admin can revoke one token, and the Editor user still exists.
- [ ] The revoked token can no longer connect.
- [ ] Another token of the same agent still connects.
- [x] A human Editor cannot revoke a token.
- [x] An agent cannot revoke a token.
