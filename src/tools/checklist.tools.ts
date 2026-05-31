import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

export const getTaskChecklistsTool: Tool = {
  name: "clickup_get_task_checklists",
  description:
    "Retrieve all checklists (with their items) for a specific ClickUp task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The unique identifier of the ClickUp task.",
      },
    },
    required: ["task_id"],
  },
};

export const createChecklistTool: Tool = {
  name: "clickup_create_checklist",
  description: "Create a new checklist on a ClickUp task.",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "The unique identifier of the ClickUp task.",
      },
      name: {
        type: "string",
        description: "The name of the checklist to create.",
      },
    },
    required: ["task_id", "name"],
  },
};

export const updateChecklistTool: Tool = {
  name: "clickup_update_checklist",
  description: "Rename or reorder an existing ClickUp checklist.",
  inputSchema: {
    type: "object",
    properties: {
      checklist_id: {
        type: "string",
        description: "The unique identifier of the checklist.",
      },
      name: {
        type: "string",
        description: "New name for the checklist.",
      },
      position: {
        type: "number",
        description: "New position (order index) for the checklist.",
      },
    },
    required: ["checklist_id"],
  },
};

export const deleteChecklistTool: Tool = {
  name: "clickup_delete_checklist",
  description: "Delete a ClickUp checklist and all of its items.",
  inputSchema: {
    type: "object",
    properties: {
      checklist_id: {
        type: "string",
        description: "The unique identifier of the checklist to delete.",
      },
    },
    required: ["checklist_id"],
  },
};

export const createChecklistItemTool: Tool = {
  name: "clickup_create_checklist_item",
  description: "Add a new item to a ClickUp checklist.",
  inputSchema: {
    type: "object",
    properties: {
      checklist_id: {
        type: "string",
        description: "The unique identifier of the checklist.",
      },
      name: {
        type: "string",
        description: "The text of the checklist item.",
      },
      assignee: {
        type: "string",
        description: "Optional ClickUp user ID to assign the item to.",
      },
    },
    required: ["checklist_id", "name"],
  },
};

export const updateChecklistItemTool: Tool = {
  name: "clickup_update_checklist_item",
  description:
    "Update a checklist item: rename, mark resolved/unresolved, or nest under a parent item.",
  inputSchema: {
    type: "object",
    properties: {
      checklist_id: {
        type: "string",
        description: "The unique identifier of the checklist.",
      },
      checklist_item_id: {
        type: "string",
        description: "The unique identifier of the checklist item.",
      },
      name: {
        type: "string",
        description: "New text for the checklist item.",
      },
      resolved: {
        type: "boolean",
        description:
          "Mark the item as resolved (true) or unresolved (false). Use true to check off an item.",
      },
      parent: {
        type: "string",
        description:
          "ID of another checklist item to nest this item under (or null to un-nest).",
      },
    },
    required: ["checklist_id", "checklist_item_id"],
  },
};

export const deleteChecklistItemTool: Tool = {
  name: "clickup_delete_checklist_item",
  description: "Delete an item from a ClickUp checklist.",
  inputSchema: {
    type: "object",
    properties: {
      checklist_id: {
        type: "string",
        description: "The unique identifier of the checklist.",
      },
      checklist_item_id: {
        type: "string",
        description: "The unique identifier of the checklist item to delete.",
      },
    },
    required: ["checklist_id", "checklist_item_id"],
  },
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function textResult(payload: unknown, structuredKey: string) {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: { [structuredKey]: payload },
  };
}

function requireString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (!value || typeof value !== "string") {
    throw new Error(`${key} is required and must be a string.`);
  }
  return value;
}

export async function handleGetTaskChecklists(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const taskId = requireString(args, "task_id");
  logger.info(
    `Handling tool call: ${getTaskChecklistsTool.name} for task ${taskId}`,
  );
  const checklists =
    await clickUpService.checklistService.getTaskChecklists(taskId);
  return textResult(checklists, "checklists");
}

export async function handleCreateChecklist(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const taskId = requireString(args, "task_id");
  const name = requireString(args, "name");
  logger.info(
    `Handling tool call: ${createChecklistTool.name} for task ${taskId}`,
  );
  const result = await clickUpService.checklistService.createChecklist(
    taskId,
    name,
  );
  return textResult(result, "checklist");
}

export async function handleUpdateChecklist(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const checklistId = requireString(args, "checklist_id");
  const payload: any = {};
  if (args.name !== undefined) payload.name = args.name;
  if (args.position !== undefined) payload.position = args.position;
  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided to update the checklist.");
  }
  logger.info(
    `Handling tool call: ${updateChecklistTool.name} for checklist ${checklistId}`,
  );
  const result = await clickUpService.checklistService.updateChecklist(
    checklistId,
    payload,
  );
  return textResult(result, "checklist");
}

export async function handleDeleteChecklist(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const checklistId = requireString(args, "checklist_id");
  logger.info(
    `Handling tool call: ${deleteChecklistTool.name} for checklist ${checklistId}`,
  );
  const result =
    await clickUpService.checklistService.deleteChecklist(checklistId);
  return textResult(result, "result");
}

export async function handleCreateChecklistItem(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const checklistId = requireString(args, "checklist_id");
  const name = requireString(args, "name");
  const payload: any = { name };
  if (args.assignee !== undefined) payload.assignee = args.assignee;
  logger.info(
    `Handling tool call: ${createChecklistItemTool.name} for checklist ${checklistId}`,
  );
  const result = await clickUpService.checklistService.createChecklistItem(
    checklistId,
    payload,
  );
  return textResult(result, "checklist");
}

export async function handleUpdateChecklistItem(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const checklistId = requireString(args, "checklist_id");
  const itemId = requireString(args, "checklist_item_id");
  const payload: any = {};
  if (args.name !== undefined) payload.name = args.name;
  if (args.resolved !== undefined) payload.resolved = args.resolved;
  if (args.parent !== undefined) payload.parent = args.parent;
  if (Object.keys(payload).length === 0) {
    throw new Error("No fields provided to update the checklist item.");
  }
  logger.info(
    `Handling tool call: ${updateChecklistItemTool.name} for item ${itemId}`,
  );
  const result = await clickUpService.checklistService.updateChecklistItem(
    checklistId,
    itemId,
    payload,
  );
  return textResult(result, "checklist");
}

export async function handleDeleteChecklistItem(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const checklistId = requireString(args, "checklist_id");
  const itemId = requireString(args, "checklist_item_id");
  logger.info(
    `Handling tool call: ${deleteChecklistItemTool.name} for item ${itemId}`,
  );
  const result = await clickUpService.checklistService.deleteChecklistItem(
    checklistId,
    itemId,
  );
  return textResult(result, "result");
}
