# Agent Editors prepare news over MCP

**Status:** ready-for-agent

## Problem Statement

Hermes is an agent Editor and needs to prepare news on this site. The admin UI is for human Editors and Admins. Hermes cannot sign in there, and it has no other way to file Pending news, revise another Editor's Pending news, or create the Categories that news needs.

## Solution

The site is an MCP server over HTTP. An Admin issues each agent Editor one or more named tokens tied to that Editor user. Each token has a name, a created date, and an expiry. The agent connects to the running site, including a local dev server, and calls tools with one of those tokens. It can read all news, create and revise Pending news in Markdown, delete Pending news, set a featured image on Pending news, and create or update Categories. Published news, Category deletion, tags, navigation, publishing, and user management stay with humans.

## User Stories

1. As an Admin, I want to mark an Editor as an agent without giving them a new role, so that Hermes can be an Editor alongside human Editors.
2. As an Admin, I want to issue a named token for an agent Editor, so that the agent can connect to the site.
3. As an Admin, I want to see the token only at the moment I issue it, so that the site does not keep a copy that can be read back later.
4. As an Admin, I want an agent Editor to hold more than one token, each with a name, so that I can tell those secrets apart.
5. As an Admin, I want to revoke one token of an agent Editor without deleting that user and without revoking their other tokens, so that a leaked secret stops working and the Editor still exists.
6. As an Admin, I want each token to record when it was created and when it expires, so that I know how long that secret works.
7. As an Admin, I want issuing and revoking tokens to require my admin session, so that Editors and agents cannot mint credentials.
8. As an Admin, I want a token issued only for an agent Editor, so that a human Editor or an Admin does not gain an MCP credential by mistake.
9. As Hermes, I want to connect to the site over HTTP with my token, so that I can prepare news on the running site or a local dev server.
10. As Hermes, I want to learn which tools the site offers, so that I can prepare news without a separate manual.
11. As Hermes, I want a missing token to be rejected, so that anonymous callers cannot prepare news.
12. As Hermes, I want an unknown token to be rejected, so that a guessed secret cannot prepare news.
13. As Hermes, I want a revoked token to be rejected, so that a secret an Admin has cut off cannot prepare news.
14. As Hermes, I want an expired token to be rejected while my other tokens keep working, so that one secret's date does not cut off the rest.
15. As Hermes, I want my token to be rejected by the admin API, so that the token is not a back door into human admin routes.
16. As Hermes, I want no admin login, so that I cannot open the admin UI and bypass the narrower agent rules.
17. As a human Editor, I want my browser session to keep working, so that agent tokens do not change how I edit.
18. As a human Editor, I want to still edit and delete Published news, so that the narrower agent rules do not apply to me.
19. As a human Editor, I want to still delete Categories, so that the narrower agent rules do not apply to me.
20. As a human Editor, I want to still publish and unpublish news, only if I am an Admin, so that publishing stays where it is today.
21. As an Admin, I want to still publish and unpublish news from the admin UI, so that agents never make news public.
22. As Hermes, I want to list Pending and Published news, so that I can see the queue and what is already public.
23. As Hermes, I want each listed piece to show whether it is Pending or Published, its Author, its Category, and its featured image, so that I know what I am allowed to change.
24. As Hermes, I want to read one piece of news in full, so that I can revise it or leave it alone.
25. As Hermes, I want to read Published news without changing it, so that I know what readers already see.
26. As Hermes, I want to read Pending news written by any Editor, so that I can finish a piece a human left overnight.
27. As Hermes, I want to create Pending news, so that an Admin can publish it later.
28. As Hermes, I want news I create to stay Pending, so that it does not become public on its own.
29. As Hermes, I want to be the Author of news I create, so that readers see my name after an Admin publishes it.
30. As Hermes, I want to write the body as Markdown, so that the public page can render the piece I filed.
31. As Hermes, I want to set the title, description, Category, and body when I create news, so that the piece is complete enough to review.
32. As Hermes, I want creation to fail when the title, description, body, or Category is missing, so that I do not file an empty piece.
33. As Hermes, I want to place a new piece in an existing Category, so that I can file it in a section that already exists.
34. As Hermes, I want to revise the title, description, Markdown body, and Category of any Pending news, so that I can finish another Editor's piece.
35. As Hermes, I want the Author to stay the Editor who created the news when I revise it, so that I do not take their name.
36. As Hermes, I want a revision of Published news to be rejected, so that a live piece stays as the Admin left it.
37. As a reader, I want a Published piece to stay unchanged after Hermes tries to revise it, so that the public text does not move without an Admin.
38. As Hermes, I want to delete Pending news, so that I can discard a piece that should not exist.
39. As Hermes, I want to delete Pending news written by any Editor, so that a bad draft does not wait on its Author.
40. As Hermes, I want deletion of Published news to be rejected, so that I cannot remove a piece an Admin has made public.
41. As a reader, I want a Published piece to remain after Hermes tries to delete it, so that live news is not removed by an agent.
42. As Hermes, I want to upload an image and receive a URL, so that I can use a photo the site stores.
43. As Hermes, I want the upload to accept an image up to the site's existing size limit, so that I follow the same constraint as the news editor.
44. As Hermes, I want a non-image upload to be rejected, so that I cannot store other files through the news photo tool.
45. As Hermes, I want to set a featured image on Pending news by that uploaded URL, so that the piece has a cover.
46. As Hermes, I want to set a featured image on Pending news by a URL I already have, so that I can use a photo without uploading it.
47. As Hermes, I want to clear the featured image on Pending news, so that I can remove a cover that should not be there.
48. As Hermes, I want a featured-image change on Published news to be rejected, so that a live cover stays as it is.
49. As Hermes, I want to put an uploaded image URL in the Markdown body of Pending news, so that a photo can sit in the piece and not only on the cover.
50. As Hermes, I want tags on a piece to stay as they are when I revise it, so that I do not add, remove, or create tags.
51. As Hermes, I want to list Categories, so that I can choose a section for a piece.
52. As Hermes, I want to create a Category by name, so that I can file news in a section that does not exist yet.
53. As Hermes, I want a new Category to receive a slug from its name when I do not supply one, so that I can create a section with a name alone.
54. As Hermes, I want a Category create to fail when the slug is already taken, so that two sections do not share a slug.
55. As Hermes, I want to rename a Category and change its slug, so that I can correct a section I created.
56. As Hermes, I want a Category rename to fail when the new slug is already taken, so that I do not collide with another section.
57. As Hermes, I want Category deletion to be rejected, so that I cannot detach news from a section.
58. As a human Editor, I want news already in a Category to keep that Category after Hermes tries to delete it, so that agent limits do not orphan news.
59. As Hermes, I want publishing to be rejected, so that Pending news stays Pending until an Admin publishes it.
60. As Hermes, I want unpublishing to be rejected, so that I cannot take Published news back to Pending.
61. As Hermes, I want user management to be rejected, so that I cannot create users, change roles, or issue tokens.
62. As another agent Editor, I want my own tokens, separate from Hermes, so that news I create names me as the Author.
63. As another agent Editor, I want the same Pending-only limits as Hermes, so that every agent Editor follows one rule.
64. As an Admin, I want to publish news Hermes created, from the admin UI, so that the piece becomes public under Hermes's name.
65. As a reader, I want the published piece to show the Author who created it, so that a later agent revision does not change the name.
66. As Hermes, I want navigation to be unavailable, so that I do not add, reorder, or remove site links.
67. As a caller with a human Editor's browser session, I want that session to be rejected by the MCP endpoint, so that only an agent token can call the tools.
68. As an Admin, I want my browser session to be rejected by the MCP endpoint, so that MCP is not a second admin UI.

