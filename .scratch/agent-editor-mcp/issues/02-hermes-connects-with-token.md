# 02: Hermes connects with that token

**What to build:** Hermes connects to the site over HTTP with a token an Admin issued, including a local dev server, and sees the tool list. Callers without a valid agent token are rejected, including a token past its expiry. Another unexpired token of the same agent still connects. The token cannot call the admin API, and a browser session cannot call MCP.

**Blocked by:** 01 — An Admin issues an agent token

**Status:** ready-for-agent

- [ ] A valid agent token connects and receives the tool list.
- [ ] A missing token is rejected.
- [ ] An unknown token is rejected.
- [ ] An expired token is rejected.
- [ ] A second unexpired token for the same agent still connects.
- [ ] A human Editor's browser session is rejected by MCP.
- [ ] An Admin's browser session is rejected by MCP.
- [ ] The agent token is rejected by the admin API.
- [ ] The tool list does not offer publish, unpublish, user management, tags, navigation, or Category delete.
