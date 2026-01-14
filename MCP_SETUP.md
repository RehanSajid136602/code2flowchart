# MCP Servers Configuration

## Browser MCP (Puppeteer)
**Type**: Local
**Command**: `npx -y @modelcontextprotocol/server-puppeteer`

### Features
- Navigate web pages
- Take screenshots
- Execute JavaScript in browser context
- Fill forms and interact with elements

### Usage
```
use browser to navigate to https://example.com and take a screenshot
```

## GitHub MCP (Official)
**Type**: Remote
**URL**: `https://api.githubcopilot.com/mcp/`

### Features
- Repository management
- Issue & PR operations
- GitHub Actions
- Code security scanning
- Gist management
- Discussions

### Authentication
GitHub MCP will automatically prompt for OAuth when you first use it.

### Usage
```
use github to list issues in owner/repo
```

## Authentication Steps

### GitHub MCP
When you first use the GitHub MCP server, OpenCode will:
1. Detect authentication requirement
2. Open browser for OAuth flow
3. Store tokens securely in `~/.local/share/opencode/mcp-auth.json`

You can also manually authenticate:
```bash
opencode mcp auth github
```

### Browser MCP
No authentication required. It will launch a local Chromium instance.

## Managing MCP Servers

List all MCP servers:
```bash
opencode mcp list
```

Authenticate with a specific server:
```bash
opencode mcp auth <server-name>
```

Logout from a server:
```bash
opencode mcp logout <server-name>
```

## Available GitHub Toolsets
The GitHub MCP supports multiple toolsets:
- `context` - User and GitHub context
- `repos` - Repository operations
- `issues` - Issue management
- `pull_requests` - PR operations
- `actions` - GitHub Actions workflows
- `code_security` - Code scanning alerts
- `dependabot` - Dependabot alerts
- `gists` - Gist operations
- `discussions` - GitHub Discussions
- And many more...

By default, the server uses `default` toolset which includes: context, repos, issues, pull_requests, users

## Tips
- MCP servers add to context - be mindful of token usage
- GitHub MCP tends to add a lot of tokens
- You can temporarily disable servers by setting `"enabled": false` in config
