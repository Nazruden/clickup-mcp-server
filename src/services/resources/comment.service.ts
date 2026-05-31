import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";

export interface CreateCommentPayload {
  comment_text: string;
  assignee?: number | string;
  notify_all?: boolean;
}

export interface UpdateCommentPayload {
  comment_text?: string;
  assignee?: number | string;
  resolved?: boolean;
}

export class CommentService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async getTaskComments(taskId: string): Promise<any> {
    logger.debug(`Getting comments for task ${taskId}`);
    try {
      const response = await this.client.get<any>(
        `/v2/task/${taskId}/comment`,
        {},
      );
      return response.data?.comments ?? [];
    } catch (error) {
      this.logError(error, `getting comments for task ${taskId}`);
      throw new Error("Failed to retrieve task comments from ClickUp");
    }
  }

  async createTaskComment(
    taskId: string,
    payload: CreateCommentPayload,
  ): Promise<any> {
    logger.debug(`Creating comment on task ${taskId}`);
    try {
      const response = await this.client.post<any>(
        `/v2/task/${taskId}/comment`,
        payload,
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(error, `creating comment on task ${taskId}`);
      throw new Error("Failed to create task comment in ClickUp");
    }
  }

  async updateComment(
    commentId: string,
    payload: UpdateCommentPayload,
  ): Promise<any> {
    logger.debug(`Updating comment ${commentId}`);
    try {
      const response = await this.client.put<any>(
        `/v2/comment/${commentId}`,
        payload,
        {},
      );
      return response.data;
    } catch (error) {
      this.logError(error, `updating comment ${commentId}`);
      throw new Error("Failed to update comment in ClickUp");
    }
  }

  async deleteComment(commentId: string): Promise<any> {
    logger.debug(`Deleting comment ${commentId}`);
    try {
      const response = await this.client.delete<any>(
        `/v2/comment/${commentId}`,
        {},
      );
      return response.data ?? { success: true };
    } catch (error) {
      this.logError(error, `deleting comment ${commentId}`);
      throw new Error("Failed to delete comment in ClickUp");
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
