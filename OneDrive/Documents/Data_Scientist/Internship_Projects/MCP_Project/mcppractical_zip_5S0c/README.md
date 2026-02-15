# Google Services MCP Server

MCP (Model Context Protocol) server for Claude Desktop that provides access to Google Sheets, Gmail, Google Calendar, and Neon Postgres.

## Features

- **MCP Tools**:
  - **Google Sheets (4 tools)**: Read, write, append, and get sheet info
  - **Gmail (4 tools)**: List, search, get details, and send emails
  - **Google Calendar (5 tools)**: List, create, update, delete, and get event details
  - **Postgres / Neon DB**: Run queries and insert data into tables

## Prerequisites

- Python 3.8 or higher
- Google Cloud Project with APIs enabled:
  - Google Sheets API
  - Gmail API
  - Google Calendar API
- OAuth 2.0 credentials (`credentials.json`)
- Claude Desktop installed
- (Optional) Neon Postgres database URL

## Installation

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd mcplatestv1

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Google OAuth

1. Download `credentials.json` from [Google Cloud Console](https://console.cloud.google.com/)
2. Place `credentials.json` in the project root directory
3. Run the setup script to authenticate:

```bash
python src/setup.py
```

4. Follow the prompts to authorize access to your Google account
5. The script will create `tokens.json` with your access tokens

### 3. Configure Your Services

Edit `config.json`:

```json
{
  "google": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "redirectUri": "http://localhost",
    "spreadsheetId": "your-spreadsheet-id",
    "calendarId": "primary"
  },
  "database": {
    "url": "postgresql://<USER>:<PASSWORD>@<HOST>/<DBNAME>?sslmode=require"
  },
  "mongodb": {
    "uri": "your-mongodb-uri"
  }
}
```

> Do not commit real credentials to git or share them publicly.

## Claude Desktop Setup

### Step 1: Find Claude Desktop Config File

**Windows:**
```text
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```text
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Edit Config File

```json
{
  "mcpServers": {
    "google-services": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\mcp_server.py"
      ],
      "env": {}
    },
    "postgresql-db": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\postgres_mcp.py"
      ],
      "env": {}
    },
    "mongodb": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\mongodb_mcp.py"
      ],
      "env": {}
    }
  }
}
```

- Update paths for your system.
- Use `\\` on Windows, `/` on Mac/Linux.

### Step 3: Restart Claude Desktop

Quit Claude Desktop completely and start it again.

### Step 4: Verify Connection

Ask in Claude:

> What tools do you have access to?

You should see Google Sheets, Gmail, Calendar, and Postgres tools.

## Usage

Once connected, you can ask Claude to:

- **Sheets** – `Read the data from Sheet1!A1:B10`
- **Sheets** – `Write these values to my spreadsheet: [['Name','Age'],['John','30']]`
- **Gmail** – `Show me my last 10 emails`
- **Gmail** – `Send an email to john@example.com with subject 'Hello' and body 'Test message'`
- **Calendar** – `Create a calendar event for tomorrow at 2pm titled 'Meeting'`
- **Neon DB** – `Insert 5 demo students into the "shivam" table in my Neon database`

## Example Google Sheet

When prompted:

> Make a sheet where column is Name and Age and add some dummy data

the Sheets tools create a sheet like:

| Name | Age |
|------|-----|
| John | 25  |
| Sarah | 30 |
| Mike | 28  |
| Emily | 22 |
| David | 35 |

Screenshot:

![Sample Google Sheet with Name and Age columns](docs/images/sample_sheet.png)

Configure the sheet ID in `config.json`:

```json
{
  "google": {
    "spreadsheetId": "<YOUR_SPREADSHEET_ID>"
  }
}
```

## Example Gmail Usage

Prompt in Claude:

> Hey send a email to salmaniaman957@gmail.com to Hello

Claude confirmed subject/body and sent:

- Subject: `Hello Message`
- Body: `Hello`

Screenshot:

![Sample Gmail email sent via MCP server](docs/images/sample_gmail_email.png)

## Example Google Calendar Usage

Prompt in Claude:

> Schedule a task for tomorrow at 9 AM for 3 hours as "NLP Beginning"

Claude created an event:

- Title: `NLP Beginning`
- Time: 9:00 AM – 12:00 PM

Screenshots:

![Claude scheduling NLP Beginning calendar event](docs/images/sample_calendar_claude.png)

![Google Calendar showing NLP Beginning event](docs/images/sample_calendar_view.png)

## Example Neon Postgres (neondb) Usage

A Neon database is configured via `database.url`.  
In the `public.shivam` table, sample rows were inserted through the Postgres MCP server:

| id | name         | email | created_at           |
|----|--------------|-------|----------------------|
| 1  | Aditya Sahu  | NULL  | 2026‑02‑15 11:25:26… |
| 2  | Kavya Iyer   | NULL  | 2026‑02‑15 11:25:26… |
| 3  | Rohan Joshi  | NULL  | 2026‑02‑15 11:25:26… |
| 4  | Ananya Reddy | NULL  | 2026‑02‑15 11:25:26… |
| 5  | Karan Nair   | NULL  | 2026‑02‑15 11:25:26… |

Screenshot:

![Neon Postgres table with sample data](docs/images/sample_neondb_table.png)

Example prompt:

> Insert 5 demo students into the "shivam" table with just a name field.

## Available Tools

### Google Sheets
- `read_sheet`
- `write_sheet`
- `append_sheet`
- `get_sheet_info`

### Gmail
- `list_emails`
- `get_email_detail`
- `send_email`
- `search_emails`

### Google Calendar
- `list_calendar_events`
- `create_calendar_event`
- `update_calendar_event`
- `delete_calendar_event`
- `get_calendar_event`

### Postgres / Neon DB
- `run_query` / other SQL tools (as defined in `postgres_mcp.py`)

## Troubleshooting

### Server Won't Start

1. Check Python: `python --version`
2. Check script paths in `claude_desktop_config.json`
3. Install deps:

```bash
pip install -r requirements.txt
```

### Tools Not Appearing

- Check Claude Desktop Developer → Local MCP servers logs  
- Ensure `tokens.json` exists  
- Restart Claude Desktop

### Authentication Errors

- Re‑run `python src/setup.py`
- Verify `credentials.json`
- Ensure APIs are enabled in Google Cloud Console

## Project Structure

```text
mcplatestv1/
├── src/
│   ├── mcp_server.py          # Google services MCP server
│   ├── postgres_mcp.py        # Postgres / Neon DB MCP server
│   ├── mongodb_mcp.py         # MongoDB MCP server
│   ├── google_auth.py         # Google OAuth handling
│   ├── google_sheets.py       # Google Sheets functions
│   ├── google_gmail.py        # Gmail functions
│   ├── google_calendar.py     # Calendar functions
│   ├── agent.py               # Automatic decision logic
│   └── setup.py               # Initial setup script
├── config.json                # Local config (NOT for git)
├── config.example.json        # Safe template config
├── credentials.json           # Google OAuth credentials
├── tokens.json                # OAuth tokens
├── requirements.txt           # Dependencies
├── claude_desktop_config.json # Example Claude config
└── README.md                  # This file
```

## License

This project is for personal use. Keep all credentials and config files private.<!-- filepath: c:\Users\user\OneDrive\Documents\Data_Scientist\Internship_Projects\MCP_Project\mcppractical_zip_5S0c\README.md -->
# Google Services MCP Server

MCP (Model Context Protocol) server for Claude Desktop that provides access to Google Sheets, Gmail, Google Calendar, and Neon Postgres.

## Features

- **MCP Tools**:
  - **Google Sheets (4 tools)**: Read, write, append, and get sheet info
  - **Gmail (4 tools)**: List, search, get details, and send emails
  - **Google Calendar (5 tools)**: List, create, update, delete, and get event details
  - **Postgres / Neon DB**: Run queries and insert data into tables

## Prerequisites

- Python 3.8 or higher
- Google Cloud Project with APIs enabled:
  - Google Sheets API
  - Gmail API
  - Google Calendar API
- OAuth 2.0 credentials (`credentials.json`)
- Claude Desktop installed
- (Optional) Neon Postgres database URL

## Installation

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd mcplatestv1

# Install dependencies
pip install -r requirements.txt
```

### 2. Setup Google OAuth

1. Download `credentials.json` from [Google Cloud Console](https://console.cloud.google.com/)
2. Place `credentials.json` in the project root directory
3. Run the setup script to authenticate:

```bash
python src/setup.py
```

4. Follow the prompts to authorize access to your Google account
5. The script will create `tokens.json` with your access tokens

### 3. Configure Your Services

Edit `config.json`:

```json
{
  "google": {
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "redirectUri": "http://localhost",
    "spreadsheetId": "your-spreadsheet-id",
    "calendarId": "primary"
  },
  "database": {
    "url": "postgresql://<USER>:<PASSWORD>@<HOST>/<DBNAME>?sslmode=require"
  },
  "mongodb": {
    "uri": "your-mongodb-uri"
  }
}
```

> Do not commit real credentials to git or share them publicly.

## Claude Desktop Setup

### Step 1: Find Claude Desktop Config File

**Windows:**
```text
%APPDATA%\Claude\claude_desktop_config.json
```

**Mac:**
```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```text
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Edit Config File

```json
{
  "mcpServers": {
    "google-services": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\mcp_server.py"
      ],
      "env": {}
    },
    "postgresql-db": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\postgres_mcp.py"
      ],
      "env": {}
    },
    "mongodb": {
      "command": "python",
      "args": [
        "D:\\mcplatestv1\\src\\mongodb_mcp.py"
      ],
      "env": {}
    }
  }
}
```

- Update paths for your system.
- Use `\\` on Windows, `/` on Mac/Linux.

### Step 3: Restart Claude Desktop

Quit Claude Desktop completely and start it again.

### Step 4: Verify Connection

Ask in Claude:

> What tools do you have access to?

You should see Google Sheets, Gmail, Calendar, and Postgres tools.

## Usage

Once connected, you can ask Claude to:

- **Sheets** – `Read the data from Sheet1!A1:B10`
- **Sheets** – `Write these values to my spreadsheet: [['Name','Age'],['John','30']]`
- **Gmail** – `Show me my last 10 emails`
- **Gmail** – `Send an email to john@example.com with subject 'Hello' and body 'Test message'`
- **Calendar** – `Create a calendar event for tomorrow at 2pm titled 'Meeting'`
- **Neon DB** – `Insert 5 demo students into the "shivam" table in my Neon database`

## Example Google Sheet

When prompted:

> Make a sheet where column is Name and Age and add some dummy data

the Sheets tools create a sheet like:

| Name | Age |
|------|-----|
| John | 25  |
| Sarah | 30 |
| Mike | 28  |
| Emily | 22 |
| David | 35 |

Screenshot:

![Sample Google Sheet with Name and Age columns](docs/images/sample_sheet.png)

Configure the sheet ID in `config.json`:

```json
{
  "google": {
    "spreadsheetId": "<YOUR_SPREADSHEET_ID>"
  }
}
```

## Example Gmail Usage

Prompt in Claude:

> Hey send a email to salmaniaman957@gmail.com to Hello

Claude confirmed subject/body and sent:

- Subject: `Hello Message`
- Body: `Hello`

Screenshot:

![Sample Gmail email sent via MCP server](docs/images/sample_gmail_email.png)

## Example Google Calendar Usage

Prompt in Claude:

> Schedule a task for tomorrow at 9 AM for 3 hours as "NLP Beginning"

Claude created an event:

- Title: `NLP Beginning`
- Time: 9:00 AM – 12:00 PM

Screenshots:

![Claude scheduling NLP Beginning calendar event](docs/images/sample_calendar_claude.png)

![Google Calendar showing NLP Beginning event](docs/images/sample_calendar_view.png)

## Example Neon Postgres (neondb) Usage

A Neon database is configured via `database.url`.  
In the `public.shivam` table, sample rows were inserted through the Postgres MCP server:

| id | name         | email | created_at           |
|----|--------------|-------|----------------------|
| 1  | Aditya Sahu  | NULL  | 2026‑02‑15 11:25:26… |
| 2  | Kavya Iyer   | NULL  | 2026‑02‑15 11:25:26… |
| 3  | Rohan Joshi  | NULL  | 2026‑02‑15 11:25:26… |
| 4  | Ananya Reddy | NULL  | 2026‑02‑15 11:25:26… |
| 5  | Karan Nair   | NULL  | 2026‑02‑15 11:25:26… |

Screenshot:

![Neon Postgres table with sample data](docs/images/sample_neondb_table.png)

Example prompt:

> Insert 5 demo students into the "shivam" table with just a name field.

## Available Tools

### Google Sheets
- `read_sheet`
- `write_sheet`
- `append_sheet`
- `get_sheet_info`

### Gmail
- `list_emails`
- `get_email_detail`
- `send_email`
- `search_emails`

### Google Calendar
- `list_calendar_events`
- `create_calendar_event`
- `update_calendar_event`
- `delete_calendar_event`
- `get_calendar_event`

### Postgres / Neon DB
- `run_query` / other SQL tools (as defined in `postgres_mcp.py`)

## Troubleshooting

### Server Won't Start

1. Check Python: `python --version`
2. Check script paths in `claude_desktop_config.json`
3. Install deps:

```bash
pip install -r requirements.txt
```

### Tools Not Appearing

- Check Claude Desktop Developer → Local MCP servers logs  
- Ensure `tokens.json` exists  
- Restart Claude Desktop

### Authentication Errors

- Re‑run `python src/setup.py`
- Verify `credentials.json`
- Ensure APIs are enabled in Google Cloud Console

## Project Structure

```text
mcplatestv1/
├── src/
│   ├── mcp_server.py          # Google services MCP server
│   ├── postgres_mcp.py        # Postgres / Neon DB MCP server
│   ├── mongodb_mcp.py         # MongoDB MCP server
│   ├── google_auth.py         # Google OAuth handling
│   ├── google_sheets.py       # Google Sheets functions
│   ├── google_gmail.py        # Gmail functions
│   ├── google_calendar.py     # Calendar functions
│   ├── agent.py               # Automatic decision logic
│   └── setup.py               # Initial setup script
├── config.json                # Local config (NOT for git)
├── config.example.json        # Safe template config
├── credentials.json           # Google OAuth credentials
├── tokens.json                # OAuth tokens
├── requirements.txt           # Dependencies
├── claude_desktop_config.json # Example Claude config
└── README.md                  # This file
```

## License

This project is for personal use. Keep all credentials and config files private.