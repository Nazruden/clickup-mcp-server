import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import {
  GetSpacesParams,
  ClickUpSpace,
  CreateSpaceParams,
  UpdateSpaceParams,
  ClickUpSuccessResponse,
} from "../../types.js";

export class SpaceService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getSpaces(
    params: GetSpacesParams,
  ): Promise<{ spaces: ClickUpSpace[] }> {
    logger.debug(`Fetching spaces for team ID: ${params.team_id}`);
    try {
      const queryParams: Record<string, any> = {};
      if (params.archived !== undefined) {
        queryParams.archived = params.archived.toString();
      }

      const response = await this.client.get(`/team/${params.team_id}/space`, {
        params: queryParams,
      });
      // API v2 for Get Spaces returns { spaces: [...] }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching spaces for team ${params.team_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching spaces for team ${params.team_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to retrieve spaces from ClickUp");
    }
  }

  async createSpace(params: CreateSpaceParams): Promise<ClickUpSpace> {
    logger.debug(
      `Creating space in team ID: ${params.team_id} with name: ${params.name}`,
    );
    try {
      const { team_id, ...bodyParams } = params;
      const response = await this.client.post<ClickUpSpace>(
        `/team/${team_id}/space`,
        bodyParams,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating space in team ${params.team_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating space in team ${params.team_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to create space in ClickUp");
    }
  }

  async getSpace(space_id: string): Promise<ClickUpSpace> {
    logger.debug(`Fetching space ID: ${space_id}`);
    try {
      const response = await this.client.get<ClickUpSpace>(
        `/space/${space_id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching space ${space_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching space ${space_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to retrieve space from ClickUp");
    }
  }

  async updateSpace(params: UpdateSpaceParams): Promise<ClickUpSpace> {
    const { space_id, ...bodyParams } = params;
    logger.debug(`Updating space ID: ${space_id}`);
    try {
      const response = await this.client.put<ClickUpSpace>(
        `/space/${space_id}`,
        bodyParams,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error updating space ${space_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error updating space ${params.space_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to update space in ClickUp");
    }
  }

  async deleteSpace(space_id: string): Promise<ClickUpSuccessResponse> {
    logger.debug(`Deleting space ID: ${space_id}`);
    try {
      const response = await this.client.delete<ClickUpSuccessResponse>(
        `/space/${space_id}`,
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error deleting space ${space_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error deleting space ${space_id}: ${error.message}`,
        );
      }
      throw new Error("Failed to delete space in ClickUp");
    }
  }
}
