# ClickUp MCP Server — Python (FastMCP)

A Python implementation of the ClickUp MCP server using FastMCP, providing 33 tools for full ClickUp API v2 access.

## Why Python?

The existing TypeScript server works well, but this Python version adds:

- **`clickup_get_list_tasks`** — pull tasks directly from a list with filtering (status, assignee, date ranges, pagination)
- **`clickup_get_task`** — get a single task by ID
- **No `outputSchema` on tools** — avoids schema validation issues with some MCP clients (e.g., Hermes Agent)
- **Simpler deployment** — single file, no build step, no npm dependency

## Quick Start

```bash
# Install dependencies
pip install mcp httpx

# Run
CLICKUP_PERSONAL_TOKEN=pk_... python3 python/server.py
```

## Hermes Agent Config

```yaml
mcp_servers:
  clickup:
    command: /path/to/python/server.py
    env:
      CLICKUP_PERSONAL_TOKEN: pk_...
```

Or use the wrapper script:

```yaml
mcp_servers:
  clickup:
    command: /path/to/python/run.sh
    env:
      CLICKUP_PERSONAL_TOKEN: pk_...
```

## Tools (33 total)

| Category | Tools |
|----------|-------|
| **Teams** | `get_teams` |
| **Spaces** | `get_spaces`, `get_space`, `create_space`, `update_space`, `delete_space` |
| **Folders** | `get_folders`, `get_folder`, `create_folder`, `update_folder`, `delete_folder` |
| **Lists** | `get_lists`, `create_list` |
| **Tasks** | `create_task`, `update_task`, `get_task`, `get_list_tasks` |
| **Views** | `get_views`, `create_view`, `get_view_details`, `update_view`, `delete_view`, `get_view_tasks` |
| **Docs** | `search_docs`, `create_doc`, `get_doc_pages`, `create_doc_page`, `get_doc_page_content`, `edit_doc_page_content` |
| **Custom Fields** | `get_custom_fields`, `set_task_custom_field_value`, `remove_task_custom_field_value` |
| **Boards** | `create_board` |

## Differences from TypeScript version

- All tools return JSON strings (no `structuredContent`) for maximum MCP client compatibility
- `get_list_tasks` supports filtering by assignees, statuses, and date ranges
- `get_task` is a new tool for fetching a single task
- No `outputSchema` — avoids the "output schema but did not return structured content" error
