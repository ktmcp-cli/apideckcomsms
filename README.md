> "Six months ago, everyone was talking about MCPs. And I was like, screw MCPs. Every MCP would be better as a CLI."
>
> — [Peter Steinberger](https://twitter.com/steipete), Founder of OpenClaw
> [Watch on YouTube (~2:39:00)](https://www.youtube.com/@lexfridman) | [Lex Fridman Podcast #491](https://lexfridman.com/peter-steinberger/)

# Apideck SMS CLI

A production-ready command-line interface for the [Apideck SMS API](https://www.apideck.com/sms-api). Send and manage SMS messages across multiple providers (Twilio, MessageBird, Plivo, Vonage, and more) through a single unified API from your terminal.

> **Disclaimer**: This is an unofficial CLI tool and is not affiliated with, endorsed by, or supported by Apideck.

## Features

- **Unified SMS API** — One CLI to rule all SMS providers (Twilio, MessageBird, Plivo, Telnyx, Vonage, etc.)
- **Message Management** — List, send, get, update, and delete SMS messages
- **Provider Agnostic** — Switch providers without changing your code
- **JSON output** — All commands support `--json` for scripting and piping
- **Colorized output** — Clean, readable terminal output

## Why CLI > MCP

MCP servers are complex, stateful, and require a running server process. A CLI is:

- **Simpler** — Just a binary you call directly
- **Composable** — Pipe output to `jq`, `grep`, `awk`, and other tools
- **Scriptable** — Use in shell scripts, CI/CD pipelines, cron jobs
- **Debuggable** — See exactly what's happening with `--json` flag
- **AI-friendly** — AI agents can call CLIs just as easily as MCPs, with less overhead

## Installation

```bash
npm install -g @ktmcp-cli/apideckcomsms
```

## Authentication Setup

### 1. Get Apideck Credentials

1. Sign up at [apideck.com](https://www.apideck.com)
2. Create an application to get your App ID
3. Generate an API key
4. Connect an SMS provider (Twilio, MessageBird, etc.)

### 2. Configure the CLI

```bash
apideckcomsms config set --api-key YOUR_API_KEY --app-id YOUR_APP_ID
```

Optionally set a consumer ID (defaults to 'default-consumer'):
```bash
apideckcomsms config set --consumer-id YOUR_CONSUMER_ID
```

### 3. Verify

```bash
apideckcomsms config show
```

## Commands

### Configuration

```bash
# Set credentials
apideckcomsms config set --api-key <key> --app-id <id>

# Set consumer ID (optional)
apideckcomsms config set --consumer-id <id>

# Show current config
apideckcomsms config show
```

### Messages

```bash
# List messages
apideckcomsms messages list

# Get a specific message
apideckcomsms messages get <message-id>

# Send an SMS
apideckcomsms messages send --to "+1234567890" --body "Hello from CLI"
apideckcomsms messages send --to "+1234567890" --from "+0987654321" --body "Hello"

# Delete a message
apideckcomsms messages delete <message-id>
```

## JSON Output

All commands support `--json` for machine-readable output:

```bash
# Get all messages as JSON
apideckcomsms messages list --json

# Pipe to jq for filtering
apideckcomsms messages list --json | jq '.[] | select(.status == "delivered")'

# Send message and capture ID
ID=$(apideckcomsms messages send --to "+1234567890" --body "Test" --json | jq -r '.id')
```

## Examples

### Send SMS notifications

```bash
# Send a simple message
apideckcomsms messages send --to "+1234567890" --body "Your order has shipped!"

# Send with specific sender
apideckcomsms messages send \
  --from "+0987654321" \
  --to "+1234567890" \
  --body "Verification code: 123456"
```

### Track message delivery

```bash
# Send message and get ID
apideckcomsms messages send --to "+1234567890" --body "Test" --json

# Check message status
apideckcomsms messages get <message-id> --json | jq '.status'
```

### Bulk messaging with shell

```bash
# Read numbers from file and send
while read number; do
  apideckcomsms messages send --to "$number" --body "Important update"
  sleep 1
done < phone_numbers.txt
```

## Contributing

Issues and pull requests are welcome at [github.com/ktmcp-cli/apideckcomsms](https://github.com/ktmcp-cli/apideckcomsms).

## License

MIT — see [LICENSE](LICENSE) for details.

---

Part of the [KTMCP CLI](https://killthemcp.com) project — replacing MCPs with simple, composable CLIs.
