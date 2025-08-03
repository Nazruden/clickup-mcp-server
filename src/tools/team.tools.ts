import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { ClickUpService } from "../services/clickup.service.js";
import { logger } from "../logger.js";

// Tool Definition
export const getTeamsTool: Tool = {
  name: "clickup_get_teams",
  description:
    "Get all teams (workspaces) accessible to the authenticated user.",
  inputSchema: {
    type: "object",
    properties: {}, // No input arguments needed
  },
  outputSchema: {
    type: "object",
    properties: {
      teams: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" }
          }
        }
      }
    },
    description: "An object containing an array of team objects in the 'teams' property."
  },
};

// Handler Function
export async function handleGetTeams(
  clickUpService: ClickUpService,
  args: Record<string, unknown>, // Args likely unused but kept for consistent signature
): Promise<any> {
  logger.info(`Handling tool call: ${getTeamsTool.name}`);
  try {
    const teams = await clickUpService.getTeams();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(teams, null, 2), // Stringify the JSON data
        },
      ],
      // AJOUT: structuredContent requis par MCP quand outputSchema est défini
      structuredContent: { teams },
    };
  } catch (error) {
    logger.error(`Error in ${getTeamsTool.name}:`, error);
    throw error instanceof Error ? error : new Error("Failed to get teams");
  }
}
