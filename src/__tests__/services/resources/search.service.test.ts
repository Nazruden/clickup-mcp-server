import axios, { AxiosInstance } from "axios";

import { SearchService } from "../../../services/resources/search.service.js";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("SearchService", () => {
  let searchService: SearchService;
  let mockClient: jest.Mocked<AxiosInstance>;

  beforeEach(() => {
    mockedAxios.get.mockClear();
    mockClient = {
      get: mockedAxios.get,
    } as unknown as jest.Mocked<AxiosInstance>;
    searchService = new SearchService(mockClient);
  });

  describe("searchTasksByTags", () => {
    it("throws when no tags are provided", async () => {
      await expect(
        searchService.searchTasksByTags({ tags: [], team_id: "t1" }),
      ).rejects.toThrow("At least one tag is required");
    });

    it("uses the provided team_id and native tag filter", async () => {
      mockClient.get.mockResolvedValueOnce({
        data: {
          last_page: true,
          tasks: [
            {
              id: "1",
              name: "Task one",
              status: { status: "open" },
              list: { name: "Backlog" },
              tags: [{ name: "mobile" }],
              url: "http://x/1",
            },
          ],
        },
      });

      const result = await searchService.searchTasksByTags({
        tags: ["mobile"],
        team_id: "team1",
      });

      const calledUrl = mockClient.get.mock.calls[0][0] as string;
      expect(calledUrl).toContain("/v2/team/team1/task?");
      expect(calledUrl).toContain("tags%5B%5D=mobile"); // tags[]=mobile
      expect(calledUrl).toContain("page=0");
      expect(result.count).toBe(1);
      expect(result.last_page).toBe(true);
      expect(result.tasks[0]).toMatchObject({
        id: "1",
        name: "Task one",
        status: "open",
        list: "Backlog",
        tags: ["mobile"],
      });
    });

    it("resolves the first team when team_id is omitted", async () => {
      mockClient.get
        .mockResolvedValueOnce({ data: { teams: [{ id: "auto-team" }] } })
        .mockResolvedValueOnce({ data: { last_page: true, tasks: [] } });

      const result = await searchService.searchTasksByTags({ tags: ["x"] });

      expect(mockClient.get.mock.calls[0][0]).toBe("/v2/team");
      expect(mockClient.get.mock.calls[1][0]).toContain("/v2/team/auto-team/task?");
      expect(result.team_id).toBe("auto-team");
    });

    it("includes optional statuses and include_closed", async () => {
      mockClient.get.mockResolvedValueOnce({
        data: { last_page: true, tasks: [] },
      });

      await searchService.searchTasksByTags({
        tags: ["a", "b"],
        team_id: "t1",
        statuses: ["in progress"],
        include_closed: true,
      });

      const url = mockClient.get.mock.calls[0][0] as string;
      expect(url).toContain("include_closed=true");
      expect(url).toContain("tags%5B%5D=a");
      expect(url).toContain("tags%5B%5D=b");
      expect(url).toContain("statuses%5B%5D=in+progress");
    });

    it("throws a friendly error on API failure", async () => {
      mockClient.get.mockRejectedValueOnce(new Error("boom"));
      await expect(
        searchService.searchTasksByTags({ tags: ["x"], team_id: "t1" }),
      ).rejects.toThrow("Failed to search tasks in ClickUp");
    });
  });
});
