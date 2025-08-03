import axios, { AxiosInstance } from "axios";

import { DocService } from "../../../services/resources/doc.service.js";
import {
  SearchDocsParams,
  ClickUpDoc,
  CreateDocParams,
  ClickUpDocPage,
  GetDocPagesParams,
  CreateDocPageParams,
  GetDocPageContentParams,
  EditDocPageContentParams,
} from "../../../types";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DocService", () => {
  let docService: DocService;
  let mockClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockedAxios.post.mockClear();
    mockedAxios.put.mockClear();

    mockClient = {
      get: mockedAxios.get,
      post: mockedAxios.post,
      put: mockedAxios.put,
    } as unknown as jest.Mocked<AxiosInstance>;

    docService = new DocService(mockClient);
  });

  // Test suite for searchDocs
  describe("searchDocs", () => {
    it("should search docs in a workspace and return doc data", async () => {
      const params: SearchDocsParams = { team_id: "123", query: "Report" };
      const mockDocsData: ClickUpDoc[] = [
        { id: "doc_1", name: "Quarterly Report" },
        { id: "doc_2", name: "Annual Report" },
      ];
      const mockResponse = { data: { docs: mockDocsData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await docService.searchDocs(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/v3/workspaces/${params.team_id}/docs`,
        { params: {} },
      );
      expect(result).toEqual(mockDocsData);
    });

    it("should include include_archived parameter when provided for v3 search", async () => {
      const params: SearchDocsParams = {
        team_id: "123",
        include_archived: true,
      };
      const mockResponse = { data: { docs: [] } };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      await docService.searchDocs(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/v3/workspaces/${params.team_id}/docs`,
        { params: { archived: true } },
      );
    });

    it("should throw an error if ClickUp API fails to search docs (v3)", async () => {
      const params: SearchDocsParams = { team_id: "123" };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      await expect(docService.searchDocs(params)).rejects.toThrow(
        `Failed to search docs in workspace ${params.team_id} from ClickUp (v3 attempt)`,
      );
    });
  });

  // Test suite for createDoc
  describe("createDoc", () => {
    it("should create a doc in a workspace and return doc data (v3)", async () => {
      const params: CreateDocParams = {
        workspace_id: "123",
        name: "New Doc",
      };
      const mockResponseData: ClickUpDoc = { id: "doc_xyz", name: params.name };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await docService.createDoc(params);
      const numericWorkspaceId = parseInt(params.workspace_id, 10);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs`,
        { name: params.name },
        {},
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if workspace_id is not provided for v3 createDoc", async () => {
      const params = { name: "Invalid Doc" } as any;
      await expect(docService.createDoc(params)).rejects.toThrow(
        "workspace_id is required for creating a ClickUp Doc (v3).",
      );
    });

    it("should throw an error if workspace_id is not a valid number for v3 createDoc", async () => {
      const params: CreateDocParams = { workspace_id: "abc", name: "Test Doc" };
      await expect(docService.createDoc(params)).rejects.toThrow(
        `Invalid workspace_id: 'abc' must be a numeric string.`,
      );
    });

    it("should throw an error if ClickUp API fails (v3 createDoc)", async () => {
      const params: CreateDocParams = {
        workspace_id: "123",
        name: "New Doc",
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      const numericWorkspaceId = parseInt(params.workspace_id, 10);
      await expect(docService.createDoc(params)).rejects.toThrow(
        `Failed to create doc for workspace ${numericWorkspaceId} from ClickUp (v3 attempt using spec)`,
      );
    });
  });

  // Test suite for getDocPages
  describe("getDocPages", () => {
    it("should retrieve pages for a doc and return page data (v3)", async () => {
      const params: GetDocPagesParams = {
        workspace_id: "123",
        doc_id: "doc_123",
      };
      const mockPageData: ClickUpDocPage[] = [
        { id: "page_1", doc_id: params.doc_id, title: "Page 1", orderindex: 0 },
      ];
      const mockResponse = { data: { pages: mockPageData } };
      mockClient.get.mockResolvedValueOnce(mockResponse);
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);

      const result = await docService.getDocPages(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs/${params.doc_id}/pages`,
        { params: {} },
      );
      expect(result).toEqual(mockPageData);
    });

    it("should throw an error if workspace_id is not provided for v3 getDocPages", async () => {
      const params = { doc_id: "doc_123" } as any;
      await expect(docService.getDocPages(params)).rejects.toThrow(
        "workspace_id is required for getting Doc Pages (v3).",
      );
    });

    it("should throw an error if workspace_id is not a valid number for v3 getDocPages", async () => {
      const params: GetDocPagesParams = {
        workspace_id: "abc",
        doc_id: "doc_123",
      };
      await expect(docService.getDocPages(params)).rejects.toThrow(
        `Invalid workspace_id: 'abc' must be a numeric string.`,
      );
    });

    it("should throw an error if ClickUp API fails to get doc pages (v3)", async () => {
      const params: GetDocPagesParams = {
        workspace_id: "123",
        doc_id: "doc_123",
      };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);
      await expect(docService.getDocPages(params)).rejects.toThrow(
        `Failed to retrieve pages for doc ${params.doc_id} (workspace: ${numericWorkspaceId}) from ClickUp (v3 attempt)`,
      );
    });
  });

  // Test suite for createDocPage
  describe("createDocPage", () => {
    it("should create a page in a doc and return page data (v3)", async () => {
      const params: CreateDocPageParams = {
        workspace_id: "123",
        doc_id: "doc_456",
        name: "New Page",
        content: "# Hello",
      };
      const mockResponseData: ClickUpDocPage = {
        id: "page_abc",
        doc_id: params.doc_id,
        title: params.name,
        orderindex: 0,
        content: params.content,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.post.mockResolvedValueOnce(mockResponse);

      const result = await docService.createDocPage(params);
      const numericWorkspaceId = parseInt(params.workspace_id, 10);

      expect(mockClient.post).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs/${params.doc_id}/pages`,
        { name: params.name, content: params.content },
        {},
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if workspace_id is missing for v3 createDocPage", async () => {
      const params = { doc_id: "doc_123", name: "Error Page" } as any;
      await expect(docService.createDocPage(params)).rejects.toThrow(
        "workspace_id is required for creating a Doc Page (v3).",
      );
    });

    it("should throw an error if workspace_id is not a valid number for v3 createDocPage", async () => {
      const params: CreateDocPageParams = {
        workspace_id: "ws_abc",
        doc_id: "doc_123",
        name: "Test Page",
      };
      await expect(docService.createDocPage(params)).rejects.toThrow(
        `Invalid workspace_id: 'ws_abc' must be a numeric string for createDocPage.`,
      );
    });

    it("should throw an error if ClickUp API fails to create doc page (v3)", async () => {
      const params: CreateDocPageParams = {
        workspace_id: "123",
        doc_id: "doc_123",
        name: "Error Page",
      };
      mockClient.post.mockRejectedValueOnce(new Error("API Error"));
      const numericWorkspaceId = parseInt(params.workspace_id, 10);
      await expect(docService.createDocPage(params)).rejects.toThrow(
        `Failed to create page in doc ${params.doc_id} (workspace: ${numericWorkspaceId}) in ClickUp (v3 attempt)`,
      );
    });
  });

  // Test suite for getDocPageContent
  describe("getDocPageContent", () => {
    it("should retrieve content for a page and return the content string (v3)", async () => {
      const params: GetDocPageContentParams = {
        workspace_id: "123",
        doc_id: "doc_789",
        page_id: "page_xyz",
      };
      const mockPageData: ClickUpDocPage = {
        id: params.page_id,
        doc_id: params.doc_id,
        title: "Page Title",
        orderindex: 0,
        content: "# Content",
      };
      const mockResponse = { data: mockPageData };
      mockClient.get.mockResolvedValueOnce(mockResponse);

      const result = await docService.getDocPageContent(params);
      const numericWorkspaceId = parseInt(params.workspace_id, 10);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs/${params.doc_id}/pages/${params.page_id}`,
        { params: {} },
      );
      expect(result).toEqual("# Content");
    });

    it("should throw an error if workspace_id is not provided for v3 getDocPageContent", async () => {
      const params = { doc_id: "doc_789", page_id: "page_xyz" } as any;
      await expect(docService.getDocPageContent(params)).rejects.toThrow(
        "workspace_id is required for getting Doc Page content (v3).",
      );
    });

    it("should throw an error if workspace_id is not a valid number for v3 getDocPageContent", async () => {
      const params: GetDocPageContentParams = {
        workspace_id: "ws_abc",
        doc_id: "doc_123",
        page_id: "page_456",
      };
      await expect(docService.getDocPageContent(params)).rejects.toThrow(
        `Invalid workspace_id: 'ws_abc' must be numeric for getDocPageContent.`,
      );
    });

    it("should return empty string if page content is null (v3)", async () => {
      const params: GetDocPageContentParams = {
        workspace_id: "123",
        doc_id: "doc_789",
        page_id: "page_null",
      };
      const mockPageData: ClickUpDocPage = {
        id: params.page_id,
        doc_id: params.doc_id,
        title: "Page With Null Content",
        orderindex: 0,
        content: null,
      };
      const mockResponse = { data: mockPageData };
      mockClient.get.mockResolvedValueOnce(mockResponse);
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);

      const result = await docService.getDocPageContent(params);

      expect(mockClient.get).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs/${params.doc_id}/pages/${params.page_id}`,
        { params: {} },
      );
      expect(result).toEqual("");
    });

    it("should throw an error if ClickUp API fails to get page content (v3)", async () => {
      const params: GetDocPageContentParams = {
        workspace_id: "123",
        doc_id: "doc_789",
        page_id: "page_error",
      };
      mockClient.get.mockRejectedValueOnce(new Error("API Error"));
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);
      await expect(docService.getDocPageContent(params)).rejects.toThrow(
        `Failed to retrieve content for page ${params.page_id} (doc: ${params.doc_id}, ws: ${numericWorkspaceId}) from ClickUp (v3 attempt)`,
      );
    });
  });

  // Test suite for editDocPageContent
  describe("editDocPageContent", () => {
    it("should edit a page's content and title and return the updated page data (v3)", async () => {
      const params: EditDocPageContentParams = {
        workspace_id: "123",
        doc_id: "doc_abc",
        page_id: "page_def",
        content: "## New Content",
        title: "New Page Title",
      };
      const mockResponseData: ClickUpDocPage = {
        id: params.page_id,
        doc_id: params.doc_id,
        title: params.title!,
        orderindex: 1,
        content: params.content,
      };
      const mockResponse = { data: mockResponseData };
      mockClient.put.mockResolvedValueOnce(mockResponse);
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);

      const result = await docService.editDocPageContent(params);

      expect(mockClient.put).toHaveBeenCalledWith(
        `/api/v3/workspaces/${numericWorkspaceId}/docs/${params.doc_id}/pages/${params.page_id}`,
        { content: params.content, name: params.title },
        {},
      );
      expect(result).toEqual(mockResponseData);
    });

    it("should throw an error if workspace_id is not provided for v3 editDocPageContent", async () => {
      const params = {
        doc_id: "doc_abc",
        page_id: "page_def",
        content: "...",
      } as any;
      await expect(docService.editDocPageContent(params)).rejects.toThrow(
        "workspace_id is required for editing Doc Page content (v3).",
      );
    });

    it("should throw an error if workspace_id is not a valid number for v3 editDocPageContent", async () => {
      const params: EditDocPageContentParams = {
        workspace_id: "ws_abc",
        doc_id: "doc_123",
        page_id: "page_456",
        content: "...",
      };
      await expect(docService.editDocPageContent(params)).rejects.toThrow(
        `Invalid workspace_id: 'ws_abc' must be numeric for editDocPageContent.`,
      );
    });

    it("should throw an error if ClickUp API fails to edit page content (v3)", async () => {
      const params: EditDocPageContentParams = {
        workspace_id: "123",
        doc_id: "doc_abc",
        page_id: "page_error",
        content: "## Error Content",
      };
      mockClient.put.mockRejectedValueOnce(new Error("API Error"));
      const numericWorkspaceId = parseInt(params.workspace_id as string, 10);
      await expect(docService.editDocPageContent(params)).rejects.toThrow(
        `Failed to edit content for page ${params.page_id} (doc: ${params.doc_id}, ws: ${numericWorkspaceId}) in ClickUp (v3 attempt)`,
      );
    });
  });
});
