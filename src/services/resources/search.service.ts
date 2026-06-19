import axios, { AxiosInstance } from "axios";
import { logger } from "../../logger.js";

export interface SearchTasksByTagsParams {
  tags: string[];
  team_id?: string;
  statuses?: string[];
  list_ids?: string[];
  assignees?: string[];
  include_closed?: boolean;
  page?: number;
}

// Compact projection so search results stay small and useful.
export interface TaskSearchResult {
  id: string;
  custom_id: string | null;
  name: string;
  status: string | null;
  list: string | null;
  folder: string | null;
  space: string | null;
  tags: string[];
  assignees: string[];
  priority: string | null;
  due_date: string | null;
  url: string | null;
}

export class SearchService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // ClickUp API v2 has no full-text task search, but the filtered team-tasks
  // endpoint supports native server-side tag filtering. Returns one page.
  async searchTasksByTags(params: SearchTasksByTagsParams): Promise<{
    team_id: string;
    page: number;
    count: number;
    last_page: boolean;
    tasks: TaskSearchResult[];
  }> {
    if (!params.tags || params.tags.length === 0) {
      throw new Error("At least one tag is required to search tasks.");
    }
    const teamId = params.team_id || (await this.resolveTeamId());
    const page = params.page ?? 0;
    const queryString = this.buildQueryString(params, page);

    try {
      const response = await this.client.get<any>(
        `/v2/team/${teamId}/task?${queryString}`,
        {},
      );
      const data = response.data ?? {};
      const tasks: any[] = data.tasks ?? [];
      return {
        team_id: teamId,
        page,
        count: tasks.length,
        last_page: data.last_page === true || tasks.length === 0,
        tasks: tasks.map((t) => this.project(t)),
      };
    } catch (error) {
      this.logError(error, "searching tasks by tags");
      throw new Error("Failed to search tasks in ClickUp");
    }
  }

  private async resolveTeamId(): Promise<string> {
    try {
      const response = await this.client.get<any>("/v2/team", {});
      const teams = response.data?.teams ?? [];
      if (!teams.length) {
        throw new Error("No teams found for the authenticated user.");
      }
      return teams[0].id;
    } catch (error) {
      this.logError(error, "resolving team id");
      throw new Error("Failed to resolve team for task search in ClickUp");
    }
  }

  private buildQueryString(
    params: SearchTasksByTagsParams,
    page: number,
  ): string {
    const qp = new URLSearchParams();
    qp.append("page", String(page));
    if (params.include_closed) qp.append("include_closed", "true");
    params.tags.forEach((t) => qp.append("tags[]", t));
    (params.statuses ?? []).forEach((s) => qp.append("statuses[]", s));
    (params.list_ids ?? []).forEach((l) => qp.append("list_ids[]", l));
    (params.assignees ?? []).forEach((a) => qp.append("assignees[]", a));
    return qp.toString();
  }

  private project(t: any): TaskSearchResult {
    return {
      id: t.id,
      custom_id: t.custom_id ?? null,
      name: t.name ?? null,
      status: t.status?.status ?? null,
      list: t.list?.name ?? null,
      folder: t.folder?.name ?? null,
      space: t.space?.name ?? t.space?.id ?? null,
      tags: (t.tags ?? []).map((x: any) => x.name),
      assignees: (t.assignees ?? []).map((a: any) => a.username || a.email),
      priority: t.priority?.priority ?? null,
      due_date: t.due_date ?? null,
      url: t.url ?? null,
    };
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
