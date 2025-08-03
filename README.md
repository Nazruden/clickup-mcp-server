# ClickUp MCP Server

[![smithery badge](https://smithery.ai/badge/@Nazruden/clickup-mcp-server)](https://smithery.ai/server/@Nazruden/clickup-mcp-server)
[![npm version](https://badge.fury.io/js/%40nazruden%2Fclickup-server.svg)](https://badge.fury.io/js/%40nazruden%2Fclickup-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
<a href="https://www.buymeacoffee.com/nazruden" target="_blank"><img src="https://img.shields.io/badge/Buy%20Me%20A%20Coffee-yellow.svg?style=flat-square&logo=buymeacoffee&logoColor=black" alt="Buy Me A Coffee"></a>

A Model Context Protocol server implementation for ClickUp integration, enabling AI assistants to interact with ClickUp workspaces.

This server runs via **Stdio** as per the MCP specification when invoked by an MCP client.

<a href="https://glama.ai/mcp/servers/9a7p2exf6u"><img width="380" height="200" src="https://glama.ai/mcp/servers/9a7p2exf6u/badge" alt="ClickUp Server MCP server" /></a>

## Quick Start

This server uses your **ClickUp Personal API Token** for authentication.

1.  **Generate a Personal API Token:** In your ClickUp settings, navigate to "My Settings" > "Apps" and generate a token.
2.  **Configure your MCP Client (e.g., Claude for Desktop):** Set the required environment variable when configuring the server for your client.

Example configuration snippet for an MCP client:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["@nazruden/clickup-server"],
      "env": {
        "CLICKUP_PERSONAL_TOKEN": "your_personal_api_token_here"
      }
    }
  }
}
```

3.  **Restart your MCP Client.**

The server will be automatically downloaded and started by the MCP client when needed.

### Installing via Smithery

To install ClickUp MCP Server for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@Nazruden/clickup-mcp-server):

```bash
npx -y @smithery/cli install @Nazruden/clickup-mcp-server --client claude
```

## Environment Variables

### Required

- `CLICKUP_PERSONAL_TOKEN`: Your ClickUp Personal API Token. This is essential for the server to authenticate with the ClickUp API.

### Optional

- `LOG_LEVEL`: Logging level for the server. Supports `error`, `warn`, `info`, `debug`. Defaults to `info`.
- `ENCRYPTION_KEY`: A persistent 32-byte hex-encoded key. The configuration system (`src/config/app.config.ts`) loads or generates this key, and `src/security.ts` contains encryption/decryption functions. However, this mechanism is **currently not used** for encrypting the `CLICKUP_PERSONAL_TOKEN` within the `ClickUpService`'s Personal API Token authentication flow.
- `PORT`: Server port. This is **not used** by the default Stdio MCP server mode but might be relevant if an HTTP transport or additional HTTP features (like a separate health check endpoint) were explicitly added. Defaults to `3000` in the config if read.

## Available Tools

The following MCP tools are currently implemented:

### Task Management

- `clickup_create_task`: Create a new task in a ClickUp list.
  - Requires: `list_id`, `name`.
  - Optional: `description`, `status`, `priority`, `assignees`, `due_date`, `time_estimate`, `tags`.
- `clickup_update_task`: Update an existing task's properties.
  - Requires: `task_id`.
  - Optional: Any writable `ClickUpTask` properties.

### Team & List Management

- `clickup_get_teams`: Retrieve all accessible teams (Workspaces in ClickUp API v2).
- `clickup_get_lists`: Get all lists in a specific folder.
  - Requires: `folder_id`.

### Board Management

- `clickup_create_board`: Create a new board in a ClickUp space.
  - Requires: `space_id`, `name`.

### Space Management

- `clickup_get_spaces`: Retrieves all Spaces for a given Workspace (Team).
  - Requires: `team_id` (Workspace ID).
  - Optional: `archived` (boolean, defaults to `false`).
- `clickup_create_space`: Creates a new Space within a Workspace.
  - Requires: `team_id` (Workspace ID), `name`.
  - Optional: `multiple_assignees` (boolean), `features` (object with feature flags like `due_dates`, `time_tracking`, etc.).
- `clickup_get_space`: Retrieves details for a specific Space.
  - Requires: `space_id`.
- `clickup_update_space`: Updates an existing Space.
  - Requires: `space_id`.
  - Optional: `name`, `color`, `private`, `admin_can_manage`, `archived`, `features`.
- `clickup_delete_space`: Deletes a Space.
  - Requires: `space_id`.

### Folder Management

- `clickup_get_folders`: Retrieves all Folders within a given Space.
  - Requires: `space_id`.
  - Optional: `archived` (boolean, defaults to `false`).
- `clickup_create_folder`: Creates a new Folder within a Space.
  - Requires: `space_id`, `name`.
- `clickup_get_folder`: Retrieves details for a specific Folder.
  - Requires: `folder_id`.
- `clickup_update_folder`: Updates an existing Folder.
  - Requires: `folder_id`, `name`.
- `clickup_delete_folder`: Deletes a Folder.
  - Requires: `folder_id`.

### Custom Field Management

- `clickup_get_custom_fields`: Retrieves all accessible Custom Fields for a given List.
  - Requires: `list_id`.
- `clickup_set_task_custom_field_value`: Sets the value of a Custom Field on a specific task.
  - Requires: `task_id`, `field_id`, `value`.
  - Optional: `value_options` (object, e.g., `{ "time": true }` for date fields).
- `clickup_remove_task_custom_field_value`: Removes/clears the value of a Custom Field from a specific task.
  - Requires: `task_id`, `field_id`.

### Doc Management

**Note:** ClickUp's API for Docs (especially v2, with some operations now using v3) has limitations. Content is primarily handled as Markdown. Advanced formatting or complex embeds might not be fully supported. Direct document deletion via API is not currently supported by ClickUp's V3 /docs endpoint; manage Doc lifecycle through archiving or page manipulation.

- `clickup_search_docs`: Searches for Docs within a Workspace (Team).
  - Requires: `workspace_id`.
  - Optional: `query` (string), `include_archived` (boolean).
- `clickup_create_doc`: Creates a new Doc.
  - Requires: `workspace_id`, `name`.
  - Optional: `parent` (object with `id` and `type`), `visibility` (string: "private", "workspace", "public"), `create_page` (boolean).
- `clickup_get_doc_pages`: Retrieves the list of pages within a specific Doc.
  - Requires: `doc_id`.
- `clickup_create_doc_page`: Creates a new page within a specific Doc.
  - Requires: `workspace_id`, `doc_id`, `name` (page title).
  - Optional: `content` (Markdown), `orderindex` (number, though v3 API may not use it), `parent_page_id` (string), `sub_title` (string), `content_format` (string).
- `clickup_get_doc_page_content`: Retrieves the content (Markdown) of a specific Doc page.
  - Requires: `workspace_id`, `doc_id`, `page_id`.
  - Optional: `content_format` (string).
- `clickup_edit_doc_page_content`: Updates the content and/or title of a specific Doc page.
  - Requires: `workspace_id`, `doc_id`, `page_id`, `content` (Markdown).
  - Optional: `title` (string, maps to API 'name'), `sub_title` (string), `content_edit_mode` (string: "replace", "append", "prepend"), `content_format` (string).

### View Management

- `clickup_get_views`: Retrieves all Views for a given parent resource (Team, Space, Folder, or List).
  - Requires: `parent_id` (ID of the parent resource), `parent_type` (string: "team", "space", "folder", or "list").
- `clickup_create_view`: Creates a new View within a Team, Space, Folder, or List.
  - Requires: `parent_id`, `parent_type`, `name` (string: name of the new View), `type` (string: type of the View, e.g., "list", "board", "calendar", "gantt").
  - Optional: `grouping`, `divide`, `sorting`, `filters`, `columns`, `team_sidebar`, `settings` (objects defining view configurations).
- `clickup_get_view_details`: Retrieves details for a specific View.
  - Requires: `view_id`.
- `clickup_update_view`: Updates an existing View.
  - Requires: `view_id`.
  - Optional: `name` (string), `grouping`, `divide`, `sorting`, `filters`, `columns`, `team_sidebar`, `settings`.
- `clickup_delete_view`: Deletes a View.
  - Requires: `view_id`.
- `clickup_get_view_tasks`: Retrieves tasks belonging to a specific View.
  - Requires: `view_id`.
  - Optional: `page` (number: 0-indexed page number for pagination).

## Development

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd clickup-mcp-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add your `CLICKUP_PERSONAL_TOKEN`:
    ```env
    CLICKUP_PERSONAL_TOKEN=your_actual_personal_api_token_here
    LOG_LEVEL=debug
    ```
4.  Start in development mode (Stdio):
    The server will listen for MCP messages on stdin/stdout.

    ```bash
    npm run dev
    ```

    This uses `ts-node-dev` to run `src/index.ts`.

5.  Build for production:

    ```bash
    npm run build
    ```

    This compiles TypeScript to `dist/`.

6.  Run tests:
    ```bash
    npm test
    ```
    This runs Jest unit tests located in `src/__tests__`. Ensure you have a `.env.test` file (see `src/__tests__/setup.ts`).

### Testing with MCP Inspector

You can test the server locally using the MCP Inspector:

1.  Ensure your `CLICKUP_PERSONAL_TOKEN` is available. You can either:
    - Set it in your shell environment before running the inspector.
    - Set it within the MCP Inspector UI if it provides an option for server environment variables.
    - Have it in your local `.env` file (as `src/index.ts` loads `dotenv`).
2.  Run the Inspector with the server:
    ```bash
    npx @modelcontextprotocol/inspector node --loader ts-node/esm src/index.ts
    ```
    The Inspector UI should launch, allowing you to connect to the server and call its tools.

## Security

- Authenticates using your ClickUp Personal API Token. **Keep this token secure and confidential.** Treat it like a password.
- The server expects the `CLICKUP_PERSONAL_TOKEN` to be provided via an environment variable by the consuming MCP client or development environment.
- The configuration system includes logic for an `ENCRYPTION_KEY` and `src/security.ts` has encryption functions, but this is **not currently applied** to the Personal API Token by the `ClickUpService`.
- No sensitive data (like the token itself) is logged by default with `LOG_LEVEL=info`. Debug level might log more details.
- Rate limiting for ClickUp API calls is handled by logging remaining requests (see `ClickUpService`).

## Troubleshooting

### Common Issues

1.  **Authentication Errors (401 from ClickUp API)**

    - Verify your `CLICKUP_PERSONAL_TOKEN` environment variable is correctly set and accessible by the server process.
    - Ensure the token is valid and not revoked in your ClickUp settings.
    - Check server logs for messages from `ClickUpService` regarding authentication.

2.  **Rate Limiting by ClickUp API**

    - The server logs rate limit information from ClickUp API responses.
    - If rate limits are hit frequently, this indicates high usage. The server itself does not implement queuing or complex backoff beyond what `axios` might do by default.

3.  **Server Not Starting / MCP Inspector Connection Issues**
    - Ensure `CLICKUP_PERSONAL_TOKEN` is set.
    - If using `npm run dev`, check for TypeScript or `ts-node-dev` errors in the console.
    - If using MCP Inspector with `node --loader ts-node/esm src/index.ts`, ensure `ts-node` and project dependencies are correctly installed.
    - Check for console errors from `src/index.ts` or `ClickUpService`.

### Getting Server Logs

- When run via `npm run dev` or `npm start`, logs go to the console.
- If run by an MCP client (like Claude for Desktop), logs are typically managed by that client. For Claude for Desktop, logs can often be found at:
  - Windows: `%USERPROFILE%\AppData\Local\Claude\Logs\mcp\<server_name_and_id>\<process_id>.log` (path may vary slightly)
  - macOS: `~/Library/Logs/Claude/mcp/<server_name_and_id>\<process_id>.log` (path may vary slightly)

## Support

If you find this project helpful, consider buying me a coffee to support ongoing development and maintenance.

<a href="https://www.buymeacoffee.com/nazruden" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## License

MIT License - see LICENSE file for details
# Test pipeline fix
