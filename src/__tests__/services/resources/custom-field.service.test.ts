import axios, { AxiosInstance } from "axios";

import { CustomFieldService } from "../../../services/resources/custom-field.service.js";
import {
  ClickUpCustomField,
  SetTaskCustomFieldValueParams,
  RemoveTaskCustomFieldValueParams,
  ClickUpSuccessResponse,
} from "../../../types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CustomFieldService", () => {
  let customFieldService: CustomFieldService;
  let mockClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.delete.mockClear();

    mockClient = {
      get: mockedAxios.get,
      post: mockedAxios.post,
      delete: mockedAxios.delete,
    } as unknown as jest.Mocked<AxiosInstance>;

    customFieldService = new CustomFieldService(mockClient);
  });

  // Test suite for getCustomFields
  describe("getCustomFields", () => {
    it("should retrieve custom fields for a list and return field data", async () => {
      const listId = "list_abc";
      const mockCustomFieldsData: ClickUpCustomField[] = [
        {
          id: "field_1",
          name: "Text Field",
          type: "text",
          type_config: {},
          date_created: "1672531200000",
          hide_from_guests: false,
        },
        {
          id: "field_2",
          name: "Dropdown Field",
          type: "drop_down",
          type_config: {
            options: [{ id: "opt_1", name: "Option 1", color: "#FF0000" }],
          },
          date_created: "1672531200000",
          hide_from_guests: false,
        },
      ];
      const mockResponse = { data: { fields: mockCustomFieldsData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await customFieldService.getCustomFields(listId);

      expect(mockClient.get).toHaveBeenCalledWith(`/list/${listId}/field`, {});
      expect(result).toEqual(mockCustomFieldsData);
    });

    it("should throw an error if ClickUp API fails to get custom fields", async () => {
      const listId = "list_abc";
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(customFieldService.getCustomFields(listId)).rejects.toThrow(
        `Failed to retrieve custom fields for list ${listId} from ClickUp`,
      );
    });
  });

  // Test suite for setTaskCustomFieldValue
  describe("setTaskCustomFieldValue", () => {
    it("should set a custom field value on a task and return success", async () => {
      const params: SetTaskCustomFieldValueParams = {
        task_id: "task_123",
        field_id: "field_abc",
        value: "New text value",
      };
      const mockResponseData: ClickUpSuccessResponse = {};
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await customFieldService.setTaskCustomFieldValue(params);

      const expectedBody = { value: params.value };
      expect(mockClient.post).toHaveBeenCalledWith(
        `/task/${params.task_id}/field/${params.field_id}`,
        expectedBody,
        {},
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should correctly include value_options in the request body", async () => {
      const params: SetTaskCustomFieldValueParams = {
        task_id: "task_456",
        field_id: "field_def_date",
        value: 1678886400000,
        value_options: { time: true },
      };
      const mockResponseData: ClickUpSuccessResponse = {};
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      await customFieldService.setTaskCustomFieldValue(params);

      const expectedBody = {
        value: params.value,
        value_options: params.value_options,
      };
      expect(mockClient.post).toHaveBeenCalledWith(
        `/task/${params.task_id}/field/${params.field_id}`,
        expectedBody,
        {},
      );
    });

    it("should throw an error if ClickUp API fails to set custom field value", async () => {
      const params: SetTaskCustomFieldValueParams = {
        task_id: "task_789",
        field_id: "field_xyz",
        value: false,
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      await expect(
        customFieldService.setTaskCustomFieldValue(params),
      ).rejects.toThrow(
        `Failed to set custom field ${params.field_id} for task ${params.task_id} in ClickUp`,
      );
    });
  });

  // Test suite for removeTaskCustomFieldValue
  describe("removeTaskCustomFieldValue", () => {
    it("should remove a custom field value from a task and return success", async () => {
      const params: RemoveTaskCustomFieldValueParams = {
        task_id: "task_123",
        field_id: "field_abc",
      };
      const mockResponseData: ClickUpSuccessResponse = {};
      const mockResponse = { data: mockResponseData };
      mockClient.delete.mockResolvedValueOnce(mockResponse);

      const result =
        await customFieldService.removeTaskCustomFieldValue(params);

      expect(mockClient.delete).toHaveBeenCalledWith(
        `/task/${params.task_id}/field/${params.field_id}`,
        {},
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if ClickUp API fails to remove custom field value", async () => {
      const params: RemoveTaskCustomFieldValueParams = {
        task_id: "task_789",
        field_id: "field_xyz",
      };
      mockClient.delete.mockRejectedValueOnce(new Error("API Error"));
      await expect(
        customFieldService.removeTaskCustomFieldValue(params),
      ).rejects.toThrow(
        `Failed to remove custom field ${params.field_id} for task ${params.task_id} from ClickUp`,
      );
    });
  });
});
