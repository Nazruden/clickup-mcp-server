import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import {
  ClickUpView,
  GetViewsParams,
  CreateViewParams,
  UpdateViewParams,
  DeleteViewParams,
  GetViewTasksParams,
  ClickUpViewParentType,
  ClickUpSuccessResponse,
  ClickUpTask, // Needed for GetViewTasksResponse
} from "../../types.js";

// Define the expected response structure for get view tasks if not already in types
interface GetViewTasksResponse {
  tasks: ClickUpTask[];
  last_page: boolean;
  // Potentially other pagination info
}

export class ViewService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  private getViewParentPathSegment(parentType: ClickUpViewParentType): string {
    switch (parentType) {
      case "team":
        return "team";
      case "space":
        return "space";
      case "folder":
        return "folder";
      case "list":
        return "list";
      default:
        // This should ideally be caught by type checking earlier, but good defense
        logger.error(`Invalid view parent type provided: ${parentType}`);
        throw new Error(`Invalid view parent type: ${parentType}`);
    }
  }

  async getViews(params: GetViewsParams): Promise<ClickUpView[]> {
    const { parent_id, parent_type } = params;
    const pathSegment = this.getViewParentPathSegment(parent_type);
    logger.debug(`Fetching views for ${parent_type} ID: ${parent_id}`);

    try {
      const response = await this.client.get<{ views: ClickUpView[] }>(
        `/v2/${pathSegment}/${parent_id}/view`,
        {},
      );
      return response.data.views;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching views for ${parent_type} ${parent_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching views for ${parent_type} ${parent_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to retrieve views for ${parent_type} ${parent_id} from ClickUp`,
      );
    }
  }

  async createView(params: CreateViewParams): Promise<ClickUpView> {
    const { parent_id, parent_type, ...bodyParams } = params;
    const pathSegment = this.getViewParentPathSegment(parent_type);
    logger.debug(
      `Creating view for ${parent_type} ID: ${parent_id} with name: ${bodyParams.name}`,
    );
    try {
      const response = await this.client.post<ClickUpView>(
        `/v2/${pathSegment}/${parent_id}/view`,
        bodyParams, // Contains name, type, settings, etc.
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating view for ${parent_type} ${parent_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating view for ${parent_type} ${parent_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to create view for ${parent_type} ${parent_id} in ClickUp`,
      );
    }
  }

  async getViewDetails(view_id: string): Promise<ClickUpView> {
    logger.debug(`Fetching details for view ID: ${view_id}`);
    try {
      const response = await this.client.get<ClickUpView>(`/v2/view/${view_id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Axios error fetching view ${view_id}: ${error.message}`, {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching view ${view_id}: ${error.message}`,
        );
      }
      throw new Error(`Failed to retrieve view ${view_id} from ClickUp`);
    }
  }

  async updateView(params: UpdateViewParams): Promise<ClickUpView> {
    const { view_id, ...bodyParams } = params;
    logger.debug(`Updating view ID: ${view_id}`);
    try {
      const response = await this.client.put<ClickUpView>(
        `/v2/view/${view_id}`,
        bodyParams,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Axios error updating view ${view_id}: ${error.message}`, {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      } else if (error instanceof Error) {
        logger.error(
          `Generic error updating view ${view_id}: ${error.message}`,
        );
      }
      throw new Error(`Failed to update view ${view_id} in ClickUp`);
    }
  }

  async deleteView(view_id: string): Promise<ClickUpSuccessResponse> {
    logger.debug(`Deleting view ID: ${view_id}`);
    try {
      const response = await this.client.delete<ClickUpSuccessResponse>(
        `/v2/view/${view_id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(`Axios error deleting view ${view_id}: ${error.message}`, {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url,
        });
      } else if (error instanceof Error) {
        logger.error(
          `Generic error deleting view ${view_id}: ${error.message}`,
        );
      }
      throw new Error(`Failed to delete view ${view_id} in ClickUp`);
    }
  }

  async getViewTasks(
    params: GetViewTasksParams,
  ): Promise<GetViewTasksResponse> {
    const { view_id, page } = params;
    logger.debug(`Fetching tasks for view ID: ${view_id}, page: ${page ?? 0}`);
    const queryParams: Record<string, any> = {};
    if (page !== undefined) {
      queryParams.page = page;
    }

    try {
      const response = await this.client.get<GetViewTasksResponse>(
        `/v2/view/${view_id}/task`,
        { params: queryParams },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching tasks for view ${view_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching tasks for view ${view_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to retrieve tasks for view ${view_id} from ClickUp`,
      );
    }
  }
}
