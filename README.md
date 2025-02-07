# ClickUp MCP Server

A Model Context Protocol server implementation for ClickUp integration, enabling AI assistants to interact with ClickUp workspaces.

<a href="https://glama.ai/mcp/servers/9a7p2exf6u"><img width="380" height="200" src="https://glama.ai/mcp/servers/9a7p2exf6u/badge" alt="ClickUp Server MCP server" /></a>

## Quick Start

1. Configure Claude for Desktop:

```json
{
  "mcpServers": {
    "clickup": {
      "command": "npx",
      "args": ["@mcp/clickup-server"],
      "env": {
        "CLICKUP_CLIENT_ID": "your_client_id",
        "CLICKUP_CLIENT_SECRET": "your_client_secret",
        "CLICKUP_REDIRECT_URI": "http://localhost:3000/oauth/callback"
      }
    }
  }
}
```

2. Restart Claude for Desktop

That's it! The server will be automatically downloaded and started when needed.

## Environment Variables

Required environment variables:

- `CLICKUP_CLIENT_ID`: Your ClickUp OAuth client ID
- `CLICKUP_CLIENT_SECRET`: Your ClickUp OAuth client secret
- `CLICKUP_REDIRECT_URI`: OAuth redirect URI (default: http://localhost:3000/oauth/callback)

Optional environment variables:

- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: info)

## Available Tools

### Task Management

- `clickup_create_task`: Create a new task in a ClickUp list
- `clickup_update_task`: Update an existing task's properties

### Team & List Management

- `clickup_get_teams`: Retrieve all accessible teams
- `clickup_get_lists`: Get all lists in a specific folder

### Board Management

- `clickup_create_board`: Create a new board in a ClickUp space

## Development

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start in development mode:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Run tests:

```bash
npm test
```

## Security

- All tokens are encrypted at rest
- OAuth2 flow for secure authentication
- No sensitive data logged
- Rate limiting to prevent API abuse

## Troubleshooting

### Common Issues

1. **Authentication Errors**

   - Verify your OAuth credentials in the environment variables
   - Check token expiration
   - Ensure proper redirect URI

2. **Rate Limiting**

   - The server implements automatic rate limit handling
   - Check logs for rate limit warnings
   - Consider implementing request batching

3. **Server Not Starting**
   - Check environment variables are properly set
   - Verify port 3000 is available
   - Check Claude for Desktop logs

### Getting Logs

Claude for Desktop logs can be found at:

- Windows: `%USERPROFILE%\AppData\Local\Claude\Logs\mcp*.log`
- macOS: `~/Library/Logs/Claude/mcp*.log`

## License

MIT License - see LICENSE file for details