## Implementation Decisions

- The Nuxt app exposes one MCP endpoint over streamable HTTP on the same origin as the site. Agents connect to the deployed site or to a local dev server. There is no stdin/stdout transport and no client inside the admin UI.
- The endpoint accepts a bearer token and nothing else. A browser session is not an MCP credential. The existing admin API keeps accepting browser sessions only and rejects the bearer token.
- A token belongs to one Editor user. An agent Editor may have more than one. Each token has a name, a created date, and an expiry. The site stores only a hash of the secret. The raw secret is returned once, when an Admin issues it. Issuing another token leaves the earlier ones in place. An Admin revokes one token at a time, and that agent's other tokens keep working. Expiry is chosen at issue: 30 days, 90 days, 180 days, 1 year, or never. A token past its expiry is rejected the same way a revoked token is.
- An Admin issues and revokes tokens through the existing session-authenticated admin surface. Editors and agents cannot. A token can be issued only for an Editor the Admin has marked as an agent. That mark is not a role. The user's role stays Editor. Human Editors and Admins are unchanged.
- An agent Editor cannot open a browser session. Password sign-in for that user is rejected. Revoking a token does not turn the agent into a human Editor.
- MCP tools run as the Editor the token resolves to. News created by a tool stores that user as the Author and leaves the piece Pending. Revisions do not change the Author.
- Tools that change news act only when the piece is Pending. A Published piece is readable and otherwise rejected. Those tools cover title, description, Markdown body, Category, and featured image. They do not accept tags, publish, or unpublish. Leaving tags off a revision keeps the tags already stored.
- Featured image may be an uploaded URL or a URL the agent supplies, and it may be cleared, only on Pending news. Upload accepts an image within the site's existing image size limit and returns a URL. The agent may place that URL in the Markdown body.
- Category tools list, create, and update Categories. Create takes a name and an optional slug. When the slug is omitted, it is derived from the name the same way the admin UI does today. A slug that already exists is rejected. There is no Category delete tool.
- There is no navigation tool, no user tool, and no tag tool.
- The public page already renders the news body as Markdown. Agent-written bodies are Markdown. Human-edited bodies already stored in that field stay as they are.
- Schema stores each token's hash, its name, which Editor it belongs to, when it was created, and when it expires, and which Editors are agents. It does not add a role.
- Decisions in `docs/adr/0001-agents-connect-over-mcp.md` and `docs/adr/0002-agent-editors-have-narrower-powers.md` stand. Vocabulary follows `GLOSSARY.md`.

