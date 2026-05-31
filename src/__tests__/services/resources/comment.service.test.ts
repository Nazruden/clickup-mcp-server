import axios, { AxiosInstance } from "axios";

import { CommentService } from "../../../services/resources/comment.service.js";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("CommentService", () => {
  let commentService: CommentService;
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

    commentService = new CommentService(mockClient);
  });

  describe("getTaskComments", () => {
    it("returns the comments array", async () => {
      const comments = [{ id: "c1", comment_text: "hi" }];
      mockClient.get.mockResolvedValueOnce({ data: { comments } });

      const result = await commentService.getTaskComments("task1");

      expect(mockClient.get).toHaveBeenCalledWith("/v2/task/task1/comment", {});
      expect(result).toEqual(comments);
    });

    it("returns [] when no comments present", async () => {
      mockClient.get.mockResolvedValueOnce({ data: {} });
      const result = await commentService.getTaskComments("task1");
      expect(result).toEqual([]);
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.get.mockRejectedValueOnce(new Error("boom"));
      await expect(commentService.getTaskComments("task1")).rejects.toThrow(
        "Failed to retrieve task comments from ClickUp",
      );
    });
  });

  describe("createTaskComment", () => {
    it("posts the payload and returns data", async () => {
      const payload = { comment_text: "hello", notify_all: false };
      mockClient.post.mockResolvedValueOnce({ data: { id: "c9" } });

      const result = await commentService.createTaskComment("task1", payload);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/v2/task/task1/comment",
        payload,
        {},
      );
      expect(result).toEqual({ id: "c9" });
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.post.mockRejectedValueOnce(new Error("boom"));
      await expect(
        commentService.createTaskComment("task1", { comment_text: "x" }),
      ).rejects.toThrow("Failed to create task comment in ClickUp");
    });
  });

  describe("updateComment", () => {
    it("puts the payload to the comment endpoint", async () => {
      const payload = { resolved: true };
      mockClient.put.mockResolvedValueOnce({ data: {} });

      await commentService.updateComment("c1", payload);

      expect(mockClient.put).toHaveBeenCalledWith("/v2/comment/c1", payload, {});
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.put.mockRejectedValueOnce(new Error("boom"));
      await expect(
        commentService.updateComment("c1", { comment_text: "x" }),
      ).rejects.toThrow("Failed to update comment in ClickUp");
    });
  });

  describe("deleteComment", () => {
    it("deletes the comment", async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      const result = await commentService.deleteComment("c1");
      expect(mockClient.delete).toHaveBeenCalledWith("/v2/comment/c1", {});
      expect(result).toEqual({});
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.delete.mockRejectedValueOnce(new Error("boom"));
      await expect(commentService.deleteComment("c1")).rejects.toThrow(
        "Failed to delete comment in ClickUp",
      );
    });
  });
});
