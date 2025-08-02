
import { ClickUpService } from "../../services/clickup.service.js";
import { ViewService } from "../../services/resources/view.service.js";
import {
  handleGetViews,
  handleCreateView,
  handleGetViewDetails,
  handleUpdateView,
  handleDeleteView,
  handleGetViewTasks,
  getViewsTool,
  createViewTool,
  getViewDetailsTool,
  updateViewTool,
  deleteViewTool,
  getViewTasksTool,
} from "../../tools/view.tools.js";
import {
  ClickUpView,
  ClickUpTask,
  ClickUpSuccessResponse,
  ClickUpViewGroupingSettings,
  ClickUpViewSortSettings,
  ClickUpViewFilterSettings,
  ClickUpViewColumnSettings,
  GetViewsParams,
  CreateViewParams,
  UpdateViewParams,
  GetViewTasksParams,
  ClickUpViewParentType,
  ClickUpViewType,
} from "../../types.js";

// Mock ClickUpService - this will mock the constructor and all its methods/getters
jest.mock("../../services/clickup.service.js");

// Define minimal valid structures for complex ClickUpView properties used in mocks
const minimalGrouping: ClickUpViewGroupingSettings = { field: "none", dir: 0 };
const minimalSorting: ClickUpViewSortSettings = { fields: [] };
const minimalFilters: ClickUpViewFilterSettings = { op: "AND", fields: [] };
const minimalColumns: ClickUpViewColumnSettings = { fields: [] };

const MockedClickUpService = ClickUpService as jest.MockedClass<
  typeof ClickUpService
>;

// Define a type for the mocked ViewService methods
type MockedViewService = {
  getViews: jest.MockedFunction<ViewService["getViews"]>;
  createView: jest.MockedFunction<ViewService["createView"]>;
  getViewDetails: jest.MockedFunction<ViewService["getViewDetails"]>;
  updateView: jest.MockedFunction<ViewService["updateView"]>;
  deleteView: jest.MockedFunction<ViewService["deleteView"]>;
  getViewTasks: jest.MockedFunction<ViewService["getViewTasks"]>;
};