## Testing Decisions

- A good test calls the Nuxt app already running from `bun run dev` (`http://localhost:3000`, or `TEST_BASE_URL`) and checks the HTTP response and what a later HTTP read shows. It does not call internal helpers, and it does not open a browser.
- One seam. An Admin browser session issues and revokes tokens. An agent then calls the MCP endpoint with a token. Human Editor sessions are used only to prove that today's admin powers still work and that a session cannot call MCP.
- The suite covers the stories above: rejected, expired, and revoked tokens, a second token of the same agent that still works, no admin login for an agent, Pending create/revise/delete, Published news left unchanged, featured image upload and URL, Category create and update, rejected Category delete, tags left unchanged, and a second agent Author.
- The suite is Vitest e2e in `test/e2e`. It signs in as the admin from `NUXT_ADMIN_EMAIL` and `NUXT_ADMIN_PASSWORD`, uses the database that running app is using, and deletes users it creates when the run finishes. The app must already be running.

## Out of Scope

- The site calling Hermes, and any chat panel in the admin UI.
- Stdin/stdout, OAuth client registration, and unknown clients registering themselves.
- A third role, and applying agent limits to human Editors.
- Publishing, unpublishing, user management, tags, and navigation.
- A separate credit for who last revised a piece, and an edit history.
- Changing how human Editors write in the admin editor.

## Further Notes

- Hermes is the first agent Editor, not the only one. Any later agent gets the same kind of tokens and the same tools.
- A piece Hermes files stays Pending until an Admin publishes it in the admin UI. After that, Hermes can still read it and cannot change or delete it.
