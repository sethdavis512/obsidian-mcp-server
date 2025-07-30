Here is a comprehensive **prompt for building an LLM-driven system** that connects Windsurf, an MCP server, OpenAI’s API, and your Obsidian notes (via plugin or raw file access). This prompt is ready for an advanced language model or AI-codegen agent and assumes you have a Windsurf subscription and API keys:

## Prompt for LLM: Full Stack MCP–OpenAI–Obsidian Integration (for Windsurf)

**Objective:**  
Create a complete, production-ready Model Context Protocol (MCP) server (using Node.js or TypeScript) that does the following:

-   Connects to my local Obsidian vault (supports both plugin interface and direct markdown file access).
-   Enables read, search, write, and update actions on notes using the MCP standard.
-   Integrates with OpenAI APIs for language/model calls (will provide my own API key).
-   Registers itself for use as a custom MCP server in Windsurf, discoverable by the AI agent (e.g., Cascade panel).
-   Provides documentation for setup, configuration in Windsurf, and extension.

**Requirements:**

1. **Local File/Vault Interface:**

    - Ability to enumerate, read, update, and create markdown notes stored in the Obsidian vault directory.
    - Optional: Detect and use Obsidian plugin API if present for enhanced metadata/tag support, but always fall back to raw file operations if unavailable.

2. **MCP Protocol Server:**

    - Expose all vault actions (read/search/write/metadata/tagging) as commands/functions per the MCP spec.
    - Support either stdio (local) or sse/http (remote) transport; include config templates for both[9][10][11].

3. **OpenAI Integration:**

    - Accept natural language tasks via MCP (e.g., “Summarize note X” or “Create a to-do list from all notes”).
    - Use OpenAI’s API (GPT-3.5 or GPT-4) to process, summarize, generate, or reformat note contents as part of actions.

4. **Windsurf/Cascade Registration Step:**

    - Output an installation/configuration block for Windsurf’s `mcp_config.json` or equivalent settings, according to official docs[11][12].
    - Provide both CLI (node command) and remote server (`/sse` URL) examples.

5. **Security & Usability:**
    - Environment variable support for vault path and OpenAI keys.
    - Clearly document any dependencies or OS-level requirements.

**Deliverables:**

-   A complete, commented Node.js MCP server source code (one file preferred for clarity; reference modules allowed).
-   Example config snippets for connecting your MCP server to Windsurf:
    -   As a local stdio tool: using `"command": "node", "args": [...]"` in Windsurf’s MCP settings.
    -   As a remote HTTP/sse endpoint: with service instructions.
-   Sample user flows: “Summarize all notes tagged #project”, “Bulk update metadata”, and “Generate a weekly digest”.
-   Setup instructions: How to register this server in Windsurf, and how the workflow links Obsidian ↔️ MCP ↔️ OpenAI ↔️ Windsurf.
-   Optionally: A test script or sample prompts for the Cascade panel.

**Example Prompt (one-sentence version for LLM):**  
"Write a Node.js MCP server that can access and manipulate an Obsidian markdown vault (plugin or file), integrates OpenAI’s API for text operations, and registers for local or remote access as a Windsurf MCP tool, including Windsurf settings and usage documentation."

**References for Implementation:**

-   Windsurf official documentation on MCP plugin/server integration[11][12].
-   Step-by-step setup and configs for custom MCP servers (see sample config blocks and refresh instructions in the docs)[9][10].
-   Obsidian’s file format and plugin API guidelines.

This prompt ensures the LLM builds an **end-to-end tool** that lets you ask OpenAI-powered questions about your Obsidian notes, all controlled from Windsurf.

Sources
[1] Windsurf + Neo4j MCP Server in under 10 minutes - YouTube https://www.youtube.com/watch?v=VYF2sYfLu44
[2] Create your own MPC server and connect it to Cursor, Windsurf, Claude Desktop, and MPC Inspector - YouTube https://www.youtube.com/watch?v=QHlajR8LXR4
[3] ‍♂️ Setting Up an MCP Server in Windsurf - YouTube https://www.youtube.com/watch?v=8pCp5pgEqpI
[4] MCP Setup for Claude - Cursor - Windsurf - VS Code in 4 mins - YouTube https://www.youtube.com/watch?v=bhc9aXYhgzQ
[5] Connect Your Remote MCP Server to Windsurf - YouTube https://www.youtube.com/watch?v=cuYhjdbXjl0
[6] Installing and Managing MCP Servers in Windsurf (Part 1) - YouTube https://www.youtube.com/watch?v=AXhWXWAMePc
[7] Windsurf, Cline & Roo Code: Quick MCP Setup - YouTube https://www.youtube.com/watch?v=RMycopezYZw
[8] Configuring Your First MCP Server | Windsurf University - YouTube https://www.youtube.com/watch?v=chnuaY65M5c
[9] How to Set Up a Remote MCP Server in Windsurf - Phala Network https://phala.network/posts/How-to-Set-Up-a-Remote-MCP-Server-in-Windsurf
[10] How to Use MCP Servers in Windsurf AI (Becoming 10x Developer) https://apidog.com/blog/windsurf-mcp-servers/
[11] Cascade MCP Integration - Windsurf Docs https://docs.windsurf.com/windsurf/cascade/mcp
[12] Configuring Your First MCP Server - Windsurf https://windsurf.com/university/tutorials/configuring-first-mcp-server
[13] A Beginner's Guide to using MCP in Windsurf! - YouTube https://www.youtube.com/watch?v=Y_kaQmhGmZk
[14] A Beginner's Guide to using MCP in Windsurf! [VIDEO] - Reddit https://www.reddit.com/r/Codeium/comments/1is2n2z/a_beginners_guide_to_using_mcp_in_windsurf_video/
[15] Set up MCP server - Browser MCP https://docs.browsermcp.io/setup-server
