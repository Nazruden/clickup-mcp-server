import axios, { AxiosInstance } from "axios";
import { SpaceService } from "../../../services/resources/space.service.js";
import {
  GetSpacesParams,
  ClickUpSpace,
  CreateSpaceParams,
  UpdateSpaceParams,
  ClickUpSuccessResponse,
} from "../../../types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SpaceService", () => {
  let spaceService: SpaceService;
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

    spaceService = new SpaceService(mockClient);
  });

  // Test suite for getSpaces
  describe("getSpaces", () => {
    it("should retrieve spaces for a team and return space data", async () => {
      const params: GetSpacesParams = { team_id: "team_123", archived: false };
      const mockSpaceData: ClickUpSpace[] = [
        {
          id: "space1",
          name: "Space Alpha",
          private: false,
          color: null,
          avatar: null,
          features: {},
        },
      ];
      const mockResponse = { data: { spaces: mockSpaceData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await spaceService.getSpaces(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/team/${params.team_id}/space`,
        { params: { archived: "false" } }
      );
      expect(result).toEqual(mockResponse.data); // Service returns { spaces: [...] }
    });

    it("should retrieve archived spaces if archived is true", async () => {
      const params: GetSpacesParams = { team_id: "team_123", archived: true };
      const mockResponse = { data: { spaces: [] } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      await spaceService.getSpaces(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/team/${params.team_id}/space`,
        { params: { archived: "true" } }
      );
    });

    it("should throw an error if ClickUp API fails to get spaces", async () => {
      const params: GetSpacesParams = { team_id: "team_123" };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(spaceService.getSpaces(params)).rejects.toThrow(
        "Failed to retrieve spaces from ClickUp"
      );
    });
  });

  // Test suite for createSpace
  describe("createSpace", () => {
    it("should create a space and return space data", async () => {
      const params: CreateSpaceParams = {
        team_id: "team_123",
        name: "New Space",
      };
      const mockResponseData: ClickUpSpace = {
        id: "space_new",
        name: params.name,
        private: false,
        color: null,
        avatar: null,
        features: { due_dates: { enabled: true } },
      };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);
      const { team_id, ...bodyParams } = params;

      const result = await spaceService.createSpace(params);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/team/${team_id}/space`,
        bodyParams
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to create a space", async () => {
      const params: CreateSpaceParams = {
        team_id: "team_123",
        name: "New Space",
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      await expect(spaceService.createSpace(params)).rejects.toThrow(
        "Failed to create space in ClickUp"
      );
    });
  });

  // Test suite for getSpace
  describe("getSpace", () => {
    it("should retrieve a specific space and return its data", async () => {
      const spaceId = "space_abc";
      const mockResponseData: ClickUpSpace = {
        id: spaceId,
        name: "Specific Space",
        private: false,
        color: null,
        avatar: null,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await spaceService.getSpace(spaceId);

      expect(mockClient.get).toHaveBeenCalledWith(`/space/${spaceId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to get a space", async () => {
      const spaceId = "space_abc";
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(spaceService.getSpace(spaceId)).rejects.toThrow(
        "Failed to retrieve space from ClickUp"
      );
    });
  });

  // Test suite for updateSpace
  describe("updateSpace", () => {
    it("should update a space and return updated space data", async () => {
      const params: UpdateSpaceParams = {
        space_id: "space_xyz",
        name: "Updated Space Name",
      };
      const mockResponseData: ClickUpSpace = {
        id: params.space_id,
        name: params.name!,
        private: false,
        color: "#FFFFFF",
        avatar: null,
        features: {},
      };
      const mockResponse = { data: mockResponseData };
      mockClient.put.mockResolvedValueOnce(mockResponse);
      const { space_id, ...bodyParams } = params;

      const result = await spaceService.updateSpace(params);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/space/${space_id}`,
        bodyParams
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails during space update", async () => {
      const params: UpdateSpaceParams = {
        space_id: "space_xyz",
        name: "Updated Space Name",
      };
      mockClient.put.mockRejectedValueOnce(new Error("API Error"));
      await expect(spaceService.updateSpace(params)).rejects.toThrow(
        "Failed to update space in ClickUp"
      );
    });
  });

  // Test suite for deleteSpace
  describe("deleteSpace", () => {
    it("should delete a space and return success response", async () => {
      const spaceId = "space_todelete";
      const mockResponse = { data: {} as ClickUpSuccessResponse };
      mockClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await spaceService.deleteSpace(spaceId);

      expect(mockClient.delete).toHaveBeenCalledWith(`/space/${spaceId}`);
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw an error if ClickUp API fails to delete a space", async () => {
      const spaceId = "space_todelete";
      mockClient.delete.mockRejectedValueOnce(new Error("API Error"));
      await expect(spaceService.deleteSpace(spaceId)).rejects.toThrow(
        "Failed to delete space in ClickUp"
      );
    });
  });
});
