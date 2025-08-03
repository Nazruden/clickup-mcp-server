import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  GetFoldersParams,
  CreateFolderParams,
  UpdateFolderParams,
} from "../types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Common descriptions
const spaceIdDescription = "The ID of the Space to operate on.";
const folderIdDescription = "The ID of the Folder to operate on.";
const archivedDescription =
  "Whether to include archived items (true or false).";

// Tool Definitions
export const getFoldersTool: Tool = {
  name: "clickup_get_folders",
  description: "Retrieves all Folders within a given Space.",
  inputSchema: {
    type: "object",
    properties: {
      space_id: { type: "string", description: spaceIdDescription },
      archived: { type: "boolean", description: archivedDescription },
    },
    required: ["space_id"],
  },
};

export const createFolderTool: Tool = {
  name: "clickup_create_folder",
  description: "Creates a new Folder within a Space.",
  inputSchema: {
    type: "object",
    properties: {
      space_id: { type: "string", description: spaceIdDescription },
      name: { type: "string", description: "Name of the new Folder." },
    },
    required: ["space_id", "name"],
  },
};

export const getFolderTool: Tool = {
  name: "clickup_get_folder",
  description: "Retrieves details for a specific Folder.",
  inputSchema: {
    type: "object",
    properties: {
      folder_id: { type: "string", description: folderIdDescription },
    },
    required: ["folder_id"],
  },
};

export const updateFolderTool: Tool = {
  name: "clickup_update_folder",
  description: "Updates an existing Folder.",
  inputSchema: {
    type: "object",
    properties: {
      folder_id: { type: "string", description: folderIdDescription },
      name: { type: "string", description: "New name for the Folder." },
    },
    required: ["folder_id", "name"],
  },
};

export const deleteFolderTool: Tool = {
  name: "clickup_delete_folder",
  description: "Deletes a Folder.",
  inputSchema: {
    type: "object",
    properties: {
      folder_id: { type: "string", description: folderIdDescription },
    },
    required: ["folder_id"],
  },
};

// Handler Functions
export async function handleGetFolders(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetFoldersParams;
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required to get folders.");
  }
  logger.info(
    `Handling tool call: ${getFoldersTool.name} for space ${params.space_id}`,
  );
  const responseData = await clickUpService.folderService.getFolders(params);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(responseData.folders, null, 2),
      },
    ],
  };
}

export async function handleCreateFolder(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateFolderParams;
  if (!params.space_id || typeof params.space_id !== "string") {
    throw new Error("Space ID is required to create a folder.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("Folder name is required.");
  }
  logger.info(
    `Handling tool call: ${createFolderTool.name} for space ${params.space_id}, name ${params.name}`,
  );
  const responseData = await clickUpService.folderService.createFolder(params);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(responseData, null, 2),
      },
    ],
  };
}

export async function handleGetFolder(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as { folder_id: string };
  if (!params.folder_id || typeof params.folder_id !== "string") {
    throw new Error("Folder ID is required.");
  }
  logger.info(
    `Handling tool call: ${getFolderTool.name} for folder ${params.folder_id}`,
  );
  const responseData = await clickUpService.folderService.getFolder(
    params.folder_id,
  );
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(responseData, null, 2),
      },
    ],
  };
}

export async function handleUpdateFolder(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as UpdateFolderParams;
  if (!params.folder_id || typeof params.folder_id !== "string") {
    throw new Error("Folder ID is required for update.");
  }
  if (!params.name || typeof params.name !== "string") {
    // Assuming name is always required for update based on original handler
    throw new Error("Folder name is required for update.");
  }
  logger.info(
    `Handling tool call: ${updateFolderTool.name} for folder ${params.folder_id}`,
  );
  const responseData = await clickUpService.folderService.updateFolder(params);
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(responseData, null, 2),
      },
    ],
  };
}

export async function handleDeleteFolder(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as { folder_id: string };
  if (!params.folder_id || typeof params.folder_id !== "string") {
    throw new Error("Folder ID is required for deletion.");
  }
  logger.info(
    `Handling tool call: ${deleteFolderTool.name} for folder ${params.folder_id}`,
  );
  await clickUpService.folderService.deleteFolder(params.folder_id);
  return {
    content: [
      {
        type: "text",
        text: `Folder ${params.folder_id} deleted successfully.`,
      },
    ],
  };
}
