import { Tool } from "@modelcontextprotocol/sdk/types.js";
import {
  SearchDocsParams,
  ClickUpDoc,
  CreateDocParams,
  GetDocPagesParams,
  ClickUpDocPage,
  CreateDocPageParams,
  GetDocPageContentParams,
  EditDocPageContentParams,
} from "../types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Common descriptions
const teamIdDescription = "The ID of the Workspace (Team) to operate on.";
const archivedDescription =
  "Whether to include archived items (true or false).";

// Tool Definitions
export const searchDocsTool: Tool = {
  name: "clickup_search_docs",
  description: "Searches for Docs within a Workspace (Team).",
  inputSchema: {
    type: "object",
    properties: {
      team_id: { type: "string", description: teamIdDescription },
      query: {
        type: "string",
        description: "Search string for Doc name/content.",
      },
      include_archived: { type: "boolean", description: archivedDescription },
    },
    required: ["team_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      docs: {
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
    description: "An object containing an array of doc objects in the 'docs' property.",
  },
};

export const createDocTool: Tool = {
  name: "clickup_create_doc",
  description: "Creates a new Doc within a Workspace.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description:
          "The ID of the Workspace (Team ID) where the Doc will be created. This corresponds to the team_id from get_teams.",
      },
      name: { type: "string", description: "Name of the new Doc." },
      parent: {
        type: "object",
        description:
          "Optional: The parent of the new Doc (e.g., another Doc, Space, Folder, List).",
        properties: {
          id: {
            type: "string",
            description: "ID of the parent resource.",
          },
          type: {
            type: "number",
            description:
              "Numeric type of the parent: 4 for Space, 5 for Folder, 6 for List, 7 for Everything (Workspace/Team level), 12 for Workspace (synonymous with 7 in this context often). If creating at workspace root, parent might not be needed or use type 7 or 12 with workspace ID.",
          },
        },
        required: ["id", "type"],
      },
      visibility: {
        type: "string",
        enum: ["PUBLIC", "PRIVATE", "PERSONAL", "HIDDEN"],
        description: "Optional: Visibility of the Doc. Must be one of: PUBLIC, PRIVATE, PERSONAL, HIDDEN.",
      },
      create_page: {
        type: "boolean",
        description:
          "Optional: Whether to automatically create an initial page within the new Doc. Defaults to true.",
      },
    },
    required: ["workspace_id", "name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      doc: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    description: "An object containing the created doc object in the 'doc' property.",
  },
};

export const getDocPagesTool: Tool = {
  name: "clickup_get_doc_pages",
  description: "Retrieves the list of pages within a specific Doc.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description: "The ID of the Workspace (Team ID) where the Doc resides.",
      },
      doc_id: { type: "string", description: "The ID of the Doc." },
    },
    required: ["workspace_id", "doc_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      pages: {
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
    description: "An object containing an array of page objects in the 'pages' property.",
  },
};

export const createDocPageTool: Tool = {
  name: "clickup_create_doc_page",
  description: "Creates a new page within a specific Doc.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description: "The ID of the Workspace (Team ID) where the Doc resides.",
      },
      doc_id: {
        type: "string",
        description: "The ID of the Doc to add the page to.",
      },
      name: {
        type: "string",
        description: "The name (title) of the new page.",
      },
      content: {
        type: "string",
        description: "Markdown content for the new page (optional).",
      },
      orderindex: {
        type: "number",
        description:
          "Position of the page in the Doc structure (optional). Note: Not used in v3 create page API.",
      },
      parent_page_id: {
        type: "string",
        description:
          "Optional: The ID of the parent page to nest this page under.",
      },
      sub_title: {
        type: "string",
        description: "Optional: The subtitle of the new page.",
      },
      content_format: {
        type: "string",
        description:
          "Optional: The format of the page content (e.g., 'text/md', 'text/plain'). Defaults to 'text/md'.",
      },
    },
    required: ["workspace_id", "doc_id", "name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      page: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    description: "An object containing the created page object in the 'page' property.",
  },
};

export const getDocPageContentTool: Tool = {
  name: "clickup_get_doc_page_content",
  description: "Retrieves the content (Markdown) of a specific Doc page.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description: "The ID of the Workspace (Team ID) where the Doc resides.",
      },
      doc_id: {
        type: "string",
        description: "The ID of the Doc containing the page.",
      },
      page_id: { type: "string", description: "The ID of the page." },
      content_format: {
        type: "string",
        description:
          "Optional: The format to return the page content in (e.g., 'text/md', 'text/plain'). Defaults to 'text/md'.",
      },
    },
    required: ["workspace_id", "doc_id", "page_id"],
  },
  outputSchema: {
    type: "object",
    properties: {
      content: { type: "string" },
      page: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      }
    },
    description: "An object containing the page content and metadata.",
  },
};

export const editDocPageContentTool: Tool = {
  name: "clickup_edit_doc_page_content",
  description: "Updates the content and/or title of a specific Doc page.",
  inputSchema: {
    type: "object",
    properties: {
      workspace_id: {
        type: "string",
        description: "The ID of the Workspace (Team ID) where the Doc resides.",
      },
      doc_id: {
        type: "string",
        description: "The ID of the Doc containing the page.",
      },
      page_id: { type: "string", description: "The ID of the page to update." },
      content: {
        type: "string",
        description: "The new Markdown content for the page.",
      },
      title: {
        type: "string",
        description:
          "The new title for the page (optional, maps to API 'name').",
      },
      sub_title: {
        type: "string",
        description: "Optional: The new subtitle for the page.",
      },
      content_edit_mode: {
        type: "string",
        enum: ["replace", "append", "prepend"],
        description:
          "Optional: Strategy for updating content (default: replace).",
      },
      content_format: {
        type: "string",
        description:
          "Optional: Format of the page content (e.g., 'text/md', default: text/md).",
      },
    },
    required: ["workspace_id", "doc_id", "page_id", "content"],
  },
  outputSchema: {
    type: "object",
    properties: {
      page: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" }
        }
      },
      success: { type: "boolean" }
    },
    description: "An object containing the updated page object and success status.",
  },
};

