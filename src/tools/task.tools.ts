import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpTask } from "../types.js";
import { ClickUpService } from "../services/clickup.service.js"; // Needed for handler types/access
import { logger } from "../logger.js";

// Schemas (Copied from original index.ts for relevance)
const commonIdDescription =
  "The unique identifier for the resource in ClickUp.";

const taskSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
      description: "The name of the task to be created.",
    },
    description: {
      type: "string",
      description:
        "A detailed description of the task. Supports ClickUp Flavored Markdown (e.g., for formatting, mentions).",
    },
    assignees: {
      type: "array",
      items: { type: "string" },
      description:
        "Array of user IDs (strings) for task assignees. These are ClickUp user IDs, typically numeric but represented as strings (e.g., ['123456', '789012']).",
    },
    status: {
      type: "string",
      description:
        "The target status for the task. This string must exactly match an existing status name in the target ClickUp list (e.g., 'Open', 'in progress', 'Client Review'). Statuses are case-sensitive. If unsure, verify available statuses in the list.",
    },
    priority: {
      type: "number",
      description:
        "Task priority level. Must be a number: 1 for Urgent, 2 for High, 3 for Normal, or 4 for Low. These correspond to ClickUp's standard priority flags.",
    },
    due_date: {
      type: "number",
      description:
        "The due date and time for the task, represented as the total number of milliseconds since the Unix epoch (January 1, 1970, 00:00:00 UTC). Example: 1672531200000 for Jan 1, 2023 00:00:00 UTC.",
    },
    time_estimate: {
      type: "number",
      description:
        "Estimated time to complete the task, in milliseconds. Example: 3600000 for 1 hour (60 * 60 * 1000).",
    },
    tags: {
      type: "array",
      items: { type: "string" },
      description: "Array of tag names",
    },
  },
  required: ["name"],
};

// Tool Definitions
export const createTaskTool: Tool = {
  name: "clickup_create_task",
  description: "Create a new task in ClickUp workspace",
  inputSchema: {
    type: "object",
    properties: {
      list_id: {
        type: "string",
        description:
          "The unique string identifier of the ClickUp list where the task will be created. This field is mandatory.",
      },
      name: {
        type: "string",
        description:
          "The name of the task to be created. This field is mandatory.",
      },
      description: taskSchema.properties.description,
      assignees: taskSchema.properties.assignees,
      status: taskSchema.properties.status,
      priority: taskSchema.properties.priority,
      due_date: taskSchema.properties.due_date,
      time_estimate: taskSchema.properties.time_estimate,
      tags: taskSchema.properties.tags,
    },
    required: ["list_id", "name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      task: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    description: "An object containing the created task object in the 'task' property.",
  },
};

export const updateTaskTool: Tool = {
  name: "clickup_update_task",
  description: "Update an existing task in ClickUp",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description:
          "The unique string identifier of the ClickUp task to be updated.",
      },
      ...taskSchema.properties,
    },
    required: ["task_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      task: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          status: { type: "string" }
        }
      }
    },
    description: "An object containing the updated task object in the 'task' property.",
  },
};

// Handler Functions
// These functions now accept the ClickUpService instance

// Interface for arguments expected by createTaskTool, based on its inputSchema
interface CreateTaskToolArgs {
  list_id: string;
  name: string;
  // All other fields are now optional for this test phase
  description?: string;
  assignees?: string[];
  status?: string;
  priority?: number;
  due_date?: number;
  time_estimate?: number;
  tags?: string[];
  [key: string]: any;
}

