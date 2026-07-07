#!/bin/bash
# ClickUp MCP Server wrapper — locates the server relative to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$SCRIPT_DIR/server.py"
