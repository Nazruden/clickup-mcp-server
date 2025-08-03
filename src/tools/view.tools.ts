import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  ClickUpView,
  GetViewsParams,
  CreateViewParams,
  GetViewDetailsParams,
  UpdateViewParams,
  DeleteViewParams,
  GetViewTasksParams,
  ClickUpViewParentType,
  ClickUpViewType,
} from "../types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Define the expected response structure for handleGetViewTasks
interface GetViewTasksToolResponse {
  tasks: any[]; // Using any[] as ClickUpTask type might not be directly needed here
  last_page: boolean;
}

// Common descriptions
const teamIdDescription = "The ID of the Workspace (Team).";
const spaceIdDescription = "The ID of the Space.";
const folderIdDescription = "The ID of the Folder.";
const listIdDescription = "The ID of the List.";
const viewIdDescription = "The ID of the View.";

// Tool Definitions
export const getViewsTool: Tool = {
  name: "clickup_get_views",
  description:
    "Retrieves all Views for a given parent (Team, Space, Folder, or List).",
  inputSchema: {
    type: "object",
    properties: {
      parent_id: {
        type: "string",
        description: "ID of the parent (Team, Space, Folder, or List).",
      },
      parent_type: {
        type: "string",
        enum: ["team", "space", "folder", "list"],
        description:
          "Type of the parent: 'team', 'space', 'folder', or 'list'.",
      },
    },
    required: ["parent_id", "parent_type"],
  },
  outputSchema: {
    type: "object",
    properties: {
      views: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            type: { type: "string" }
          }
        }
      }
    },
    description: "An object containing an array of view objects in the 'views' property.",
  },
};

export const createViewTool: Tool = {
  name: "clickup_create_view",
  description: "Creates a new View within a Team, Space, Folder, or List.",
  inputSchema: {
    type: "object",
    properties: {
      parent_id: {
        type: "string",
        description: "ID of the parent (Team, Space, Folder, or List).",
      },
      parent_type: {
        type: "string",
        enum: ["team", "space", "folder", "list"],
        description:
          "Type of the parent: 'team', 'space', 'folder', or 'list'.",
      },
      name: { type: "string", description: "Name of the new View." },
      type: {
        type: "string",
        enum: ["list", "board", "calendar", "gantt"],
        description: "Type of the View ('list', 'board', 'calendar', 'gantt').",
      },
      // Optional settings (grouping, sorting, filters, etc.) can be added here
      // based on the CreateViewParams type structure if needed for the tool
    },
    required: ["parent_id", "parent_type", "name", "type"],
  },
  outputSchema: {
    type: "object",
    properties: {
      view: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" }
        }
      }
    },
    description: "An object containing the created view object in the 'view' property.",
  },
};

export const getViewDetailsTool: Tool = {
  name: "clickup_get_view_details",
  description: "Retrieves details for a specific View.",
  inputSchema: {
    type: "object",
    properties: {
      view_id: { type: "string", description: viewIdDescription },
    },
    required: ["view_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      view: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" }
        }
      }
    },
    description: "An object containing the view details object in the 'view' property.",
  },
};

export const updateViewTool: Tool = {
  name: "clickup_update_view",
  description: "Updates an existing View. Note: ClickUp API v2 /view/{view_id} PUT endpoint currently has known issues (Internal Server Error).",
  inputSchema: {
    type: "object",
    properties: {
      view_id: { type: "string", description: viewIdDescription },
      name: { type: "string", description: "New name for the View." },
      // Add other updatable properties like settings if needed
    },
    required: ["view_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      view: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          type: { type: "string" }
        }
      }
    },
    description: "An object containing the updated view object in the 'view' property.",
  },
};

export const deleteViewTool: Tool = {
  name: "clickup_delete_view",
  description: "Deletes a View.",
  inputSchema: {
    type: "object",
    properties: {
      view_id: { type: "string", description: viewIdDescription },
    },
    required: ["view_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      success: { type: "boolean" }
    },
    description: "An object containing the deletion success status.",
  },
};

export const getViewTasksTool: Tool = {
  name: "clickup_get_view_tasks",
  description: "Retrieves tasks belonging to a specific View.",
  inputSchema: {
    type: "object",
    properties: {
      view_id: { type: "string", description: viewIdDescription },
      page: {
        type: "number",
        description: "Page number for pagination (starts at 0).",
      },
    },
    required: ["view_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      tasks: {
        type: "array",
        items: { type: "object" }
      },
      last_page: { type: "boolean" }
    },
    description: "An object containing the tasks array and pagination info.",
  },
};

