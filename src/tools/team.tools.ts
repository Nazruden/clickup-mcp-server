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
    // The 'text' field in the response content will be a JSON string representing an array of team objects.
    // While the MCP content type is 'text', this describes the structure of the stringified JSON.
    type: "object",
    description:
      "A JSON string representing an array of team objects. Each object should have at least 'id' and 'name'.",
    // It's also common to have no outputSchema or a very generic one when the content type is 'text'
    // and the actual structure is implicitly defined by the description.
    // For example:
    // description: "A JSON string representing an array of team objects."
  },
};

// Handler Function
export async function handleGetTeams(
  clickUpService: ClickUpService,
  args: Record<string, unknown> // Args likely unused but kept for consistent signature
) {
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
    };
  } catch (error) {
    logger.error(`Error in ${getTeamsTool.name}:`, error);
    // The main error handler in src/index.ts should format this into the MCP error structure.
    // For direct error shaping here, it would be:
    // return {
    //   isError: true,
    //   content: [{ type: "text", text: error instanceof Error ? error.message : "Failed to get teams" }]
    // };
    // But typically, throwing the error is preferred to let the central handler manage it.
    throw error instanceof Error ? error : new Error("Failed to get teams");
  }
}
