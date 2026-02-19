# Apideck SMS CLI - AI Agent Usage Guide

This CLI is designed to be used by AI agents for sending and managing SMS messages.

## Authentication

Before using any commands, configure your credentials:

```bash
apideckcomsms config set --api-key YOUR_API_KEY --app-id YOUR_APP_ID
```

## Common Tasks

### 1. Send SMS Message

```bash
apideckcomsms messages send --to "+1234567890" --body "MESSAGE_TEXT" --json
apideckcomsms messages send --from "+SOURCE" --to "+DEST" --body "TEXT" --json
```

### 2. List Messages

```bash
apideckcomsms messages list --json
```

### 3. Get Message Status

```bash
apideckcomsms messages get MESSAGE_ID --json
```

### 4. Delete Message

```bash
apideckcomsms messages delete MESSAGE_ID
```

## JSON Output

All commands support `--json` flag for structured output suitable for parsing.

## Error Handling

- Exit code 0 = success
- Exit code 1 = error (check stderr for message)

## Use Cases

- **Notifications**: Send order confirmations, shipping updates, alerts
- **2FA/OTP**: Send verification codes for authentication
- **Reminders**: Send appointment or payment reminders
- **Marketing**: Send promotional messages (with opt-in consent)
- **Alerts**: Send system alerts or critical notifications