// Handler Functions
export async function handleGetViews(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetViewsParams;
  if (
    !params.parent_id ||
    !params.parent_type ||
    !["team", "space", "folder", "list"].includes(params.parent_type)
  ) {
    throw new Error(
      "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required.",
    );
  }
  logger.info(
    `Handling tool call: ${getViewsTool.name} for ${params.parent_type} ${params.parent_id}`,
  );
  try {
    const views = await clickUpService.viewService.getViews(params);
    return {
      content: [
        {
          type: "text",
          text: `Retrieved ${views.length} views for ${params.parent_type} ${params.parent_id}. Details: ${JSON.stringify(views, null, 2)}`,
        },
      ],
      structuredContent: { views },
    };
  } catch (error) {
    logger.error(`Error in ${getViewsTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get views");
  }
}

export async function handleCreateView(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateViewParams;
  if (
    !params.parent_id ||
    !params.parent_type ||
    !["team", "space", "folder", "list"].includes(params.parent_type)
  ) {
    throw new Error(
      "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required.",
    );
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("View name is required.");
  }
  if (
    !params.type ||
    !["list", "board", "calendar", "gantt"].includes(params.type)
  ) {
    throw new Error(
      "View type ('list', 'board', 'calendar', 'gantt') is required.",
    );
  }
  logger.info(
    `Handling tool call: ${createViewTool.name} for ${params.parent_type} ${params.parent_id}`,
  );
  try {
    const newView = await clickUpService.viewService.createView(params);
    return {
      content: [
        {
          type: "text",
          text: `Successfully created view: ${newView.name}. Details: ${JSON.stringify(newView, null, 2)}`,
        },
      ],
      structuredContent: { view: newView },
    };
  } catch (error) {
    logger.error(`Error in ${createViewTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to create view");
  }
}

export async function handleGetViewDetails(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetViewDetailsParams;
  if (!params.view_id || typeof params.view_id !== "string") {
    throw new Error("View ID is required.");
  }
  logger.info(
    `Handling tool call: ${getViewDetailsTool.name} for view ${params.view_id}`,
  );
  try {
    const viewDetails = await clickUpService.viewService.getViewDetails(
      params.view_id,
    );
    return {
      content: [
        {
          type: "text",
          text: `Retrieved details for view: ${viewDetails.name}. Details: ${JSON.stringify(viewDetails, null, 2)}`,
        },
      ],
      structuredContent: { view: viewDetails },
    };
  } catch (error) {
    logger.error(`Error in ${getViewDetailsTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get view details");
  }
}

export async function handleUpdateView(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as UpdateViewParams;
  if (!params.view_id || typeof params.view_id !== "string") {
    throw new Error("View ID is required for update.");
  }

  // Validate that there are fields to update besides view_id
  const updateFields = { ...params };
  delete (updateFields as Partial<UpdateViewParams>).view_id; // Remove view_id for the check

  if (Object.keys(updateFields).length === 0) {
    throw new Error(
      "No fields provided to update the view (at least one updatable field like 'name' is required besides 'view_id').",
    );
  }

  logger.info(
    `Handling tool call: ${updateViewTool.name} for view ${params.view_id}`,
  );
  // ViewService.updateView expects the full UpdateViewParams object as a single argument
  try {
    const updatedView = await clickUpService.viewService.updateView(params);
    return {
      content: [
        {
          type: "text",
          text: `Successfully updated view: ${updatedView.name}. Details: ${JSON.stringify(updatedView, null, 2)}`,
        },
      ],
      structuredContent: { view: updatedView },
    };
  } catch (error) {
    logger.error(`Error in ${updateViewTool.name}:`, error);
    // Check if this is the known ClickUp API issue with view updates
    if (error instanceof Error && error.message.includes("Internal Server Error")) {
      throw new Error("ClickUp API limitation: View update endpoint currently returns Internal Server Error. This is a known issue with ClickUp's API v2 /view/{view_id} PUT endpoint.");
    }
    throw error instanceof Error ? error : new Error("Failed to update view");
  }
}

export async function handleDeleteView(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as DeleteViewParams;
  if (!params.view_id || typeof params.view_id !== "string") {
    throw new Error("View ID is required for deletion.");
  }
  logger.info(
    `Handling tool call: ${deleteViewTool.name} for view ${params.view_id}`,
  );
  try {
    await clickUpService.viewService.deleteView(params.view_id);
    return {
      content: [
        {
          type: "text",
          text: "View successfully deleted.",
        },
      ],
      structuredContent: { success: true },
    };
  } catch (error) {
    logger.error(`Error in ${deleteViewTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to delete view");
  }
}

export async function handleGetViewTasks(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetViewTasksParams;
  if (!params.view_id || typeof params.view_id !== "string") {
    throw new Error("View ID is required.");
  }
  if (params.page !== undefined) {
    if (
      typeof params.page !== "number" ||
      isNaN(params.page) ||
      params.page < 0
    ) {
      throw new Error("Page parameter must be a non-negative number.");
    }
  }

  logger.info(
    `Handling tool call: ${getViewTasksTool.name} for view ${params.view_id}, page: ${params.page}`,
  );
  try {
    const serviceResponse = await clickUpService.viewService.getViewTasks(params);
    const tasks = serviceResponse.tasks;

    return {
      content: [
        {
          type: "text",
          text: `Retrieved ${tasks.length} tasks for view ${params.view_id}. Page: ${params.page !== undefined ? params.page : "all/first"}. Last Page: ${serviceResponse.last_page}. Details: ${JSON.stringify(tasks, null, 2)}`,
        },
      ],
      structuredContent: { tasks: serviceResponse.tasks, last_page: serviceResponse.last_page },
    };
  } catch (error) {
    logger.error(`Error in ${getViewTasksTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get view tasks");
  }
}
