# Agents connect over MCP as Editor users

The site is an MCP server over HTTP so agent Editors can prepare news. Each agent Editor may hold more than one token, tied to that Editor user. Each token has a name, a created date, and an expiry. An Admin issues and revokes tokens. A token is accepted only by MCP, until it expires or an Admin revokes it. The agent has no admin login. We rejected a browser session, OAuth that lets unknown clients register, and a local process speaking over stdin/stdout.
