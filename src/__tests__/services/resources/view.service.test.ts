import axios, { AxiosInstance } from "axios";

import { ViewService } from "../../../services/resources/view.service.js";
import {
  // Import necessary View types for tests
  GetViewsParams,
  ClickUpView,
  CreateViewParams,
  UpdateViewParams,
  GetViewTasksParams,
  ClickUpSuccessResponse,
  ClickUpViewGroupingSettings,
  ClickUpViewSortSettings,
  ClickUpViewFilterSettings,
  ClickUpViewColumnSettings,
  ClickUpTask,
} from "../../../types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ViewService", () => {
  let viewService: ViewService;
  let mockClient: jest.Mocked<AxiosInstance>;

  // Define minimal valid structures for complex ClickUpView properties
  const minimalGrouping: ClickUpViewGroupingSettings = {
    field: "none",
    dir: 0,
  };
  const minimalSorting: ClickUpViewSortSettings = { fields: [] };
  const minimalFilters: ClickUpViewFilterSettings = { op: "AND", fields: [] };
  const minimalColumns: ClickUpViewColumnSettings = { fields: [] };

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();
    mockedAxios.delete.mockClear();

    mockClient = {
      get: mockedAxios.get,
      post: mockedAxios.post,
      put: mockedAxios.put,
      delete: mockedAxios.delete,
    } as unknown as jest.Mocked<AxiosInstance>;

    viewService = new ViewService(mockClient);
  });

  // Test suite for getViews
  describe("getViews", () => {
    it("should retrieve views for a list and return view data", async () => {
      const params: GetViewsParams = {
        parent_id: "list_123",
        parent_type: "list",
      };
      const mockViewsData: ClickUpView[] = [
        {
          id: "view_a",
          name: "List View 1",
          type: "list",
          parent: { id: "list_123", type: 6 }, // type 6 for list
          grouping: minimalGrouping,
          sorting: minimalSorting,
          filters: minimalFilters,
          columns: minimalColumns,
        },
      ];
      const mockResponse = { data: { views: mockViewsData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await viewService.getViews(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/${params.parent_type}/${params.parent_id}/view`,
        {}
      );
      expect(result).toEqual(mockViewsData);
    });

    it("should retrieve views for a space", async () => {
      const params: GetViewsParams = {
        parent_id: "space_456",
        parent_type: "space",
      };
      const mockViewsData: ClickUpView[] = [
        {
          id: "view_b",
          name: "Space View Board",
          type: "board",
          parent: { id: "space_456", type: 4 }, // type 4 for space
          grouping: minimalGrouping,
          sorting: minimalSorting,
          filters: minimalFilters,
          columns: minimalColumns,
        },
      ];
      const mockResponse = { data: { views: mockViewsData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);
      await viewService.getViews(params);
      expect(mockClient.get).toHaveBeenCalledWith("/space/space_456/view", {});
    });

    it("should retrieve views for a folder", async () => {
      const params: GetViewsParams = {
        parent_id: "folder_789",
        parent_type: "folder",
      };
      const mockResponse = { data: { views: [] } }; // Assuming empty is fine
      mockClient.get.mockResolvedValueOnce(mockResponse);
      await viewService.getViews(params);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/folder/folder_789/view",
        {}
      );
    });

    it("should retrieve views for a team", async () => {
      const params: GetViewsParams = {
        parent_id: "team_abc",
        parent_type: "team",
      };
      const mockResponse = { data: { views: [] } }; // Assuming empty is fine
      mockClient.get.mockResolvedValueOnce(mockResponse);
      await viewService.getViews(params);
      expect(mockClient.get).toHaveBeenCalledWith("/team/team_abc/view", {});
    });

    it("should throw an error if API fails", async () => {
      const params: GetViewsParams = {
        parent_id: "list_123",
        parent_type: "list",
      };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.getViews(params)).rejects.toThrow(
        `Failed to retrieve views for ${params.parent_type} ${params.parent_id} from ClickUp`
      );
    });

    it("should throw an error for invalid parent_type", async () => {
      const params = {
        parent_id: "invalid_id",
        parent_type: "invalid_type",
      } as any as GetViewsParams;
      await expect(viewService.getViews(params)).rejects.toThrow(
        "Invalid view parent type: invalid_type"
      );
    });
  });

  // Test suite for createView
  describe("createView", () => {
    it("should create a view in a list", async () => {
      const params: CreateViewParams = {
        parent_id: "list_123",
        parent_type: "list",
        name: "New List View",
        type: "list",
      };
      const mockResponseData: ClickUpView = {
        id: "view_new_list",
        name: params.name,
        type: params.type,
        parent: { id: params.parent_id, type: 6 }, // type 6 for list
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);
      const { parent_id, parent_type, ...bodyParams } = params;

      const result = await viewService.createView(params);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/${parent_type}/${parent_id}/view`,
        bodyParams
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should create a view in a space and include settings if provided", async () => {
      const params: CreateViewParams = {
        parent_id: "space_456",
        parent_type: "space",
        name: "New Board View",
        type: "board",
        settings: { show_task_locations: true },
      };
      const mockResponseData: ClickUpView = {
        id: "view_new_board",
        name: params.name,
        type: params.type,
        parent: { id: params.parent_id, type: 4 }, // type 4 for space
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
        settings: params.settings,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);
      const { parent_id, parent_type, ...bodyParams } = params;

      await viewService.createView(params);
      expect(mockClient.post).toHaveBeenCalledWith(
        "/space/space_456/view",
        bodyParams
      );
    });

    it("should throw an error if API fails", async () => {
      const params: CreateViewParams = {
        parent_id: "list_123",
        parent_type: "list",
        name: "Error View",
        type: "list",
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.createView(params)).rejects.toThrow(
        `Failed to create view for ${params.parent_type} ${params.parent_id} in ClickUp`
      );
    });
  });

  // Test suite for getViewDetails
  describe("getViewDetails", () => {
    it("should retrieve details for a specific view", async () => {
      const viewId = "view_xyz";
      const mockResponseData: ClickUpView = {
        id: viewId,
        name: "Detailed View",
        type: "calendar",
        parent: { id: "space_123", type: 4 }, // type 4 for space
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await viewService.getViewDetails(viewId);

      expect(mockClient.get).toHaveBeenCalledWith(`/view/${viewId}`);
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if API fails", async () => {
      const viewId = "view_xyz";
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.getViewDetails(viewId)).rejects.toThrow(
        `Failed to retrieve view ${viewId} from ClickUp`
      );
    });
  });

  // Test suite for updateView
  describe("updateView", () => {
    it("should update a view name and settings", async () => {
      const params: UpdateViewParams = {
        view_id: "view_abc",
        name: "Updated Name",
        settings: { grouping: "status" },
      }; // Grouping here is illustrative of settings
      const mockResponseData: ClickUpView = {
        id: params.view_id,
        name: params.name!,
        type: "list",
        parent: { id: "list_321", type: 6 }, // type 6 for list
        grouping: minimalGrouping, // Base minimal
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
        settings: params.settings, // Apply the specific settings update
      };
      const mockResponse = { data: mockResponseData };
      mockClient.put.mockResolvedValueOnce(mockResponse);
      const { view_id, ...bodyParams } = params;

      const result = await viewService.updateView(params);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/view/${view_id}`,
        bodyParams
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if API fails", async () => {
      const params: UpdateViewParams = {
        view_id: "view_abc",
        name: "Updated Name",
      };
      mockClient.put.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.updateView(params)).rejects.toThrow(
        `Failed to update view ${params.view_id} in ClickUp`
      );
    });
  });

  // Test suite for deleteView
  describe("deleteView", () => {
    it("should delete a view and return success response", async () => {
      const viewId = "view_todelete";
      const mockResponse = { data: {} as ClickUpSuccessResponse }; // Empty object for success
      mockClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await viewService.deleteView(viewId);

      expect(mockClient.delete).toHaveBeenCalledWith(`/view/${viewId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if API fails", async () => {
      const viewId = "view_todelete";
      mockClient.delete.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.deleteView(viewId)).rejects.toThrow(
        `Failed to delete view ${viewId} in ClickUp`
      );
    });
  });

  // Test suite for getViewTasks
  describe("getViewTasks", () => {
    it("should retrieve tasks for a view and handle pagination", async () => {
      const params: GetViewTasksParams = { view_id: "view_tasks1", page: 0 };
      const mockTasksData = {
        tasks: [{ id: "task_1", name: "Task One" } as ClickUpTask],
        last_page: false,
      };
      const mockResponse = { data: mockTasksData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await viewService.getViewTasks(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/view/${params.view_id}/task`,
        { params: { page: params.page } }
      );
      expect(result).toEqual(mockTasksData);
    });

    it("should return empty array and last_page true if no tasks", async () => {
      const params: GetViewTasksParams = { view_id: "view_notasks" }; // No page specified
      const mockTasksData = { tasks: [], last_page: true };
      const mockResponse = { data: mockTasksData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await viewService.getViewTasks(params);
      expect(mockClient.get).toHaveBeenCalledWith(
        `/view/${params.view_id}/task`,
        { params: {} } // page is undefined, so queryParams will be empty
      );
      expect(result.tasks).toEqual([]);
      expect(result.last_page).toBe(true);
    });

    it("should throw an error if API fails", async () => {
      const params: GetViewTasksParams = { view_id: "view_tasks_err" };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(viewService.getViewTasks(params)).rejects.toThrow(
        `Failed to retrieve tasks for view ${params.view_id} from ClickUp`
      );
    });
  });
});
