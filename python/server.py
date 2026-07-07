#!/usr/bin/env python3
"""
ClickUp MCP Server — full-featured MCP server for the ClickUp API v2.

Usage:
    CLICKUP_PERSONAL_TOKEN=pk_... python server.py
    # or via Hermes MCP config:
    #   command: python3
    #   args: ["/path/to/server.py"]
    #   env:
    #     CLICKUP_PERSONAL_TOKEN: pk_...

Tools provided (all prefixed with clickup_):
  Hierarchy:  get_teams, get_spaces, get_space, create_space, update_space, delete_space
              get_folders, get_folder, create_folder, update_folder, delete_folder
              get_lists, create_list
  Tasks:      create_task, update_task, get_task, get_list_tasks
  Views:      get_views, create_view, get_view_details, update_view, delete_view, get_view_tasks
  Docs:       search_docs, create_doc, get_doc_pages, create_doc_page,
              get_doc_page_content, edit_doc_page_content
  Custom:     get_custom_fields, set_task_custom_field_value, remove_task_custom_field_value
  Boards:     create_board
"""

import json
import os
import sys
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

# ── Config ──────────────────────────────────────────────────────────────
TOKEN = os.environ.get("CLICKUP_PERSONAL_TOKEN", "")
if not TOKEN:
    print("ERROR: CLICKUP_PERSONAL_TOKEN environment variable is required", file=sys.stderr)
    sys.exit(1)

BASE_URL = "https://api.clickup.com/api/v2"
HEADERS = {
    "Authorization": TOKEN,
    "Content-Type": "application/json",
}

mcp = FastMCP("ClickUp MCP Server")

# ── HTTP helper ─────────────────────────────────────────────────────────
async def _request(
    method: str,
    path: str,
    params: dict | None = None,
    json_body: dict | None = None,
) -> dict[str, Any]:
    """Make an authenticated request to the ClickUp API."""
    url = f"{BASE_URL}{path}"
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.request(
            method, url, headers=HEADERS, params=params, json=json_body
        )
        resp.raise_for_status()
        return resp.json()


def _ok(data: Any) -> str:
    """Format a successful response."""
    return json.dumps({"result": data}, indent=2)


def _err(msg: str) -> str:
    """Format an error response."""
    return json.dumps({"error": msg}, indent=2)


# ── Teams ───────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_teams() -> str:
    """Get all teams (workspaces) accessible to the authenticated user."""
    try:
        data = await _request("GET", "/team")
        return _ok(data.get("teams", []))
    except Exception as e:
        return _err(str(e))


