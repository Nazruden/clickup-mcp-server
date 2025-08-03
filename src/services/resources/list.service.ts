import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";
import { CreateListParams, ClickUpListFull } from "../../types.js";

export class ListService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  async createList(params: CreateListParams): Promise<ClickUpListFull> {
    const { parent_id, parent_type, name, ...body } = params;

    if (!parent_id) {
      throw new Error(
        `Parent ID (folder_id or space_id) is required to create a list.`,
      );
    }
    if (!name) {
      throw new Error("List name is required.");
    }
    if (!parent_type || (parent_type !== "folder" && parent_type !== "space")) {
      throw new Error("Invalid parent_type. Must be 'folder' or 'space'.");
    }

    const apiUrl =
      parent_type === "folder"
        ? `/api/v2/folder/${parent_id}/list`
        : `/api/v2/space/${parent_id}/list`;

    const requestBody: any = { name };
    // Add other optional fields from params.body if they are part of CreateListParams and valid for API
    if (body.content) requestBody.content = body.content;
    if (body.due_date) requestBody.due_date = body.due_date;
    if (body.due_date_time !== undefined)
      requestBody.due_date_time = body.due_date_time;
    if (body.priority) requestBody.priority = body.priority;
    if (body.assignee) requestBody.assignee = body.assignee;
    if (body.status) requestBody.status = body.status; // This sets the default status for tasks in the list

    logger.debug(
      `Creating list in ${parent_type} ${parent_id} with name: "${name}" via ${apiUrl}`,
    );

    try {
      const response = await this.client.post<ClickUpListFull>(
        apiUrl,
        requestBody,
      );
      return response.data;
    } catch (error) {
      const scope = `${parent_type} ${parent_id}`;
      if (axios.isAxiosError(error)) {
        logger.error(
          `Axios error creating list for ${scope}: ${error.message}`,
          {
            status: error.response?.status,
            data: error.response?.data,
            url: apiUrl,
            body: requestBody,
          },
        );
      } else if (error instanceof Error) {
        logger.error(
          `Generic error creating list for ${scope}: ${error.message}`,
        );
      }
      throw new Error(`Failed to create list for ${scope} from ClickUp`);
    }
  }
}
