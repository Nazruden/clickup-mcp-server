import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import {
  GetFoldersParams,
  ClickUpFolder,
  CreateFolderParams,
  UpdateFolderParams,
  ClickUpSuccessResponse,
} from "../../types.js";

export class FolderService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getFolders(
    params: GetFoldersParams,
  ): Promise<{ folders: ClickUpFolder[] }> {
    logger.debug(`Fetching folders for space ID: ${params.space_id}`);
    try {
      const queryParams: Record<string, any> = {};
      if (params.archived !== undefined) {
        queryParams.archived = params.archived.toString();
      }
      const response = await this.client.get(
        `/space/${params.space_id}/folder`,
        { params: queryParams },
      );
      // API v2 for Get Folders returns { folders: [...] }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching folders for space ${params.space_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching folders for space ${params.space_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to retrieve folders from ClickUp");
    }
  }

  async createFolder(params: CreateFolderParams): Promise<ClickUpFolder> {
    logger.debug(
      `Creating folder in space ID: ${params.space_id} with name: ${params.name}`,
    );
    try {
      const { space_id, ...bodyParams } = params;
      const response = await this.client.post<ClickUpFolder>(
        `/space/${space_id}/folder`,
        bodyParams,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating folder in space ${params.space_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating folder in space ${params.space_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to create folder in ClickUp");
    }
  }

  async getFolder(folder_id: string): Promise<ClickUpFolder> {
    logger.debug(`Fetching folder ID: ${folder_id}`);
    try {
      const response = await this.client.get<ClickUpFolder>(
        `/folder/${folder_id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching folder ${folder_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching folder ${folder_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to retrieve folder from ClickUp");
    }
  }

  async updateFolder(params: UpdateFolderParams): Promise<ClickUpFolder> {
    const { folder_id, ...bodyParams } = params;
    logger.debug(`Updating folder ID: ${folder_id}`);
    try {
      const response = await this.client.put<ClickUpFolder>(
        `/folder/${folder_id}`,
        bodyParams,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error updating folder ${folder_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error updating folder ${params.folder_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to update folder in ClickUp");
    }
  }

  async deleteFolder(folder_id: string): Promise<ClickUpSuccessResponse> {
    logger.debug(`Deleting folder ID: ${folder_id}`);
    try {
      const response = await this.client.delete<ClickUpSuccessResponse>(
        `/folder/${folder_id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error deleting folder ${folder_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error deleting folder ${folder_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to delete folder in ClickUp");
    }
  }
}
