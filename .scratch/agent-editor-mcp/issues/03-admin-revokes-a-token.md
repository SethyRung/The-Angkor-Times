# 03: An Admin revokes a token

**What to build:** An Admin revokes one token of an agent Editor without deleting that user and without revoking that agent's other tokens. The revoked token is rejected by `POST /mcp`. The Editor still exists, and another token of that agent still connects.

**Blocked by:** None — 02 is done

**Status:** done

- [x] An Admin can revoke one token, and the Editor user still exists.
- [x] The revoked token can no longer connect.
- [x] Another token of the same agent still connects.
- [x] A human Editor cannot revoke a token.
- [x] An agent cannot revoke a token.
