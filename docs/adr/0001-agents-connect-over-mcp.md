# Agents connect over MCP as Editor users

The site is an MCP server over HTTP so agent Editors can prepare news. Each agent has its own long-lived token, tied to that Editor user. An Admin issues, revokes, and replaces the token. The token is accepted only by MCP. The agent has no admin login. We rejected a browser session, OAuth that lets unknown clients register, and a local process speaking over stdin/stdout.
