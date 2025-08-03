import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  ClickUpSpace,
  GetSpacesParams,
  CreateSpaceParams,
  UpdateSpaceParams,
} from "../types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Common descriptions (copied from original index.ts)
const teamIdDescription = "The ID of the Workspace (Team) to operate on.";
const spaceIdDescription = "The ID of the Space to operate on.";
const archivedDescription =
  "Whether to include archived items (true or false).";

// Tool Definitions
export const getSpacesTool: Tool = {
  name: "clickup_get_spaces",
  description: "Retrieves all Spaces for a given Workspace (Team).",
  inputSchema: {
    type: "object",
    properties: {
      team_id: { type: "string", description: teamIdDescription },
      archived: { type: "boolean", description: archivedDescription },
    },
    required: ["team_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      spaces: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" }
          }
        }
      }
    },
    description: "An object containing an array of space objects in the 'spaces' property.",
  },
};

export const createSpaceTool: Tool = {
  name: "clickup_create_space",
  description: "Creates a new Space within a Workspace.",
  inputSchema: {
    type: "object",
    properties: {
      team_id: { type: "string", description: teamIdDescription },
      name: { type: "string", description: "Name of the new Space." },
      multiple_assignees: {
        type: "boolean",
        description: "Allow multiple assignees for tasks in this Space.",
      },
      features: {
        type: "object",
        description:
          "Object defining features to enable/disable for the Space.",
      },
    },
    required: ["team_id", "name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      space: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    description: "An object containing the created space object in the 'space' property.",
  },
};

export const getSpaceTool: Tool = {
  name: "clickup_get_space",
  description: "Retrieves details for a specific Space.",
  inputSchema: {
    type: "object",
    properties: {
      space_id: { type: "string", description: spaceIdDescription },
    },
    required: ["space_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      space: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    description: "An object containing the space object in the 'space' property.",
  },
};

export const updateSpaceTool: Tool = {
  name: "clickup_update_space",
  description: "Updates an existing Space.",
  inputSchema: {
    type: "object",
    properties: {
      space_id: { type: "string", description: spaceIdDescription },
      name: { type: "string", description: "New name for the Space." },
      color: {
        type: "string",
        description: "New color for the Space (hex or name).",
      },
      private: {
        type: "boolean",
        description: "Set Space visibility to private.",
      },
      admin_can_manage: {
        type: "boolean",
        description: "Allow admins to manage the Space.",
      },
      archived: {
        type: "boolean",
        description: "Archive or unarchive the Space.",
      },
      features: {
        type: "object",
        description: "Object defining features to update for the Space.",
      },
    },
    required: ["space_id"],
  },
};

export const deleteSpaceTool: Tool = {
  name: "clickup_delete_space",
  description: "Deletes a Space.",
  inputSchema: {
    type: "object",
    properties: {
      space_id: { type: "string", description: spaceIdDescription },
    },
    required: ["space_id"],
  },
};

// Handler Functions
export async function handleGetSpaces(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetSpacesParams;
  if (!params.team_id || typeof params.team_id !== "string") {
    throw new Error("Team ID (Workspace ID) is required.");
  }
  logger.info(
    `Handling tool call: ${getSpacesTool.name} for team ${params.team_id}`,
  );
  try {
    const responseData = await clickUpService.spaceService.getSpaces(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData.spaces, null, 2),
        },
      ],
      structuredContent: { spaces: responseData.spaces },
    };
  } catch (error) {
    logger.error(`Error in ${getSpacesTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get spaces");
  }
}

export async function handleCreateSpace(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateSpaceParams;
  if (!params.team_id || typeof params.team_id !== "string") {
    throw new Error("Team ID (Workspace ID) is required.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("Space name is required.");
  }
  logger.info(
    `Handling tool call: ${createSpaceTool.name} for team ${params.team_id}, name ${params.name}`,
  );
  try {
    const responseData = await clickUpService.spaceService.createSpace(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData, null, 2),
        },
      ],
      structuredContent: { space: responseData },
    };
  } catch (error) {
    logger.error(`Error in ${createSpaceTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to create space");
  }
}

export async function handleGetSpace(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as { space_id: string };
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required.");
  }
  logger.info(
    `Handling tool call: ${getSpaceTool.name} for space ${params.space_id}`,
  );
  try {
    const responseData = await clickUpService.spaceService.getSpace(
      params.space_id,
    );
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData, null, 2),
        },
      ],
      structuredContent: { space: responseData },
    };
  } catch (error) {
    logger.error(`Error in ${getSpaceTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get space");
  }
}

export async function handleUpdateSpace(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as UpdateSpaceParams;
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required for update.");
  }
  const { space_id, ...updateFields } = params;
  if (Object.keys(updateFields).length === 0) {
    throw new Error("No update fields provided for space.");
  }
  logger.info(
    `Handling tool call: ${updateSpaceTool.name} for space ${params.space_id}`,
  );
  try {
    const responseData = await clickUpService.spaceService.updateSpace(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(responseData, null, 2),
        },
      ],
      structuredContent: { space: responseData },
    };
  } catch (error) {
    logger.error(`Error in ${updateSpaceTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to update space");
  }
}

export async function handleDeleteSpace(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as { space_id: string };
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required for deletion.");
  }
  logger.info(
    `Handling tool call: ${deleteSpaceTool.name} for space ${params.space_id}`,
  );
  try {
    await clickUpService.spaceService.deleteSpace(params.space_id);
    return {
      content: [
        {
          type: "text",
          text: `Space ${params.space_id} deleted successfully.`,
        },
      ],
      structuredContent: { result: { success: true, message: `Space ${params.space_id} deleted successfully.` } },
    };
  } catch (error) {
    logger.error(`Error in ${deleteSpaceTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to delete space");
  }
}
