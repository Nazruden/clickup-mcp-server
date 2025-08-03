import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";
import { CreateViewParams, ClickUpView } from "../types.js";

// Tool Definition
const commonIdDescription =
  "The unique identifier for the resource in ClickUp.";
export const createBoardTool: Tool = {
  name: "clickup_create_board",
  description: "Create a new board view in a ClickUp space.", // Updated description
  inputSchema: {
    type: "object",
    properties: {
      space_id: {
        type: "string",
        description:
          "The ID of the space to create the board view in. " +
          commonIdDescription,
      },
      name: {
        type: "string",
        description: "Name for the new board view",
      },
    },
    required: ["space_id", "name"],
  },
  outputSchema: {
    type: "object",
    description: "A JSON string representing the created board view object.",
  },
};

// Type for arguments - align with creating a board view
interface CreateBoardArgs {
  space_id: string;
  name: string;
}

// Handler Function
export async function handleCreateBoard(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateBoardArgs;
  // Validate required parameters
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required and must be a string.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("Board name is required and must be a string.");
  }

  logger.info(
    `Handling tool call: ${createBoardTool.name} for space ${params.space_id}`,
  );
  try {
    // Correct implementation: Call createView with type 'board'
    const viewParams: CreateViewParams = {
      parent_id: params.space_id,
      parent_type: "space",
      name: params.name,
      type: "board", // Specify the view type as board
    };
    const newView: ClickUpView =
      await clickUpService.viewService.createView(viewParams);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(newView, null, 2),
        },
      ],
    };
  } catch (error) {
    logger.error(`Error in ${createBoardTool.name}:`, error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create board view");
  }
}
