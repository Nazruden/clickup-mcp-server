import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";

export interface UpdateChecklistPayload {
  name?: string;
  position?: number;
}

export interface CreateChecklistItemPayload {
  name: string;
  assignee?: number | string;
}

export interface UpdateChecklistItemPayload {
  name?: string;
  resolved?: boolean;
  parent?: string | null;
}

export class ChecklistService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // Checklists have no dedicated "get" endpoint in ClickUp API v2;
  // they are returned as part of the task object.
  async getTaskChecklists(taskId: string): Promise<any> {
    logger.debug(`Getting checklists for task ${taskId}`);
    try {
      const response = await this.client.get<any>(`/v2/task/${taskId}`, {});
      return response.data?.checklists ?? [];
    } catch (error) {
      this.logError(error, `getting checklists for task ${taskId}`);
      throw new Error("Failed to retrieve task checklists from ClickUp");
    }
  }

  async createChecklist(taskId: string, name: string): Promise<any> {
    logger.debug(`Creating checklist on task ${taskId}`);
    try {
      const response = await this.client.post<any>(
        `/v2/task/${taskId}/checklist`,
        { name },
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(error, `creating checklist on task ${taskId}`);
      throw new Error("Failed to create checklist in ClickUp");
    }
  }

  async updateChecklist(
    checklistId: string,
    payload: UpdateChecklistPayload,
  ): Promise<any> {
    logger.debug(`Updating checklist ${checklistId}`);
    try {
      const response = await this.client.put<any>(
        `/v2/checklist/${checklistId}`,
        payload,
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(error, `updating checklist ${checklistId}`);
      throw new Error("Failed to update checklist in ClickUp");
    }
  }

  async deleteChecklist(checklistId: string): Promise<any> {
    logger.debug(`Deleting checklist ${checklistId}`);
    try {
      const response = await this.client.delete<any>(
        `/v2/checklist/${checklistId}`,
        {},
      );
      return response.data ?? { success: true };
    } catch (error) {
      this.logError(error, `deleting checklist ${checklistId}`);
      throw new Error("Failed to delete checklist in ClickUp");
    }
  }

  async createChecklistItem(
    checklistId: string,
    payload: CreateChecklistItemPayload,
  ): Promise<any> {
    logger.debug(`Creating item in checklist ${checklistId}`);
    try {
      const response = await this.client.post<any>(
        `/v2/checklist/${checklistId}/checklist_item`,
        payload,
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(error, `creating item in checklist ${checklistId}`);
      throw new Error("Failed to create checklist item in ClickUp");
    }
  }

  async updateChecklistItem(
    checklistId: string,
    checklistItemId: string,
    payload: UpdateChecklistItemPayload,
  ): Promise<any> {
    logger.debug(
      `Updating item ${checklistItemId} in checklist ${checklistId}`,
    );
    try {
      const response = await this.client.put<any>(
        `/v2/checklist/${checklistId}/checklist_item/${checklistItemId}`,
        payload,
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(
        error,
        `updating item ${checklistItemId} in checklist ${checklistId}`,
      );
      throw new Error("Failed to update checklist item in ClickUp");
    }
  }

  async deleteChecklistItem(
    checklistId: string,
    checklistItemId: string,
  ): Promise<any> {
    logger.debug(
      `Deleting item ${checklistItemId} from checklist ${checklistId}`,
    );
    try {
      const response = await this.client.delete<any>(
        `/v2/checklist/${checklistId}/checklist_item/${checklistItemId}`,
        {},
      );
      return response.data ?? { success: true };
    } catch (error) {
      this.logError(
        error,
        `deleting item ${checklistItemId} from checklist ${checklistId}`,
      );
      throw new Error("Failed to delete checklist item in ClickUp");
    }
  }

  private logError(error: unknown, context: string): void {
    if (axios.isAxiosError(error)) {
      logger.error(`Axios error ${context}: ${error.message}`, {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
      });
    } else if (error instanceof Error) {
      logger.error(`Generic error ${context}: ${error.message}`);
    }
  }
}
