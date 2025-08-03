import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import {
  ClickUpDoc,
  SearchDocsParams,
  CreateDocParams,
  ClickUpDocPage,
  GetDocPagesParams,
  CreateDocPageParams,
  GetDocPageContentParams,
  EditDocPageContentParams,
} from "../../types.js";

export class DocService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // Note: ClickUp Docs API has limitations and some parts might be v3.
  // We aim for v2 where possible, but functionality might be restricted.

  async searchDocs(params: SearchDocsParams): Promise<ClickUpDoc[]> {
    const { team_id, query, include_archived } = params;
    logger.debug(
      `Searching docs in workspace ID (v3): ${team_id} with query: "${query}"`,
    );

    const queryParams: Record<string, string | boolean | number> = {};

    if (query) {
      logger.warn(
        "The 'query' parameter for free-text search is not explicitly supported by the documented v3 /docs endpoint filters. " +
          "Consider using specific filters like 'id' or 'creator' if general search yields no results or errors.",
      );
    }
    if (include_archived !== undefined) {
      queryParams.archived = include_archived;
    }

    // const v3Url = `https://api.clickup.com/api/v3/workspaces/${team_id}/docs`;
    // Corrected path assuming baseURL is https://api.clickup.com/api/v2
    const v3Url = `/api/v3/workspaces/${team_id}/docs`;

    try {
      const response = await this.client.get<{ docs: ClickUpDoc[] }>(v3Url, {
        params: queryParams,
      });
      return response.data.docs;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error searching docs (v3) in workspace ${team_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url,
            params: queryParams,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error searching docs (v3) in workspace ${team_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to search docs in workspace ${team_id} from ClickUp (v3 attempt)`,
      );
    }
  }

  async createDoc(params: CreateDocParams): Promise<ClickUpDoc> {
    const { workspace_id, name, parent, visibility, create_page } = params;

    if (!workspace_id) {
      logger.error("createDoc service method requires workspace_id.");
      throw new Error(
        "workspace_id is required for creating a ClickUp Doc (v3).",
      );
    }
    const numericWorkspaceId = parseInt(workspace_id, 10);
    if (isNaN(numericWorkspaceId)) {
      logger.error(
        `Invalid workspace_id: '${workspace_id}' is not a valid number.`,
      );
      throw new Error(
        `Invalid workspace_id: '${workspace_id}' must be a numeric string.`,
      );
    }

    if (!name) {
      logger.error(
        "createDoc service method requires a name for the document.",
      );
      throw new Error("Document name is required for creating a ClickUp Doc.");
    }

    // const v3Url = `https://api.clickup.com/api/v3/workspaces/${numericWorkspaceId}/docs`;
    // Corrected path assuming baseURL is https://api.clickup.com/api/v2
    const v3Url = `/api/v3/workspaces/${numericWorkspaceId}/docs`;
    logger.debug(`Creating doc (v3) via ${v3Url} with name: "${name}"`);

    const requestBody: {
      name: string;
      parent?: { id: string; type: number };
      visibility?: string;
      create_page?: boolean;
    } = { name };

    if (parent && parent.id && typeof parent.type === "number") {
      requestBody.parent = parent;
    } else if (parent) {
      logger.warn(
        "Parent ID or type is missing/invalid for createDoc. Doc will be created without parent specified in API call.",
      );
    }

    if (visibility) {
      requestBody.visibility = visibility;
    }

    // Spec default is true, so if undefined, let API handle default.
    // Only include if explicitly false, or if true (to be explicit).
    if (create_page !== undefined) {
      requestBody.create_page = create_page;
    }

    try {
      const response = await this.client.post<ClickUpDoc>(
        v3Url,
        requestBody,
        {},
      );
      return response.data;
    } catch (error) {
      const scope = `workspace ${numericWorkspaceId}`;
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating doc (v3) for ${scope}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url,
            body: requestBody,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating doc (v3) for ${scope}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to create doc for ${scope} from ClickUp (v3 attempt using spec)`,
      );
    }
  }

  async getDocPages(params: GetDocPagesParams): Promise<ClickUpDocPage[]> {
    const { doc_id, workspace_id } = params;

    if (!workspace_id) {
      logger.error("getDocPages service method requires workspace_id.");
      throw new Error("workspace_id is required for getting Doc Pages (v3).");
    }
    const numericWorkspaceId = parseInt(workspace_id, 10);
    if (isNaN(numericWorkspaceId)) {
      logger.error(
        `Invalid workspace_id: '${workspace_id}' is not a valid number for getDocPages.`,
      );
      throw new Error(
        `Invalid workspace_id: '${workspace_id}' must be a numeric string.`,
      );
    }
    if (!doc_id) {
      logger.error("getDocPages service method requires doc_id.");
      throw new Error("doc_id is required for getting Doc Pages (v3).");
    }

    logger.debug(
      `Fetching pages for doc ID: ${doc_id} in workspace ID: ${numericWorkspaceId} (v3)`,
    );

    // const v3Url = `https://api.clickup.com/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages`;
    // Corrected path assuming baseURL is https://api.clickup.com/api/v2
    const v3Url = `/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages`;

    try {
      const response = await this.client.get<{ pages: ClickUpDocPage[] }>(
        v3Url,
        { params: {} },
      );
      return response.data.pages;
    } catch (error) {
      const scope = `doc ${doc_id} (workspace: ${numericWorkspaceId})`;
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching pages for ${scope} (v3): ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching pages for ${scope} (v3): ${error.message}`,
        );
      }
      throw new Error(
        `Failed to retrieve pages for ${scope} from ClickUp (v3 attempt)`,
      );
    }
  }

  async createDocPage(params: CreateDocPageParams): Promise<ClickUpDocPage> {
    const {
      workspace_id,
      doc_id,
      name,
      content,
      orderindex,
      parent_page_id,
      sub_title,
      content_format,
    } = params;

    if (!workspace_id) {
      logger.error("createDocPage service method requires workspace_id.");
      throw new Error("workspace_id is required for creating a Doc Page (v3).");
    }
    const numericWorkspaceId = parseInt(workspace_id, 10);
    if (isNaN(numericWorkspaceId)) {
      logger.error(
        `Invalid workspace_id: '${workspace_id}' is not a valid number for createDocPage.`,
      );
      throw new Error(
        `Invalid workspace_id: '${workspace_id}' must be a numeric string for createDocPage.`,
      );
    }
    if (!doc_id) {
      logger.error("createDocPage service method requires doc_id.");
      throw new Error("doc_id is required for creating a Doc Page (v3).");
    }

    logger.debug(
      `Creating page in doc ID: ${doc_id} (workspace: ${numericWorkspaceId}) with name: "${name}"`,
    );

    const v3Url = `/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages`;

    const requestBody: {
      name?: string;
      content?: string;
      parent_page_id?: string;
      sub_title?: string;
      content_format?: string;
    } = {};

    if (name !== undefined) requestBody.name = name;
    if (content !== undefined) requestBody.content = content;
    if (parent_page_id !== undefined)
      requestBody.parent_page_id = parent_page_id;
    if (sub_title !== undefined) requestBody.sub_title = sub_title;
    if (content_format !== undefined)
      requestBody.content_format = content_format;

    if (orderindex !== undefined) {
      logger.warn(
        `'orderindex' was provided for createDocPage (doc: ${doc_id}) but is not part of the v3 API spec request body. It will be ignored.`,
      );
    }

    try {
      const response = await this.client.post<ClickUpDocPage>(
        v3Url,
        requestBody,
        {},
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating page in doc ${doc_id} (workspace: ${numericWorkspaceId}): ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url,
            body: requestBody,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating page in doc ${doc_id} (workspace: ${numericWorkspaceId}): ${error.message}`,
        );
      }
      throw new Error(
        `Failed to create page in doc ${doc_id} (workspace: ${numericWorkspaceId}) in ClickUp (v3 attempt)`,
      );
    }
  }

  async getDocPageContent(params: GetDocPageContentParams): Promise<string> {
    const { workspace_id, doc_id, page_id, content_format } = params;

    if (!workspace_id) {
      logger.error("getDocPageContent service method requires workspace_id.");
      throw new Error(
        "workspace_id is required for getting Doc Page content (v3).",
      );
    }
    const numericWorkspaceId = parseInt(workspace_id, 10);
    if (isNaN(numericWorkspaceId)) {
      logger.error(
        `Invalid workspace_id: '${workspace_id}' for getDocPageContent.`,
      );
      throw new Error(
        `Invalid workspace_id: '${workspace_id}' must be numeric for getDocPageContent.`,
      );
    }
    if (!doc_id) {
      logger.error("getDocPageContent service method requires doc_id.");
      throw new Error("doc_id is required for getting Doc Page content (v3).");
    }
    if (!page_id) {
      logger.error("getDocPageContent service method requires page_id.");
      throw new Error("page_id is required for getting Doc Page content (v3).");
    }

    logger.debug(
      `Fetching content for page ID: ${page_id} in doc: ${doc_id}, workspace: ${numericWorkspaceId}`,
    );

    // const v3Url = `https://api.clickup.com/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages/${page_id}`;
    // Corrected path assuming baseURL is https://api.clickup.com/api/v2
    const v3Url = `/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages/${page_id}`;
    const queryParams: { content_format?: string } = {};
    if (content_format) {
      queryParams.content_format = content_format;
    }

    const specificErrorMsg = `Content not found or in unexpected format for page ${page_id} (doc: ${doc_id}, ws: ${numericWorkspaceId})`;

    try {
      // The v3 getPage endpoint returns a full ClickUpDocPage object.
      // We need to extract the 'content' field from it.
      const response = await this.client.get<ClickUpDocPage>(v3Url, {
        params: queryParams,
      });

      // According to v3 spec for getPage, response is a page object which has a 'content' field.
      // The GetDocPages (plural) v2 endpoint returned ClickUpDocPage[] which also had .content
      // The old /page/{page_id} also seemed to return a page object.
      if (response.data && typeof response.data.content === "string") {
        return response.data.content;
      } else if (response.data && response.data.content === null) {
        // If content is explicitly null, return empty string as per previous behavior
        return "";
      } else {
        logger.warn(
          `Content not found or not a string for page ${page_id} (doc: ${doc_id}, ws: ${numericWorkspaceId}). Response data: ${JSON.stringify(
            response.data,
          )}`,
        );
        throw new Error(specificErrorMsg);
      }
    } catch (error) {
      if (error instanceof Error && error.message === specificErrorMsg) {
        // Re-throw the specific error if it's the one we created
        throw error;
      }
      // Handle Axios errors or other generic errors
      const errorScope = `page ${page_id} (doc: ${doc_id}, ws: ${numericWorkspaceId})`;
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching content for ${errorScope}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url, // Use the actual v3Url in log
            params: queryParams,
          },
        );
      } else if (error instanceof Error) {
        // For other errors not matching specificErrorMsg
        logger.error(
          `Generic error fetching content for ${errorScope}: ${error.message}`,
        );
      }
      // Throw a generic error for issues not caught and re-thrown above
      throw new Error(
        `Failed to retrieve content for ${errorScope} from ClickUp (v3 attempt)`,
      );
    }
  }

  async editDocPageContent(
    params: EditDocPageContentParams,
  ): Promise<ClickUpDocPage> {
    const {
      workspace_id,
      doc_id,
      page_id,
      content,
      title,
      sub_title,
      content_edit_mode,
      content_format,
    } = params;

    if (!workspace_id) {
      logger.error("editDocPageContent service method requires workspace_id.");
      throw new Error(
        "workspace_id is required for editing Doc Page content (v3).",
      );
    }
    const numericWorkspaceId = parseInt(workspace_id, 10);
    if (isNaN(numericWorkspaceId)) {
      logger.error(
        `Invalid workspace_id: '${workspace_id}' for editDocPageContent.`,
      );
      throw new Error(
        `Invalid workspace_id: '${workspace_id}' must be numeric for editDocPageContent.`,
      );
    }
    if (!doc_id) {
      logger.error("editDocPageContent service method requires doc_id.");
      throw new Error("doc_id is required for editing Doc Page content (v3).");
    }
    if (!page_id) {
      logger.error("editDocPageContent service method requires page_id.");
      throw new Error("page_id is required for editing Doc Page content (v3).");
    }
    // Content is marked as optional in API spec for edit, but for our tool, it's required.
    // Title (name) is also optional in API spec.

    logger.debug(
      `Editing content for page ID: ${page_id} in doc: ${doc_id}, workspace: ${numericWorkspaceId}`,
    );

    // const v3Url = `https://api.clickup.com/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages/${page_id}`;
    // Corrected path assuming baseURL is https://api.clickup.com/api/v2
    const v3Url = `/api/v3/workspaces/${numericWorkspaceId}/docs/${doc_id}/pages/${page_id}`;

    const requestBody: {
      name?: string;
      content?: string;
      sub_title?: string;
      content_edit_mode?: "replace" | "append" | "prepend";
      content_format?: string;
    } = {};

    // Only include fields in the body if they are provided in params
    if (title !== undefined) requestBody.name = title; // Map title to name
    if (content !== undefined) requestBody.content = content; // Tool requires content
    if (sub_title !== undefined) requestBody.sub_title = sub_title;
    if (content_edit_mode !== undefined)
      requestBody.content_edit_mode = content_edit_mode;
    if (content_format !== undefined)
      requestBody.content_format = content_format;

    try {
      // The v3 editPage endpoint returns the updated page object according to spec.
      const response = await this.client.put<ClickUpDocPage>(
        v3Url,
        requestBody,
        {},
      );
      return response.data;
    } catch (error) {
      const errorScope = `page ${page_id} (doc: ${doc_id}, ws: ${numericWorkspaceId})`;
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error editing content for ${errorScope}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: v3Url, // Use the actual v3Url in log
            body: requestBody,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error editing content for ${errorScope}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to edit content for ${errorScope} in ClickUp (v3 attempt)`,
      );
    }
  }
}
