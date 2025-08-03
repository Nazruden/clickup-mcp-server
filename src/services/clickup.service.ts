import axios, {
  AxiosInstance,
  AxiosError,
  AxiosHeaders,
  RawAxiosRequestHeaders,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
// Encryption is optional now, only if we want to encrypt the token at rest (less critical than OAuth tokens)
// import { encrypt, decrypt } from "../security.js";
import { logger } from "../logger.js";
// Import the refactored config
import { config } from "../config/app.config.js";
import {
  ClickUpTask,
  ClickUpList,
  ClickUpBoard,
  ClickUpTeam,
  GetSpacesParams,
  ClickUpSpace,
  CreateSpaceParams,
  UpdateSpaceParams,
  ClickUpSuccessResponse,
  // Folder Types
  GetFoldersParams,
  ClickUpFolder,
  CreateFolderParams,
  UpdateFolderParams,
  // DeleteFolderParams is not directly used by method signature but good to have for completeness
  // Custom Field Types
  ClickUpCustomField,
  SetTaskCustomFieldValueParams,
  RemoveTaskCustomFieldValueParams,
  // Doc Types
  ClickUpDoc,
  SearchDocsParams,
  CreateDocParams,
  ClickUpDocPage,
  GetDocPagesParams,
  CreateDocPageParams,
  GetDocPageContentParams,
  EditDocPageContentParams,
  // View Types
  ClickUpView,
  GetViewsParams,
  ClickUpViewParentType,
} from "../types.js"; // Keep ClickUpTeam for API v2 responses
// Import new resource services
import { TaskService } from "./resources/task.service.js";
import { SpaceService } from "./resources/space.service.js";
import { FolderService } from "./resources/folder.service.js";
import { CustomFieldService } from "./resources/custom-field.service.js";
import { DocService } from "./resources/doc.service.js";
import { ViewService } from "./resources/view.service.js";
import { ListService } from "./resources/list.service.js";

// Remove TokenData interface if not used elsewhere (it was removed from types.ts)

export class ClickUpService {
  private client: AxiosInstance;
  // Remove tokenStore
  // private tokenStore: Map<string, string>;
  private personalToken: string; // Store the personal token

  // Resource service instances
  private _taskService: TaskService;
  private _spaceService: SpaceService;
  private _folderService: FolderService;
  private _customFieldService: CustomFieldService;
  private _docService: DocService;
  private _viewService: ViewService;
  private _listService: ListService;
  // Add other resource services here later

  constructor() {
    // Remove tokenStore initialization
    // this.tokenStore = new Map();

    // Store the personal token from config
    this.personalToken = config.clickUpPersonalToken;
    if (!this.personalToken) {
      // This should be caught by config validation, but double-check
      throw new Error(
        "ClickUp Personal API Token is missing in configuration.",
      );
    }

    this.client = axios.create({
      // Use the specific API URL from the refactored config
      baseURL: config.clickUpApiUrl,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add REQUEST interceptor for Authorization header
    this.client.interceptors.request.use(
      (axiosConfig) => {
        // Add Authorization header using the stored personal token
        axiosConfig.headers.Authorization = `${this.personalToken}`;
        // It seems ClickUp API uses the token directly, not "Bearer " prefix for personal tokens
        // axiosConfig.headers.Authorization = `Bearer ${this.personalToken}`;
        logger.debug("Added Authorization header to ClickUp request.");
        return axiosConfig;
      },
      (error) => {
        logger.error("Error adding Authorization header:", error);
        return Promise.reject(error);
      },
    );

    // Keep existing response interceptor for rate limiting
    this.client.interceptors.response.use(
      (response) => {
        // ... rate limit logging ...
        const remaining = parseInt(
          response.headers["x-ratelimit-remaining"] || "100",
        );
        const reset = parseInt(response.headers["x-ratelimit-reset"] || "0");
        logger.debug(
          `Rate limit: ${remaining} requests remaining, reset in ${reset}s`,
        );
        return response;
      },
      (error: AxiosError) => {
        // ... rate limit error handling ...
        if (error.response?.status === 429) {
          logger.warn("Rate limit exceeded");
        }
        return Promise.reject(error);
      },
    );

    // Instantiate resource services
    this._taskService = new TaskService(this.client);
    this._spaceService = new SpaceService(this.client);
    this._folderService = new FolderService(this.client);
    this._customFieldService = new CustomFieldService(this.client);
    this._docService = new DocService(this.client);
    this._viewService = new ViewService(this.client);
    this._listService = new ListService(this.client);
    // Instantiate other services here later

    logger.info("ClickUpService initialized with all resource services.");
  }

  // Public accessors for resource services
  public get taskService(): TaskService {
    return this._taskService;
  }
  public get spaceService(): SpaceService {
    return this._spaceService;
  }
  public get folderService(): FolderService {
    return this._folderService;
  }
  public get customFieldService(): CustomFieldService {
    return this._customFieldService;
  }
  public get docService(): DocService {
    return this._docService;
  }
  public get viewService(): ViewService {
    return this._viewService;
  }
  public get listService(): ListService {
    return this._listService;
  }
  // Add other accessors here later

  // Remove getToken method
  // private async getToken(...) { ... }

  // Remove refreshToken method
  // private async refreshToken(...) { ... }

  // Remove setToken method
  // setToken(...) { ... }

  // Keep getRequestConfig (or simplify if only headers needed)
  private async getRequestConfig(): Promise<AxiosRequestConfig> {
    // No longer need to set Content-Type here if set in defaults
    // and Authorization is handled by interceptor
    return {}; // Return empty config, interceptor handles auth
  }

  // Remove createTask method (delegated)
  // async createTask(taskData: ClickUpTask): Promise<ClickUpTask> { ... }

  // Remove updateTask method (delegated)
  // async updateTask(...) : Promise<ClickUpTask> { ... }

  // Get current user info which includes workspace information
    async getTeams(): Promise<ClickUpTeam[]> {
    try {
      // Use the correct endpoint to get workspaces/teams
      const response = await this.client.get("/v2/team", {});

      // Return teams directly from response
      if (!response.data || !response.data.teams) {
        logger.warn("No teams found in response");
        return [];
      }

      return response.data.teams;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to get teams: ${error.message}`);
      }
      throw new Error("Failed to retrieve teams from ClickUp");
    }
  }

  // Remove userId parameter
  async getLists(folderId: string): Promise<ClickUpList[]> {
    try {
      // Interceptor will add auth header
      const response = await this.client.get(
        `/v2/folder/${folderId}/list`,
        {},
      );
      return response.data.lists;
    } catch (error) {
      // ... existing error handling ...
      if (error instanceof Error) {
        logger.error(`Failed to get lists: ${error.message}`);
      }
      throw new Error("Failed to retrieve lists from ClickUp");
    }
  }

  // Remove userId parameter
  async createBoard(boardData: ClickUpBoard): Promise<ClickUpBoard> {
    try {
      // Interceptor will add auth header
      const response = await this.client.post(
        // Ensure space_id is present
        `/v2/space/${boardData.space_id}/board`,
        boardData,
        {},
      );
      return response.data;
    } catch (error) {
      // ... existing error handling ...
      if (error instanceof Error) {
        logger.error(`Failed to create board: ${error.message}`);
      }
      throw new Error("Failed to create board in ClickUp");
    }
  }

  // REMOVE View Methods if they were here, or ensure class ends correctly
  // async getViews(...) { ... }
}
