import axios, { AxiosInstance } from "axios";

import { FolderService } from "../../../services/resources/folder.service.js";
import {
  GetFoldersParams,
  ClickUpFolder,
  CreateFolderParams,
  UpdateFolderParams,
  ClickUpSuccessResponse,
} from "../../../types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("FolderService", () => {
  let folderService: FolderService;
  let mockClient: jest.Mocked<AxiosInstance>;

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

    folderService = new FolderService(mockClient);
  });

  // Test suite for getFolders
  describe("getFolders", () => {
    it("should retrieve folders for a space and return folder data", async () => {
      const params: GetFoldersParams = {
        space_id: "space_123",
        archived: false,
      };
      const mockFolderData: ClickUpFolder[] = [
        {
          id: "folder1",
          name: "Folder Alpha",
          orderindex: 0,
          override_statuses: false,
          hidden: false,
          space: { id: "space_123", name: "Test Space", access: true },
          task_count: "10",
          archived: false,
          lists: [],
        },
      ];
      const mockResponse = { data: { folders: mockFolderData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await folderService.getFolders(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/space/${params.space_id}/folder`,
        { params: { archived: "false" } }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to get folders", async () => {
      const params: GetFoldersParams = { space_id: "space_123" };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(folderService.getFolders(params)).rejects.toThrow(
        "Failed to retrieve folders from ClickUp"
      );
    });
  });

  // Test suite for createFolder
  describe("createFolder", () => {
    it("should create a folder and return folder data", async () => {
      const params: CreateFolderParams = {
        space_id: "space_123",
        name: "New Folder",
      };
      const mockResponseData: ClickUpFolder = {
        id: "folder_new",
        name: params.name,
        orderindex: 0,
        override_statuses: false,
        hidden: false,
        space: { id: params.space_id, name: "Test Space", access: true },
        task_count: "0",
        archived: false,
        lists: [],
      };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);
      const { space_id, ...bodyParams } = params;

      const result = await folderService.createFolder(params);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/space/${space_id}/folder`,
        bodyParams
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to create a folder", async () => {
      const params: CreateFolderParams = {
        space_id: "space_123",
        name: "New Folder",
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      await expect(folderService.createFolder(params)).rejects.toThrow(
        "Failed to create folder in ClickUp"
      );
    });
  });

  // Test suite for getFolder
  describe("getFolder", () => {
    it("should retrieve a specific folder and return its data", async () => {
      const folderId = "folder_abc";
      const mockResponseData: ClickUpFolder = {
        id: folderId,
        name: "Specific Folder",
        orderindex: 0,
        override_statuses: false,
        hidden: false,
        space: { id: "space_123", name: "Test Space", access: true },
        task_count: "5",
        archived: false,
        lists: [],
      };
      const mockResponse = { data: mockResponseData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await folderService.getFolder(folderId);

      expect(mockClient.get).toHaveBeenCalledWith(`/folder/${folderId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to get a folder", async () => {
      const folderId = "folder_abc";
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(folderService.getFolder(folderId)).rejects.toThrow(
        "Failed to retrieve folder from ClickUp"
      );
    });
  });

  // Test suite for updateFolder
  describe("updateFolder", () => {
    it("should update a folder and return updated folder data", async () => {
      const params: UpdateFolderParams = {
        folder_id: "folder_xyz",
        name: "Updated Folder",
      };
      const mockResponseData: ClickUpFolder = {
        id: params.folder_id,
        name: params.name!,
        orderindex: 0,
        override_statuses: false,
        hidden: false,
        space: { id: "space_123", name: "Test Space", access: true },
        task_count: "10",
        archived: false,
        lists: [],
      };
      const mockResponse = { data: mockResponseData };
      mockClient.put.mockResolvedValueOnce(mockResponse);
      const { folder_id, ...bodyParams } = params;

      const result = await folderService.updateFolder(params);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/folder/${folder_id}`,
        bodyParams
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails during folder update", async () => {
      const params: UpdateFolderParams = {
        folder_id: "folder_xyz",
        name: "Updated Folder",
      };
      mockClient.put.mockRejectedValueOnce(new Error("API Error"));
      await expect(folderService.updateFolder(params)).rejects.toThrow(
        "Failed to update folder in ClickUp"
      );
    });
  });

  // Test suite for deleteFolder
  describe("deleteFolder", () => {
    it("should delete a folder and return success response", async () => {
      const folderId = "folder_todelete";
      const mockResponse = { data: {} as ClickUpSuccessResponse };
      mockClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await folderService.deleteFolder(folderId);

      expect(mockClient.delete).toHaveBeenCalledWith(`/folder/${folderId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to delete a folder", async () => {
      const folderId = "folder_todelete";
      mockClient.delete.mockRejectedValueOnce(new Error("API Error"));
      await expect(folderService.deleteFolder(folderId)).rejects.toThrow(
        "Failed to delete folder in ClickUp"
      );
    });
  });
});
