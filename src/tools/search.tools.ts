import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

export const searchTasksByTagsTool: Tool = {
  name: "clickup_search_tasks_by_tags",
  description:
    "Find tasks across a workspace that carry the given tag(s), using ClickUp's native server-side tag filter. Returns one page of compact task summaries. Note: ClickUp API v2 has no full-text task search, so free-text matching is not supported here.",
  inputSchema: {
    type: "object",
    properties: {
      tags: {
        type: "array",
        items: { type: "string" },
        description:
          "Tag names to filter by (a task matches if it has any of these tags).",
      },
      team_id: {
        type: "string",
        description:
          "Workspace (Team) ID to search in. If omitted, the first accessible workspace is used.",
      },
      statuses: {
        type: "array",
        items: { type: "string" },
        description: "Optional status names to further narrow the results.",
      },
      list_ids: {
        type: "array",
        items: { type: "string" },
        description: "Optional list IDs to restrict the search to.",
      },
      assignees: {
        type: "array",
        items: { type: "string" },
        description: "Optional assignee user IDs to filter by.",
      },
      include_closed: {
        type: "boolean",
        description: "If true, include closed tasks. Defaults to false.",
      },
      page: {
        type: "number",
        description: "0-indexed page of results (100 tasks per page).",
      },
    },
    required: ["tags"],
  },
};

export async function handleSearchTasksByTags(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const tags = args.tags;
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error("tags is required and must be a non-empty array.");
  }
  logger.info(
    `Handling tool call: ${searchTasksByTagsTool.name} for tags [${tags.join(", ")}]`,
  );
  const result = await clickUpService.searchService.searchTasksByTags({
    tags: tags as string[],
    team_id: args.team_id as string | undefined,
    statuses: args.statuses as string[] | undefined,
    list_ids: args.list_ids as string[] | undefined,
    assignees: args.assignees as string[] | undefined,
    include_closed: args.include_closed as boolean | undefined,
    page: args.page as number | undefined,
  });
  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    structuredContent: result,
  };
}