// Handler Functions
export async function handleSearchDocs(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as SearchDocsParams;
  if (!params.team_id || typeof params.team_id !== "string") {
    throw new Error("Team ID is required.");
  }
  logger.info(
    `Handling tool call: ${searchDocsTool.name} for team ${params.team_id}`,
  );
  try {
    const docs = await clickUpService.docService.searchDocs(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(docs, null, 2),
        },
      ],
      structuredContent: { docs },
    };
  } catch (error) {
    logger.error(`Error in ${searchDocsTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to search docs");
  }
}

export async function handleCreateDoc(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateDocParams;
  if (!params.workspace_id || typeof params.workspace_id !== "string") {
    throw new Error("Workspace ID is required to create a doc.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("Doc name is required.");
  }
  logger.info(
    `Handling tool call: ${createDocTool.name} for workspace ${params.workspace_id} with name ${params.name}`,
  );
  try {
    const newDoc = await clickUpService.docService.createDoc(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(newDoc, null, 2),
        },
      ],
      structuredContent: { doc: newDoc },
    };
  } catch (error) {
    logger.error(`Error in ${createDocTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to create doc");
  }
}

export async function handleGetDocPages(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetDocPagesParams;
  if (!params.doc_id || typeof params.doc_id !== "string") {
    throw new Error("Doc ID is required.");
  }
  logger.info(
    `Handling tool call: ${getDocPagesTool.name} for doc ${params.doc_id}`,
  );
  try {
    const pages = await clickUpService.docService.getDocPages(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(pages, null, 2),
        },
      ],
      structuredContent: { pages },
    };
  } catch (error) {
    logger.error(`Error in ${getDocPagesTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get doc pages");
  }
}

export async function handleCreateDocPage(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as CreateDocPageParams;
  if (!params.workspace_id || typeof params.workspace_id !== "string") {
    throw new Error("Workspace ID is required for createDocPage tool.");
  }
  if (!params.doc_id || typeof params.doc_id !== "string") {
    throw new Error("Doc ID is required.");
  }
  if (!params.name || typeof params.name !== "string") {
    throw new Error("Page name (title) is required.");
  }
  logger.info(
    `Handling tool call: ${createDocPageTool.name} for doc ${params.doc_id} in workspace ${params.workspace_id}`,
  );
  try {
    const newPage = await clickUpService.docService.createDocPage(params);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(newPage, null, 2),
        },
      ],
      structuredContent: { page: newPage },
    };
  } catch (error) {
    logger.error(`Error in ${createDocPageTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to create doc page");
  }
}

export async function handleGetDocPageContent(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as GetDocPageContentParams;
  if (!params.workspace_id || typeof params.workspace_id !== "string") {
    throw new Error("Workspace ID is required for getDocPageContent tool.");
  }
  if (!params.doc_id || typeof params.doc_id !== "string") {
    throw new Error("Doc ID is required for getDocPageContent tool.");
  }
  if (!params.page_id || typeof params.page_id !== "string") {
    throw new Error("Page ID is required.");
  }
  logger.info(
    `Handling tool call: ${getDocPageContentTool.name} for page ${params.page_id} in doc ${params.doc_id}, workspace ${params.workspace_id}`,
  );
  try {
    const pageContent = await clickUpService.docService.getDocPageContent(params);
    return {
      content: [
        {
          type: "text",
          text:
            typeof pageContent === "string"
              ? pageContent
              : JSON.stringify(pageContent, null, 2),
        },
      ],
      structuredContent: { 
        content: typeof pageContent === "string" ? pageContent : pageContent,
        page: { id: params.page_id, name: "Page Content" }
      },
    };
  } catch (error) {
    logger.error(`Error in ${getDocPageContentTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get doc page content");
  }
}

export async function handleEditDocPageContent(
  clickUpService: ClickUpService,
  args: Record<string, unknown>,
) {
  const params = args as unknown as EditDocPageContentParams;
  if (!params.workspace_id || typeof params.workspace_id !== "string") {
    throw new Error("Workspace ID is required for editDocPageContent tool.");
  }
  if (!params.doc_id || typeof params.doc_id !== "string") {
    throw new Error("Doc ID is required for editDocPageContent tool.");
  }
  if (!params.page_id || typeof params.page_id !== "string") {
    throw new Error("Page ID is required.");
  }
  if (params.content === undefined) {
    throw new Error("Content is required to edit a doc page.");
  }
  logger.info(
    `Handling tool call: ${editDocPageContentTool.name} for page ${params.page_id} in doc ${params.doc_id}, workspace ${params.workspace_id}`,
  );
  try {
    await clickUpService.docService.editDocPageContent(params);
    return {
      content: [
        {
          type: "text",
          text: `Successfully edited page ${params.page_id}.`,
        },
      ],
      structuredContent: { 
        page: { id: params.page_id, name: params.title || "Updated Page" },
        success: true 
      },
    };
  } catch (error) {
    logger.error(`Error in ${editDocPageContentTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to edit doc page content");
  }
}

export const docTools = [
  searchDocsTool,
  createDocTool,
  getDocPagesTool,
  createDocPageTool,
  getDocPageContentTool,
  editDocPageContentTool,
];