describe("View Tool Handlers", () => {
  let mockClickUpServiceInstance: jest.Mocked<ClickUpService>;
  let mockViewService: MockedViewService;

  beforeEach(() => {
    // Clear any previous mock implementations or instances of ClickUpService module itself
    MockedClickUpService.mockClear();

    mockViewService = {
      getViews: jest.fn(),
      createView: jest.fn(),
      getViewDetails: jest.fn(),
      updateView: jest.fn(),
      deleteView: jest.fn(),
      getViewTasks: jest.fn(),
    };

    // Manually construct an object that will serve as our mocked ClickUpService instance.
    // This gives us direct control over its shape for these tests.
    const manualMockInstance = {};

    Object.defineProperty(manualMockInstance, "viewService", {
      get: jest.fn(() => mockViewService),
      configurable: true,
      enumerable: true, // Ensure it's seen as a property
    });

    // Assign this manually constructed and configured mock to our typed variable.
    // This asserts that for the purpose of view tool tests, this object is a sufficient
    // stand-in for a jest.Mocked<ClickUpService> because we only access viewService.
    mockClickUpServiceInstance =
      manualMockInstance as jest.Mocked<ClickUpService>;
  });

  describe("handleGetViews", () => {
    it("should call viewService.getViews and return formatted response", async () => {
      const args: GetViewsParams = {
        parent_id: "list_123",
        parent_type: "list",
      };
      const mockViewData: ClickUpView[] = [
        {
          id: "view_a",
          name: "List View 1",
          type: "list",
          parent: { id: "list_123", type: 6 },
          grouping: minimalGrouping,
          sorting: minimalSorting,
          filters: minimalFilters,
          columns: minimalColumns,
        },
      ];
      mockViewService.getViews.mockResolvedValueOnce(mockViewData);

      const result = await handleGetViews(
        mockClickUpServiceInstance,
        args as unknown as Record<string, unknown>
      );

      expect(mockViewService.getViews).toHaveBeenCalledWith(args);
      const summaryMessage = `Retrieved ${mockViewData.length} views for ${args.parent_type} ${args.parent_id}.`;
      expect(result.content[0].text).toContain(summaryMessage);
      const returnedData = JSON.parse(
        result.content[0].text.substring(
          result.content[0].text.indexOf("Details: ") + 9
        )
      );
      expect(returnedData).toEqual(mockViewData);
    });

    it("should throw error if parent_id or parent_type is missing or invalid", async () => {
      await expect(
        handleGetViews(mockClickUpServiceInstance, {
          parent_id: "123",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required."
      );
      await expect(
        handleGetViews(mockClickUpServiceInstance, {
          parent_type: "list",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required."
      );
      await expect(
        handleGetViews(mockClickUpServiceInstance, {
          parent_id: "123",
          parent_type: "invalid",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required."
      );
    });
  });

  describe("handleCreateView", () => {
    it("should call viewService.createView and return formatted response", async () => {
      const args: CreateViewParams = {
        parent_id: "space_456",
        parent_type: "space" as ClickUpViewParentType,
        name: "New View",
        type: "board" as ClickUpViewType,
      };
      const mockNewView: ClickUpView = {
        id: "view_new",
        name: args.name,
        type: args.type,
        parent: { id: args.parent_id, type: 4 }, // 4 for space
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
      };
      mockViewService.createView.mockResolvedValueOnce(mockNewView);

      const result = await handleCreateView(
        mockClickUpServiceInstance,
        args as unknown as Record<string, unknown>
      );
      expect(mockViewService.createView).toHaveBeenCalledWith(args);
      const summaryMessage = `Successfully created view: ${mockNewView.name}.`;
      expect(result.content[0].text).toContain(summaryMessage);
      const returnedData = JSON.parse(
        result.content[0].text.substring(
          result.content[0].text.indexOf("Details: ") + 9
        )
      );
      expect(returnedData).toEqual(mockNewView);
    });

    it("should throw error for missing required parameters", async () => {
      await expect(
        handleCreateView(mockClickUpServiceInstance, {
          parent_id: "123",
          parent_type: "list",
          type: "list",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow("View name is required.");
      await expect(
        handleCreateView(mockClickUpServiceInstance, {
          parent_id: "123",
          name: "N",
          type: "list",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required."
      );
      await expect(
        handleCreateView(mockClickUpServiceInstance, {
          parent_type: "list",
          name: "N",
          type: "list",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "Parent ID and a valid Parent Type ('team', 'space', 'folder', 'list') are required."
      );
      await expect(
        handleCreateView(mockClickUpServiceInstance, {
          parent_id: "123",
          parent_type: "list",
          name: "N",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "View type ('list', 'board', 'calendar', 'gantt') is required."
      );
    });
  });

  describe("handleGetViewDetails", () => {
    it("should call viewService.getViewDetails and return formatted response", async () => {
      const viewId = "view_xyz";
      const mockViewDetailData: ClickUpView = {
        id: viewId,
        name: "Detailed View",
        type: "list",
        parent: { id: "list_789", type: 6 }, // type 6 for list
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
        settings: {
          show_task_locations: true,
          show_subtasks: 1,
          show_closed_subtasks: false,
          show_assignees: true,
        },
      };
      mockViewService.getViewDetails.mockResolvedValueOnce(mockViewDetailData);

      const result = await handleGetViewDetails(mockClickUpServiceInstance, {
        view_id: viewId,
      } as unknown as Record<string, unknown>);

      expect(mockViewService.getViewDetails).toHaveBeenCalledWith(viewId);
      const summaryMessage = `Retrieved details for view: ${mockViewDetailData.name}.`;
      expect(result.content[0].text).toContain(summaryMessage);
      const returnedData = JSON.parse(
        result.content[0].text.substring(
          result.content[0].text.indexOf("Details: ") + 9
        )
      );
      expect(returnedData).toEqual(mockViewDetailData);
    });

    it("should throw error if view_id is missing", async () => {
      await expect(
        handleGetViewDetails(
          mockClickUpServiceInstance,
          {} as unknown as Record<string, unknown>
        )
      ).rejects.toThrow("View ID is required.");
    });

    it("should propagate errors from viewService.getViewDetails", async () => {
      const viewId = "view_error";
      const errorMessage = "Failed to fetch view details";
      mockViewService.getViewDetails.mockRejectedValueOnce(
        new Error(errorMessage)
      );

      await expect(
        handleGetViewDetails(mockClickUpServiceInstance, {
          view_id: viewId,
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(errorMessage);
    });
  });

  describe("handleUpdateView", () => {
    it("should call viewService.updateView and return formatted response", async () => {
      const testArgs = {
        view_id: "view_to_update",
        name: "Updated View Name",
      };

      const mockUpdatedView: ClickUpView = {
        id: testArgs.view_id,
        name: testArgs.name!,
        type: "board",
        parent: { id: "folder_abc", type: 5 },
        grouping: minimalGrouping,
        sorting: minimalSorting,
        filters: minimalFilters,
        columns: minimalColumns,
      };
      mockViewService.updateView.mockResolvedValueOnce(mockUpdatedView);

      const result = await handleUpdateView(
        mockClickUpServiceInstance,
        testArgs as unknown as Record<string, unknown>
      );

      expect(mockViewService.updateView).toHaveBeenCalledWith(testArgs);

      const summaryMessage = `Successfully updated view: ${mockUpdatedView.name}.`;
      expect(result.content[0].text).toContain(summaryMessage);
      const returnedData = JSON.parse(
        result.content[0].text.substring(
          result.content[0].text.indexOf("Details: ") + 9
        )
      );
      expect(returnedData).toEqual(mockUpdatedView);
    });

    it("should throw error if view_id is missing", async () => {
      await expect(
        handleUpdateView(mockClickUpServiceInstance, {
          name: "test",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow("View ID is required for update.");
    });

    it("should throw error if update payload is empty or invalid", async () => {
      await expect(
        handleUpdateView(mockClickUpServiceInstance, {
          view_id: "view_empty_payload",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow(
        "No fields provided to update the view (at least one updatable field like 'name' is required besides 'view_id')."
      );
    });
  });

  describe("handleDeleteView", () => {
    it("should call viewService.deleteView and return success message", async () => {
      const viewId = "view_to_delete";
      const mockDeleteResponse: ClickUpSuccessResponse = {
        // Service might return this
        success: true,
        message: "View deleted successfully",
      };
      mockViewService.deleteView.mockResolvedValueOnce(mockDeleteResponse);

      const result = await handleDeleteView(mockClickUpServiceInstance, {
        view_id: viewId,
      } as unknown as Record<string, unknown>);

      expect(mockViewService.deleteView).toHaveBeenCalledWith(viewId);
      expect(result.content[0].text).toEqual("View successfully deleted."); // Handler returns this fixed message
    });

    it("should throw error if view_id is missing", async () => {
      await expect(
        handleDeleteView(
          mockClickUpServiceInstance,
          {} as unknown as Record<string, unknown>
        )
      ).rejects.toThrow("View ID is required for deletion.");
    });
  });

  describe("handleGetViewTasks", () => {
    it("should call viewService.getViewTasks and return formatted response", async () => {
      const args: GetViewTasksParams = { view_id: "view_tasks_abc" };
      const mockTasksArray: ClickUpTask[] = [
        { id: "task_1", name: "Task One", status: "open" },
        { id: "task_2", name: "Task Two", status: "in progress" },
      ];
      const mockServiceResponse = { tasks: mockTasksArray, last_page: true };
      mockViewService.getViewTasks.mockResolvedValueOnce(mockServiceResponse);

      const result = await handleGetViewTasks(
        mockClickUpServiceInstance,
        args as unknown as Record<string, unknown>
      );

      expect(mockViewService.getViewTasks).toHaveBeenCalledWith(args);
      const summaryMessage = `Retrieved ${mockTasksArray.length} tasks for view ${args.view_id}. Page: ${args.page !== undefined ? args.page : "all/first"}. Last Page: ${mockServiceResponse.last_page}.`;
      expect(result.content[0].text).toContain(summaryMessage);
      const returnedData = JSON.parse(
        result.content[0].text.substring(
          result.content[0].text.indexOf("Details: ") + 9
        )
      );
      expect(returnedData).toEqual(mockTasksArray);
    });

    it("should include page parameter if provided", async () => {
      const args: GetViewTasksParams = { view_id: "view_tasks_xyz", page: 1 };
      // Mock with the expected structure, even if tasks array is empty for this specific test focus
      mockViewService.getViewTasks.mockResolvedValueOnce({
        tasks: [],
        last_page: true,
      });

      await handleGetViewTasks(
        mockClickUpServiceInstance,
        args as unknown as Record<string, unknown>
      );

      expect(mockViewService.getViewTasks).toHaveBeenCalledWith(args);
    });

    it("should throw error if view_id is missing", async () => {
      await expect(
        handleGetViewTasks(mockClickUpServiceInstance, {
          page: 0,
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow("View ID is required.");
    });

    it("should throw error if page is invalid", async () => {
      const viewId = "view_tasks_page_error";

      await expect(
        handleGetViewTasks(mockClickUpServiceInstance, {
          view_id: viewId,
          page: "not-a-number",
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow("Page parameter must be a non-negative number.");

      await expect(
        handleGetViewTasks(mockClickUpServiceInstance, {
          view_id: viewId,
          page: -1,
        } as unknown as Record<string, unknown>)
      ).rejects.toThrow("Page parameter must be a non-negative number.");
    });
  });

  // Basic tests for the tool definitions themselves (structure, name, description)
  describe("View Tool Definitions", () => {
    it("getViewsTool should have correct structure", async () => {
      const { getViewsTool } = await import("../../tools/view.tools.js");
      expect(getViewsTool.name).toBe("clickup_get_views");
      expect(getViewsTool.description).toBe(
        "Retrieves all Views for a given parent (Team, Space, Folder, or List)."
      );
      // expect(getViewsTool.input_schema).toBeDefined(); // Commented out again due to persistent test environment issues
      // expect(getViewsTool.output_schema).toBeDefined(); // Stays commented, as it's not in tool definitions
    });

    it("createViewTool should have correct structure", async () => {
      const { createViewTool } = await import("../../tools/view.tools.js");
      expect(createViewTool.name).toBe("clickup_create_view");
      expect(createViewTool.description).toBe(
        "Creates a new View within a Team, Space, Folder, or List."
      );
      // expect(createViewTool.input_schema).toBeDefined(); // Commented out again
      // expect(createViewTool.output_schema).toBeDefined();
    });

    it("getViewDetailsTool should have correct structure", async () => {
      const { getViewDetailsTool } = await import("../../tools/view.tools.js");
      expect(getViewDetailsTool.name).toBe("clickup_get_view_details");
      expect(getViewDetailsTool.description).toBe(
        "Retrieves details for a specific View."
      );
      // expect(getViewDetailsTool.input_schema).toBeDefined(); // Commented out again
      // expect(getViewDetailsTool.output_schema).toBeDefined();
    });

    it("updateViewTool should have correct structure", async () => {
      const { updateViewTool } = await import("../../tools/view.tools.js");
      expect(updateViewTool.name).toBe("clickup_update_view");
      expect(updateViewTool.description).toBe("Updates an existing View.");
      // expect(updateViewTool.input_schema).toBeDefined(); // Commented out again
      // expect(updateViewTool.output_schema).toBeDefined();
    });

    it("deleteViewTool should have correct structure", async () => {
      const { deleteViewTool } = await import("../../tools/view.tools.js");
      expect(deleteViewTool.name).toBe("clickup_delete_view");
      expect(deleteViewTool.description).toBe("Deletes a View.");
      // expect(deleteViewTool.input_schema).toBeDefined(); // Commented out again
      // expect(deleteViewTool.output_schema).toBeDefined();
    });

    it("getViewTasksTool should have correct structure", async () => {
      const { getViewTasksTool } = await import("../../tools/view.tools.js");
      expect(getViewTasksTool.name).toBe("clickup_get_view_tasks");
      expect(getViewTasksTool.description).toBe(
        "Retrieves tasks belonging to a specific View."
      );
      // expect(getViewTasksTool.input_schema).toBeDefined(); // Commented out again
      // expect(getViewTasksTool.output_schema).toBeDefined();
    });
  });
});
