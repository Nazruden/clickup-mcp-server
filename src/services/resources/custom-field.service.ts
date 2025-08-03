import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import {
  ClickUpCustomField,
  SetTaskCustomFieldValueParams,
  RemoveTaskCustomFieldValueParams,
  GetCustomFieldsParams,
  ClickUpSuccessResponse,
} from "../../types.js";

export class CustomFieldService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getCustomFields(listId: string): Promise<ClickUpCustomField[]> {
    logger.debug(`Fetching custom fields for list ID: ${listId}`);
    try {
      const response = await this.client.get<{ fields: ClickUpCustomField[] }>(
        `/v2/list/${listId}/field`,
        {},
      );
      return response.data.fields;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error fetching custom fields for list ${listId}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error fetching custom fields for list ${listId}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to retrieve custom fields for list ${listId} from ClickUp`,
      );
    }
  }

  async setTaskCustomFieldValue(
    params: SetTaskCustomFieldValueParams,
  ): Promise<ClickUpSuccessResponse> {
    const { task_id, field_id, value, value_options } = params;
    logger.debug(
      `Setting custom field ${field_id} for task ${task_id} with value: ${JSON.stringify(
        value,
      )}`,
    );

    const requestBody: { value: any; value_options?: any } = { value };
    if (value_options) {
      requestBody.value_options = value_options;
    }

    try {
      const response = await this.client.post<ClickUpSuccessResponse>(
        `/v2/task/${task_id}/field/${field_id}`,
        requestBody,
        {},
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error setting custom field ${field_id} for task ${task_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error setting custom field ${field_id} for task ${task_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to set custom field ${field_id} for task ${task_id} in ClickUp`,
      );
    }
  }

  async removeTaskCustomFieldValue(
    params: RemoveTaskCustomFieldValueParams,
  ): Promise<ClickUpSuccessResponse> {
    const { task_id, field_id } = params;
    logger.debug(`Removing custom field ${field_id} for task ${task_id}`);

    try {
      const response = await this.client.delete<ClickUpSuccessResponse>(
        `/v2/task/${task_id}/field/${field_id}`,
        {},
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error removing custom field ${field_id} for task ${task_id}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error removing custom field ${field_id} for task ${task_id}: ${error.message}`,
        );
      }
      throw new Error(
        `Failed to remove custom field ${field_id} for task ${task_id} from ClickUp`,
      );
    }
  }
}