# ── Spaces ──────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_spaces(team_id: str, archived: bool = False) -> str:
    """Retrieves all Spaces for a given Workspace (Team).

    Args:
        team_id: The ID of the Workspace (Team) to operate on.
        archived: Whether to include archived items.
    """
    try:
        data = await _request("GET", f"/team/{team_id}/space", params={"archived": str(archived).lower()})
        return _ok(data.get("spaces", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_space(space_id: str) -> str:
    """Retrieves details for a specific Space.

    Args:
        space_id: The ID of the Space to operate on.
    """
    try:
        data = await _request("GET", f"/space/{space_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_space(
    team_id: str,
    name: str,
    multiple_assignees: bool = False,
) -> str:
    """Creates a new Space within a Workspace.

    Args:
        team_id: The ID of the Workspace (Team) to operate on.
        name: Name of the new Space.
        multiple_assignees: Allow multiple assignees for tasks in this Space.
    """
    try:
        data = await _request("POST", f"/team/{team_id}/space", json_body={
            "name": name,
            "multiple_assignees": multiple_assignees,
        })
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_update_space(
    space_id: str,
    name: str | None = None,
    color: str | None = None,
    private: bool | None = None,
    admin_can_manage: bool | None = None,
    archived: bool | None = None,
) -> str:
    """Updates an existing Space.

    Args:
        space_id: The ID of the Space to operate on.
        name: New name for the Space.
        color: New color for the Space (hex or name).
        private: Set Space visibility to private.
        admin_can_manage: Allow admins to manage the Space.
        archived: Archive or unarchive the Space.
    """
    try:
        body: dict[str, Any] = {}
        if name is not None: body["name"] = name
        if color is not None: body["color"] = color
        if private is not None: body["private"] = private
        if admin_can_manage is not None: body["admin_can_manage"] = admin_can_manage
        if archived is not None: body["archived"] = archived
        data = await _request("PUT", f"/space/{space_id}", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_delete_space(space_id: str) -> str:
    """Deletes a Space.

    Args:
        space_id: The ID of the Space to operate on.
    """
    try:
        data = await _request("DELETE", f"/space/{space_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Folders ─────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_folders(space_id: str, archived: bool = False) -> str:
    """Retrieves all Folders within a given Space.

    Args:
        space_id: The ID of the Space to operate on.
        archived: Whether to include archived items.
    """
    try:
        data = await _request("GET", f"/space/{space_id}/folder", params={"archived": str(archived).lower()})
        return _ok(data.get("folders", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_folder(folder_id: str) -> str:
    """Retrieves details for a specific Folder.

    Args:
        folder_id: The ID of the Folder to operate on.
    """
    try:
        data = await _request("GET", f"/folder/{folder_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_folder(space_id: str, name: str) -> str:
    """Creates a new Folder within a Space.

    Args:
        space_id: The ID of the Space to operate on.
        name: Name of the new Folder.
    """
    try:
        data = await _request("POST", f"/space/{space_id}/folder", json_body={"name": name})
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_update_folder(folder_id: str, name: str) -> str:
    """Updates an existing Folder.

    Args:
        folder_id: The ID of the Folder to operate on.
        name: New name for the Folder.
    """
    try:
        data = await _request("PUT", f"/folder/{folder_id}", json_body={"name": name})
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_delete_folder(folder_id: str) -> str:
    """Deletes a Folder.

    Args:
        folder_id: The ID of the Folder to operate on.
    """
    try:
        data = await _request("DELETE", f"/folder/{folder_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Lists ───────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_lists(folder_id: str) -> str:
    """Get all lists in a specific folder.

    Args:
        folder_id: The ID of the folder to get lists from.
    """
    try:
        data = await _request("GET", f"/folder/{folder_id}/list")
        return _ok(data.get("lists", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_list(
    parent_id: str,
    parent_type: str,
    name: str,
    content: str | None = None,
    due_date: int | None = None,
    due_date_time: bool = False,
    priority: int | None = None,
    assignee: int | None = None,
    status: str | None = None,
) -> str:
    """Creates a new List within a Folder or Space.

    Args:
        parent_id: The ID of the parent Folder or Space.
        parent_type: The type of the parent: 'folder' or 'space'.
        name: Name for the new List.
        content: Optional description for the List.
        due_date: Optional due date (Unix timestamp in milliseconds).
        due_date_time: Set to true if due_date includes time.
        priority: Default priority (1-Urgent, 2-High, 3-Normal, 4-Low).
        assignee: Default assignee User ID.
        status: Default status for tasks (e.g., 'Open').
    """
    try:
        if parent_type not in ("folder", "space"):
            return _err("parent_type must be 'folder' or 'space'")
        body: dict[str, Any] = {"name": name}
        if content is not None: body["content"] = content
        if due_date is not None: body["due_date"] = due_date
        if due_date_time: body["due_date_time"] = due_date_time
        if priority is not None: body["priority"] = priority
        if assignee is not None: body["assignee"] = assignee
        if status is not None: body["status"] = status
        data = await _request("POST", f"/{parent_type}/{parent_id}/list", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Tasks ───────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_create_task(
    list_id: str,
    name: str,
    description: str | None = None,
    assignees: list[str] | None = None,
    status: str | None = None,
    priority: int | None = None,
    due_date: int | None = None,
    time_estimate: int | None = None,
    tags: list[str] | None = None,
) -> str:
    """Create a new task in ClickUp workspace.

    Args:
        list_id: The unique string identifier of the ClickUp list.
        name: The name of the task.
        description: A detailed description (supports ClickUp Flavored Markdown).
        assignees: Array of user ID strings for task assignees.
        status: Target status string (must match an existing status name).
        priority: 1 for Urgent, 2 for High, 3 for Normal, 4 for Low.
        due_date: Due date as Unix timestamp in milliseconds.
        time_estimate: Estimated time in milliseconds.
        tags: Array of tag names.
    """
    try:
        body: dict[str, Any] = {"name": name}
        if description is not None: body["description"] = description
        if assignees is not None: body["assignees"] = assignees
        if status is not None: body["status"] = status
        if priority is not None: body["priority"] = priority
        if due_date is not None: body["due_date"] = str(due_date)
        if time_estimate is not None: body["time_estimate"] = str(time_estimate)
        if tags is not None: body["tags"] = tags
        data = await _request("POST", f"/list/{list_id}/task", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_update_task(
    task_id: str,
    name: str | None = None,
    description: str | None = None,
    assignees: list[str] | None = None,
    status: str | None = None,
    priority: int | None = None,
    due_date: int | None = None,
    time_estimate: int | None = None,
    tags: list[str] | None = None,
) -> str:
    """Update an existing task in ClickUp.

    Args:
        task_id: The unique string identifier of the ClickUp task.
        name: New name for the task.
        description: Updated description.
        assignees: Array of user ID strings for task assignees.
        status: Target status string.
        priority: 1-Urgent, 2-High, 3-Normal, 4-Low.
        due_date: Due date as Unix timestamp in milliseconds.
        time_estimate: Estimated time in milliseconds.
        tags: Array of tag names.
    """
    try:
        body: dict[str, Any] = {}
        if name is not None: body["name"] = name
        if description is not None: body["description"] = description
        if assignees is not None: body["assignees"] = assignees
        if status is not None: body["status"] = status
        if priority is not None: body["priority"] = priority
        if due_date is not None: body["due_date"] = str(due_date)
        if time_estimate is not None: body["time_estimate"] = str(time_estimate)
        if tags is not None: body["tags"] = tags
        if not body:
            return _err("No fields provided to update")
        data = await _request("PUT", f"/task/{task_id}", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_task(task_id: str) -> str:
    """Get a single task by its ID.

    Args:
        task_id: The unique string identifier of the ClickUp task.
    """
    try:
        data = await _request("GET", f"/task/{task_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_list_tasks(
    list_id: str,
    archived: bool = False,
    page: int = 0,
    order_by: str = "created",
    reverse: bool = False,
    subtasks: bool = False,
    statuses: list[str] | None = None,
    assignees: list[str] | None = None,
    due_date_gt: int | None = None,
    due_date_lt: int | None = None,
    date_created_gt: int | None = None,
    date_created_lt: int | None = None,
    date_updated_gt: int | None = None,
    date_updated_lt: int | None = None,
) -> str:
    """Get all tasks in a specific list. This is the primary way to read tasks.

    Args:
        list_id: The ID of the list to get tasks from.
        archived: Include archived tasks.
        page: Page number (0-indexed).
        order_by: Sort field: 'id', 'created', 'updated', 'due_date'.
        reverse: Reverse sort order.
        subtasks: Include subtasks.
        statuses: Filter by status names (e.g., ['to do', 'in progress']).
        assignees: Filter by assignee user IDs.
        due_date_gt: Due date greater than (Unix ms timestamp).
        due_date_lt: Due date less than (Unix ms timestamp).
        date_created_gt: Created after (Unix ms timestamp).
        date_created_lt: Created before (Unix ms timestamp).
        date_updated_gt: Updated after (Unix ms timestamp).
        date_updated_lt: Updated before (Unix ms timestamp).
    """
    try:
        params: dict[str, Any] = {
            "archived": str(archived).lower(),
            "page": page,
            "order_by": order_by,
            "reverse": str(reverse).lower(),
            "subtasks": str(subtasks).lower(),
        }
        if statuses: params["statuses[]"] = statuses
        if assignees: params["assignees[]"] = assignees
        if due_date_gt is not None: params["due_date_gt"] = due_date_gt
        if due_date_lt is not None: params["due_date_lt"] = due_date_lt
        if date_created_gt is not None: params["date_created_gt"] = date_created_gt
        if date_created_lt is not None: params["date_created_lt"] = date_created_lt
        if date_updated_gt is not None: params["date_updated_gt"] = date_updated_gt
        if date_updated_lt is not None: params["date_updated_lt"] = date_updated_lt
        data = await _request("GET", f"/list/{list_id}/task", params=params)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Views ───────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_views(parent_id: str, parent_type: str) -> str:
    """Retrieves all Views for a given parent (Team, Space, Folder, or List).

    Args:
        parent_id: ID of the parent (Team, Space, Folder, or List).
        parent_type: Type of the parent: 'team', 'space', 'folder', or 'list'.
    """
    try:
        if parent_type not in ("team", "space", "folder", "list"):
            return _err("parent_type must be 'team', 'space', 'folder', or 'list'")
        data = await _request("GET", f"/{parent_type}/{parent_id}/view")
        return _ok(data.get("views", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_view(
    parent_id: str,
    parent_type: str,
    name: str,
    type: str,
) -> str:
    """Creates a new View within a Team, Space, Folder, or List.

    Args:
        parent_id: ID of the parent (Team, Space, Folder, or List).
        parent_type: Type of the parent: 'team', 'space', 'folder', or 'list'.
        name: Name of the new View.
        type: Type of the View ('list', 'board', 'calendar', 'gantt').
    """
    try:
        if parent_type not in ("team", "space", "folder", "list"):
            return _err("parent_type must be 'team', 'space', 'folder', or 'list'")
        if type not in ("list", "board", "calendar", "gantt"):
            return _err("type must be 'list', 'board', 'calendar', or 'gantt'")
        data = await _request("POST", f"/{parent_type}/{parent_id}/view", json_body={
            "name": name, "type": type,
        })
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_view_details(view_id: str) -> str:
    """Retrieves details for a specific View.

    Args:
        view_id: The ID of the View.
    """
    try:
        data = await _request("GET", f"/view/{view_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_update_view(view_id: str, name: str | None = None) -> str:
    """Updates an existing View.

    Args:
        view_id: The ID of the View.
        name: New name for the View.
    """
    try:
        body: dict[str, Any] = {}
        if name is not None: body["name"] = name
        data = await _request("PUT", f"/view/{view_id}", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_delete_view(view_id: str) -> str:
    """Deletes a View.

    Args:
        view_id: The ID of the View.
    """
    try:
        data = await _request("DELETE", f"/view/{view_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_view_tasks(view_id: str, page: int = 0) -> str:
    """Retrieves tasks belonging to a specific View.

    Args:
        view_id: The ID of the View.
        page: Page number for pagination (starts at 0).
    """
    try:
        data = await _request("GET", f"/view/{view_id}/task", params={"page": page})
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Docs ────────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_search_docs(team_id: str, query: str, include_archived: bool = False) -> str:
    """Searches for Docs within a Workspace (Team).

    Args:
        team_id: The ID of the Workspace (Team) to operate on.
        query: Search string for Doc name/content.
        include_archived: Whether to include archived items.
    """
    try:
        data = await _request("GET", f"/team/{team_id}/doc", params={
            "query": query,
            "include_archived": str(include_archived).lower(),
        })
        return _ok(data.get("docs", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_doc(
    workspace_id: str,
    name: str,
    parent_id: str | None = None,
    parent_type: int | None = None,
    visibility: str | None = None,
    create_page: bool = True,
) -> str:
    """Creates a new Doc within a Workspace.

    Args:
        workspace_id: The ID of the Workspace (Team ID).
        name: Name of the new Doc.
        parent_id: Optional parent resource ID.
        parent_type: Numeric type: 4=Space, 5=Folder, 6=List, 7/12=Workspace.
        visibility: 'PUBLIC', 'PRIVATE', 'PERSONAL', or 'HIDDEN'.
        create_page: Whether to auto-create an initial page.
    """
    try:
        body: dict[str, Any] = {"name": name, "create_page": create_page}
        if parent_id and parent_type:
            body["parent"] = {"id": parent_id, "type": parent_type}
        if visibility:
            body["visibility"] = visibility
        data = await _request("POST", f"/workspace/{workspace_id}/doc", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_doc_pages(workspace_id: str, doc_id: str) -> str:
    """Retrieves the list of pages within a specific Doc.

    Args:
        workspace_id: The ID of the Workspace (Team ID).
        doc_id: The ID of the Doc.
    """
    try:
        data = await _request("GET", f"/workspace/{workspace_id}/doc/{doc_id}/page")
        return _ok(data.get("pages", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_create_doc_page(
    workspace_id: str,
    doc_id: str,
    name: str,
    content: str | None = None,
    parent_page_id: str | None = None,
    sub_title: str | None = None,
    content_format: str = "text/md",
) -> str:
    """Creates a new page within a specific Doc.

    Args:
        workspace_id: The ID of the Workspace (Team ID).
        doc_id: The ID of the Doc to add the page to.
        name: The name (title) of the new page.
        content: Markdown content for the new page (optional).
        parent_page_id: Optional parent page ID to nest under.
        sub_title: Optional subtitle.
        content_format: Format of the page content (default: 'text/md').
    """
    try:
        body: dict[str, Any] = {"name": name, "content_format": content_format}
        if content is not None: body["content"] = content
        if parent_page_id is not None: body["parent_page_id"] = parent_page_id
        if sub_title is not None: body["sub_title"] = sub_title
        data = await _request("POST", f"/workspace/{workspace_id}/doc/{doc_id}/page", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_get_doc_page_content(
    workspace_id: str,
    doc_id: str,
    page_id: str,
    content_format: str = "text/md",
) -> str:
    """Retrieves the content (Markdown) of a specific Doc page.

    Args:
        workspace_id: The ID of the Workspace (Team ID).
        doc_id: The ID of the Doc containing the page.
        page_id: The ID of the page.
        content_format: Format to return ('text/md' or 'text/plain').
    """
    try:
        data = await _request("GET", f"/workspace/{workspace_id}/doc/{doc_id}/page/{page_id}",
                              params={"content_format": content_format})
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_edit_doc_page_content(
    workspace_id: str,
    doc_id: str,
    page_id: str,
    content: str,
    title: str | None = None,
    sub_title: str | None = None,
    content_edit_mode: str = "replace",
    content_format: str = "text/md",
) -> str:
    """Updates the content and/or title of a specific Doc page.

    Args:
        workspace_id: The ID of the Workspace (Team ID).
        doc_id: The ID of the Doc containing the page.
        page_id: The ID of the page to update.
        content: The new Markdown content for the page.
        title: Optional new title for the page.
        sub_title: Optional new subtitle.
        content_edit_mode: 'replace', 'append', or 'prepend' (default: replace).
        content_format: Format of the page content (default: 'text/md').
    """
    try:
        body: dict[str, Any] = {
            "content": content,
            "content_edit_mode": content_edit_mode,
            "content_format": content_format,
        }
        if title is not None: body["name"] = title
        if sub_title is not None: body["sub_title"] = sub_title
        data = await _request("PUT", f"/workspace/{workspace_id}/doc/{doc_id}/page/{page_id}", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Custom Fields ───────────────────────────────────────────────────────
@mcp.tool()
async def clickup_get_custom_fields(list_id: str) -> str:
    """Retrieves all accessible Custom Fields for a given List.

    Args:
        list_id: The ID of the List to get Custom Fields from.
    """
    try:
        data = await _request("GET", f"/list/{list_id}/field")
        return _ok(data.get("fields", []))
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_set_task_custom_field_value(
    task_id: str,
    field_id: str,
    value: str,
    time: bool = False,
) -> str:
    """Sets the value of a Custom Field on a specific task.

    Args:
        task_id: The ID of the task to update.
        field_id: The ID of the Custom Field to set.
        value: The value to set (as a string; for arrays use JSON like '["label1"]').
        time: For date fields: true to include time, false for date-only.
    """
    try:
        body: dict[str, Any] = {"value": value}
        if time:
            body["value_options"] = {"time": True}
        data = await _request("POST", f"/task/{task_id}/field/{field_id}", json_body=body)
        return _ok(data)
    except Exception as e:
        return _err(str(e))


@mcp.tool()
async def clickup_remove_task_custom_field_value(task_id: str, field_id: str) -> str:
    """Removes the value of a Custom Field from a specific task.

    Args:
        task_id: The ID of the task to update.
        field_id: The ID of the Custom Field to clear.
    """
    try:
        data = await _request("DELETE", f"/task/{task_id}/field/{field_id}")
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Boards ─────────────────────────────────────────────────────────────
@mcp.tool()
async def clickup_create_board(space_id: str, name: str) -> str:
    """Create a new board view in a ClickUp space.

    Args:
        space_id: The ID of the space to create the board view in.
        name: Name for the new board view.
    """
    try:
        data = await _request("POST", f"/space/{space_id}/view", json_body={
            "name": name, "type": "board",
        })
        return _ok(data)
    except Exception as e:
        return _err(str(e))


# ── Entrypoint ──────────────────────────────────────────────────────────
if __name__ == "__main__":
    mcp.run(transport="stdio")
