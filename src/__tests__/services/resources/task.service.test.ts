import axios, { AxiosInstance } from "axios";

import { TaskService } from "../../../services/resources/task.service.js"; // Adjust path
import { ClickUpTask } from "../../../types"; // Adjust path

// Mock the entire axios module
jest.mock("axios");

// Cast axios to its mock type
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("TaskService", () => {
  let taskService: TaskService;
  let mockClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    // Reset mocks before each test
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();

    // Create a mock AxiosInstance specifically for the TaskService
    // We only need to mock the methods TaskService uses (post, put)
    mockClient = {
      post: mockedAxios.post,
      put: mockedAxios.put,
      // Add other methods if TaskService starts using them
    } as unknown as jest.Mocked<AxiosInstance>; // Cast needed for type compatibility

    taskService = new TaskService(mockClient);
  });

  // Test suite for createTask (Moved from clickup.service.test.ts)
  describe("createTask", () => {
    it("should create a task and return task data", async () => {
      // Arrange
      const taskData = { list_id: "123", name: "Test Task" };
      const mockResponse = { data: { id: "xyz", ...taskData } };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await taskService.createTask(taskData);

      // Assert
      expect(mockClient.post).toHaveBeenCalledWith(
        `/list/${taskData.list_id}/task`,
        taskData,
        {},
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error if list_id is missing", async () => {
      const taskData = { name: "Task without list" } as ClickUpTask; // Missing list_id
      await expect(taskService.createTask(taskData)).rejects.toThrow(
        "list_id is required to create a task.",
      );
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it("should throw an error if ClickUp API fails", async () => {
      // Arrange
      const taskData = { list_id: "123", name: "Test Task" };
      mockClient.post.mockRejectedValueOnce(new Error("ClickUp API Error"));

      // Act & Assert
      await expect(taskService.createTask(taskData)).rejects.toThrow(
        "Failed to create task in ClickUp",
      );
    });
  });

  // Test suite for updateTask (Moved from clickup.service.test.ts)
  describe("updateTask", () => {
    it("should update a task and return updated task data", async () => {
      // Arrange
      const taskId = "task_xyz";
      const updates = { name: "Updated Task Name" };
      const mockResponse = { data: { id: taskId, ...updates } };
      mockClient.put.mockResolvedValueOnce(mockResponse);

      // Act
      const result = await taskService.updateTask(taskId, updates);

      // Assert
      expect(mockClient.put).toHaveBeenCalledWith(
        `/task/${taskId}`,
        updates,
        {},
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails during update", async () => {
      // Arrange
      const taskId = "task_xyz";
      const updates = { name: "Updated Task Name" };
      mockClient.put.mockRejectedValueOnce(
        new Error("ClickUp API Update Error"),
      );

      // Act & Assert
      await expect(taskService.updateTask(taskId, updates)).rejects.toThrow(
        "Failed to update task in ClickUp",
      );
    });
  });
});