export async function handleCreateTask(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const toolArgs = args as CreateTaskToolArgs; // Cast to our defined interface

  // Basic validation for schema-defined required fields
  if (!toolArgs.list_id || typeof toolArgs.list_id !== "string") {
    throw new Error("List ID is required and must be a string.");
  }
  if (!toolArgs.name || typeof toolArgs.name !== "string") {
    throw new Error("Task name is required and must be a string.");
  }

  logger.info(
    `Handling tool call: ${createTaskTool.name} for list ${toolArgs.list_id}`,
  );

  // Construct the payload for ClickUpService, performing necessary transformations
  const servicePayload: ClickUpTask = {
    list_id: toolArgs.list_id,
    name: toolArgs.name,
    // No other fields will be set from toolArgs in this minimal test
  };

  // Optional fields from toolArgs, mapped to servicePayload
  if (toolArgs.description !== undefined)
    servicePayload.description = toolArgs.description;
  if (toolArgs.assignees !== undefined)
    servicePayload.assignees = toolArgs.assignees;
  if (toolArgs.status !== undefined) servicePayload.status = toolArgs.status;
  if (toolArgs.priority !== undefined)
    servicePayload.priority = toolArgs.priority;
  if (toolArgs.due_date !== undefined)
    servicePayload.due_date = String(toolArgs.due_date);
  if (toolArgs.time_estimate !== undefined)
    servicePayload.time_estimate = String(toolArgs.time_estimate);
  if (toolArgs.tags !== undefined) servicePayload.tags = toolArgs.tags;

  const response = await clickUpService.taskService.createTask(servicePayload);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
    structuredContent: { task: response },
  };
}

// Interface for arguments expected by updateTaskTool, based on its inputSchema
interface UpdateTaskToolArgs {
  task_id: string;
  name?: string;
  description?: string;
  assignees?: string[];
  status?: string;
  priority?: number;
  due_date?: number; // As per schema: number (milliseconds)
  time_estimate?: number; // As per schema: number (milliseconds)
  tags?: string[];
  // Allow other properties from taskSchema if they are added there
  [key: string]: any;
}

export async function handleUpdateTask(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const toolArgs = args as UpdateTaskToolArgs; // Cast to our defined interface

  if (!toolArgs.task_id || typeof toolArgs.task_id !== "string") {
    throw new Error("Task ID is required and must be a string.");
  }

  const { task_id, ...updateDataFromToolArgs } = toolArgs;

  // Construct the payload for ClickUpService, performing necessary transformations
  const servicePayloadUpdate: Partial<ClickUpTask> = {};

  // Map defined fields from toolArgs to servicePayloadUpdate
  if (updateDataFromToolArgs.name !== undefined)
    servicePayloadUpdate.name = updateDataFromToolArgs.name;
  if (updateDataFromToolArgs.description !== undefined)
    servicePayloadUpdate.description = updateDataFromToolArgs.description;
  if (updateDataFromToolArgs.assignees !== undefined)
    servicePayloadUpdate.assignees = updateDataFromToolArgs.assignees;
  if (updateDataFromToolArgs.status !== undefined)
    servicePayloadUpdate.status = updateDataFromToolArgs.status;
  if (updateDataFromToolArgs.priority !== undefined)
    servicePayloadUpdate.priority = updateDataFromToolArgs.priority;
  if (updateDataFromToolArgs.tags !== undefined)
    servicePayloadUpdate.tags = updateDataFromToolArgs.tags;

  // Convert numeric timestamps from schema to string for ClickUpTask type
  if (updateDataFromToolArgs.due_date !== undefined) {
    servicePayloadUpdate.due_date = String(updateDataFromToolArgs.due_date);
  }
  if (updateDataFromToolArgs.time_estimate !== undefined) {
    servicePayloadUpdate.time_estimate = String(
      updateDataFromToolArgs.time_estimate,
    );
  }

  // Ensure there's something to update
  if (Object.keys(servicePayloadUpdate).length === 0) {
    throw new Error("No fields provided to update the task.");
  }

  logger.info(`Handling tool call: ${updateTaskTool.name} for task ${task_id}`);
  const response = await clickUpService.taskService.updateTask(
    task_id,
    servicePayloadUpdate,
  );
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(response, null, 2),
      },
    ],
    structuredContent: { task: response },
  };
}
