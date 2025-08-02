import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";
import { ClickUpList } from "../types.js";
import { CreateListParams, ClickUpListFull } from "../types.js";

// Tool Definition
const commonIdDescription =
  "The unique identifier for the resource in ClickUp.";
export const getListsTool: Tool = {
  name: "clickup_get_lists",
  description: "Get all lists in a specific folder.",
  inputSchema: {
    type: "object",
    properties: {
      folder_id: {
        type: "string",
        description:
          "The ID of the folder to get lists from. " + commonIdDescription,
      },
    },
    required: ["folder_id"],
  },
  outputSchema: {
    type: "object",
    description: "A JSON string representing an array of list objects.",
  },
};

export const createListTool: Tool = {
  name: "clickup_create_list",
  description: "Creates a new List within a Folder or Space.",
  inputSchema: {
    type: "object",
    properties: {
      parent_id: {
        type: "string",
        description: "The ID of the parent Folder or Space.",
      },
      parent_type: {
        type: "string",
        enum: ["folder", "space"],
        description: "The type of the parent: 'folder' or 'space'.",
      },
      name: { type: "string", description: "Name for the new List." },
      content: {
        type: "string",
        description: "Optional: Description for the List.",
      },
      due_date: {
        type: "number",
        description:
          "Optional: Due date for the list (Unix timestamp in milliseconds).",
      },
      due_date_time: {
        type: "boolean",
        description: "Optional: Set to true if due_date includes time.",
      },
      priority: {
        type: "number",
        description:
          "Optional: Default priority for tasks in the list (1-Urgent, 2-High, 3-Normal, 4-Low).",
      },
      assignee: {
        type: "number", // ClickUp API uses numeric user ID
        description:
          "Optional: Default assignee User ID for tasks in the list.",
      },
      status: {
        type: "string",
        description:
          "Optional: Default status for tasks created in this list (e.g., 'Open').",
      },
    },
    required: ["parent_id", "parent_type", "name"],
  },
};

// Type for arguments
interface GetListsArgs {
  folder_id: string;
}

// Handler Function
export async function handleGetLists(
  clickUpService: ClickUpService,
  args: Record<string, unknown>
) {
  const params = args as unknown as GetListsArgs;
  if (!params.folder_id || typeof params.folder_id !== "string") {
    throw new Error("Folder ID is required and must be a string.");
  }
  logger.info(
    `Handling tool call: ${getListsTool.name} for folder ${params.folder_id}`
  );
  try {
    // Assume getLists returns ClickUpList[] directly
    const lists = await clickUpService.getLists(params.folder_id);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(lists, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error(`Error in ${getListsTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get lists");
  }
}

export async function handleCreateList(
  clickUpService: ClickUpService,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  const params = args as unknown as CreateListParams;

  if (!params.parent_id || typeof params.parent_id !== "string") {
    throw new Error("Parent ID (folder_id or space_id) is required.");
  }
  if (
    !params.parent_type ||
    (params.parent_type !== "folder" && params.parent_type !== "space")
  ) {
    throw new Error("Parent type must be 'folder' or 'space'.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("List name is required.");
  }

  logger.info(
    `Handling tool call: ${createListTool.name} for ${params.parent_type} ${params.parent_id} with name ${params.name}`
  );

  try {
    const newList = await clickUpService.listService.createList(params);
    return {
      content: [
        {
          type: "text",
          text: `Successfully created list: ${newList.name} (ID: ${newList.id}). Details: ${JSON.stringify(newList, null, 2)}`,
        },
      ],
    };
  } catch (error) {
    logger.error(`Error in ${createListTool.name} handler:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error creating list.";
    return {
      content: [
        {
          type: "text",
          text: `Tool: ${createListTool.name}, Result: Error: ${errorMessage}`,
        },
      ],
    };
  }
}
