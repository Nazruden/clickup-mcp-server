import axios, { AxiosInstance } from "axios";

import { ChecklistService } from "../../../services/resources/checklist.service.js";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ChecklistService", () => {
  let checklistService: ChecklistService;
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

    checklistService = new ChecklistService(mockClient);
  });

  describe("getTaskChecklists", () => {
    it("returns checklists from the task object", async () => {
      const checklists = [{ id: "cl1", name: "QA", items: [] }];
      mockClient.get.mockResolvedValueOnce({ data: { checklists } });

      const result = await checklistService.getTaskChecklists("task1");

      expect(mockClient.get).toHaveBeenCalledWith("/v2/task/task1", {});
      expect(result).toEqual(checklists);
    });

    it("returns [] when task has no checklists", async () => {
      mockClient.get.mockResolvedValueOnce({ data: {} });
      const result = await checklistService.getTaskChecklists("task1");
      expect(result).toEqual([]);
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.get.mockRejectedValueOnce(new Error("boom"));
      await expect(
        checklistService.getTaskChecklists("task1"),
      ).rejects.toThrow("Failed to retrieve task checklists from ClickUp");
    });
  });

  describe("createChecklist", () => {
    it("posts the name to the task checklist endpoint", async () => {
      mockClient.post.mockResolvedValueOnce({ data: { checklist: { id: "cl1" } } });

      const result = await checklistService.createChecklist("task1", "QA");

      expect(mockClient.post).toHaveBeenCalledWith(
        "/v2/task/task1/checklist",
        { name: "QA" },
        {},
      );
      expect(result).toEqual({ checklist: { id: "cl1" } });
    });
  });

  describe("updateChecklist", () => {
    it("puts the payload to the checklist endpoint", async () => {
      mockClient.put.mockResolvedValueOnce({ data: {} });
      await checklistService.updateChecklist("cl1", { name: "Renamed" });
      expect(mockClient.put).toHaveBeenCalledWith(
        "/v2/checklist/cl1",
        { name: "Renamed" },
        {},
      );
    });
  });

  describe("deleteChecklist", () => {
    it("deletes the checklist", async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      await checklistService.deleteChecklist("cl1");
      expect(mockClient.delete).toHaveBeenCalledWith("/v2/checklist/cl1", {});
    });
  });

  describe("createChecklistItem", () => {
    it("posts the item payload", async () => {
      const payload = { name: "step 1" };
      mockClient.post.mockResolvedValueOnce({ data: { checklist: {} } });

      await checklistService.createChecklistItem("cl1", payload);

      expect(mockClient.post).toHaveBeenCalledWith(
        "/v2/checklist/cl1/checklist_item",
        payload,
        {},
      );
    });
  });

  describe("updateChecklistItem", () => {
    it("puts the resolved flag to the item endpoint", async () => {
      const payload = { resolved: true };
      mockClient.put.mockResolvedValueOnce({ data: { checklist: {} } });

      await checklistService.updateChecklistItem("cl1", "it1", payload);

      expect(mockClient.put).toHaveBeenCalledWith(
        "/v2/checklist/cl1/checklist_item/it1",
        payload,
        {},
      );
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.put.mockRejectedValueOnce(new Error("boom"));
      await expect(
        checklistService.updateChecklistItem("cl1", "it1", { resolved: true }),
      ).rejects.toThrow("Failed to update checklist item in ClickUp");
    });
  });

  describe("deleteChecklistItem", () => {
    it("deletes the checklist item", async () => {
      mockClient.delete.mockResolvedValueOnce({ data: {} });
      await checklistService.deleteChecklistItem("cl1", "it1");
      expect(mockClient.delete).toHaveBeenCalledWith(
        "/v2/checklist/cl1/checklist_item/it1",
        {},
      );
    });
  });
});
