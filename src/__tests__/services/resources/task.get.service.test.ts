import axios, { AxiosInstance } from "axios";

import { TaskService } from "../../../services/resources/task.service.js";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TaskService.getTask", () => {
  let taskService: TaskService;
  let mockClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockClient = {
      get: mockedAxios.get,
    } as unknown as jest.Mocked<AxiosInstance>;
    taskService = new TaskService(mockClient);
  });

  it("gets a task by id with no extra params", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { id: "abc", name: "T" } });

    const result = await taskService.getTask("abc");

    expect(mockClient.get).toHaveBeenCalledWith("/v2/task/abc", { params: {} });
    expect(result).toEqual({ id: "abc", name: "T" });
  });

  it("passes custom_task_ids, team_id and markdown flags as params", async () => {
    mockClient.get.mockResolvedValueOnce({ data: { id: "abc" } });

    await taskService.getTask("ABC-123", {
      custom_task_ids: true,
      team_id: "team1",
      include_markdown_description: true,
      include_subtasks: true,
    });

    expect(mockClient.get).toHaveBeenCalledWith("/v2/task/ABC-123", {
      params: {
        custom_task_ids: "true",
        team_id: "team1",
        include_subtasks: "true",
        include_markdown_description: "true",
      },
    });
  });

  it("throws a friendly error on API failure", async () => {
    mockClient.get.mockRejectedValueOnce(new Error("boom"));
    await expect(taskService.getTask("abc")).rejects.toThrow(
      "Failed to retrieve task from ClickUp",
    );
  });
});
