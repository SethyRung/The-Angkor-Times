# 02: Hermes connects with that token

**What to build:** Hermes connects to `POST /mcp` (`@nuxtjs/mcp-toolkit`) over streamable HTTP with a bearer token an Admin issued, including a local dev server, and receives the tool list. The response is JSON. `GET` returns 405. Callers without a valid agent token are rejected with 403, including a token past its expiry. Another unexpired token of the same agent still connects. The token cannot call the admin API, and a browser session cannot call MCP.

**Blocked by:** None — 01 is done

**Status:** done

- [x] A valid agent token connects and receives the tool list.
- [x] A missing token is rejected.
- [x] An unknown token is rejected.
- [x] An expired token is rejected.
- [x] A second unexpired token for the same agent still connects.
- [x] A human Editor's browser session is rejected by MCP.
- [x] An Admin's browser session is rejected by MCP.
- [x] The agent token is rejected by the admin API.
- [x] The tool list does not offer publish, unpublish, user management, tags, navigation, or Category delete.
