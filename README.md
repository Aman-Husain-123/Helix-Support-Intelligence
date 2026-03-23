# Helix Support Intelligence

> **AI-powered team communication and customer support platform** — a modern, dark-mode React UI featuring a live chat workspace, ticket management panel, and an integrated AI assistant with RAG-based knowledge retrieval.

---

## ✨ Features

### 🗂️ Sidebar
- **Search bar** — filter conversations by name, message preview, or ticket ID
- **Inbox / Team / Channels** section tabs
- **Conversation list** with:
  - Priority indicators (🔴 high · 🟡 medium)
  - Channel icons (web, email, Slack)
  - Unread message badges
  - Resolved status checkmark overlay
- **Team presence panel** — online / busy / away status for each agent
- **Channels list** — custom support channels (general, billing, technical, etc.)
- **Agent profile footer** with availability status and settings shortcut

### 💬 Chat Workspace
- **Per-conversation message state** — switch conversations without losing context
- Styled message bubbles for **Customer**, **Agent**, and **AI** roles
- **AI shimmer label** on Helix AI messages
- **Typing indicator** animation — simulates live customer responses after agent sends a reply
- **Emoji reaction picker** — hover any message to react; reactions accumulate on the bubble
- **Delivery status ticks** — Sent → Delivered → Read on agent messages
- **Date divider** separating today's messages
- **Conversation metadata header** — ticket ID, status badge, priority badge, channel, message count

#### 📝 Message Composer
- **Reply / Note / Email** mode switcher (with distinct colors per mode)
- **Formatting toolbar** — Bold, Italic, Code, Link, Emoji, Attach file
- **Auto-growing textarea** — expands up to 5 lines, then scrolls
- **AI draft insertion button** — one click to populate the composer with the AI-generated reply
- **Character counter** and keyboard hint (`Enter` to send, `Shift+Enter` for new line)
- Gradient **Send** button (disabled state if empty)

### 🤖 AI Assistant Panel
- **Context-aware AI Draft Reply** — generated per conversation using RAG (GPT-4o model label)
- **Insert into reply** / **Copy** / **Regenerate** actions on the draft
- **6 Quick Prompt chips** — Summarize, Draft refund policy, Translate, Retention offer, Knowledge search, CRM note
- **Knowledge Source citations** — links to internal docs/runbooks used by the AI
- **Interactive AI chat** — ask Helix AI anything; shows typing dots while "thinking" then streams simulated response

### 🎟️ Ticket Panel
- **Collapsible ticket card** — ticket ID, status badge, title, all metadata fields (customer, email, channel, assignee, priority, SLA, created date)
- Color-coded **Priority** and **SLA** indicators
- **Editable tags** with "+ Add tag" action
- **Reassign** and **Resolve ✓ / Re-open** action buttons
- **Customer card** — avatar, email, plus at-a-glance stats (total tickets, CSAT score, customer since year)
- **Related tickets** list with status badges

### 📋 Timeline Panel
- Full **activity log** per conversation
- Vertical connector line with color-coded event nodes
- Event types: `system` ⚙️ · `ticket` 🎟️ · `ai` ✦ · `message` 💬 · `status` ⚡
- Actor initials shown on agent-authored events
- "All events are logged and auditable" footer

### 🔔 Top Bar
- **Helix logo** with animated glow ring
- **Active nav indicator** — gradient underline on current section
- **Live status pill** with pulsing green dot ("All systems operational")
- **Notification dropdown** — 3 live alerts (SLA breach, AI suggestion, escalation)
- **Search button** with `⌘K` keyboard shortcut hint
- **User avatar** (AR — Alex Rivera)

### ⚙️ Admin Dashboard & Analytics
- **Live Interactive Dashboard** — 4 core metric cards (Active, Open, AI Res Rate, Res Time) scaling dynamically with the system.
- **Extended Analytics Page** — 6 deep-state metric models, weekly/status chart placeholders, and time-range bounds filtering.
- **Smart Agent Management** — Live table with `available/busy/offline` agent filtering, plus an *Edit Agent Modal* for concurrent ticket limits and dynamic skill assignments.
- **AI Configuration Panel** — Modify token limits (256 - 8192), temperature scales (0.0 - 2.0), and active LLM models safely stored contextually.
- **Knowledge Base Settings** — Simulated real-time document upload pipeline linking file ingestion directly to `EURI`/`pgvector` RAG parsing states mapping `pending -> processing -> ready`.

### 👤 Customer View
- **Universal Ticket Gateway** — Customer-facing form dynamically injecting self-service reports directly into the `Agent Workspace`.
- **Live Ticket Sync** — Tickets update dynamically reflecting real agent message replies and resolution workflows directly inside the client portal.
- **Global TicketContext** — Seamless global state mapping unified round-robin auto-assignments, SLAs, and message arrays without backend latency.

---

## 🏗️ Target Architecture & Data Flow

Below is the highly scalable, event-driven architecture model designed for this Support Intelligence platform:

![Scalable AI Customer Support Architecture Diagram](./architecture-diagram.png)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| Build tool | [Vite 8](https://vitejs.dev/) |
| Styling | [Tailwind CSS v3](https://tailwindcss.com/) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (Google Fonts) |
| CSS design | Custom dark design system · Glassmorphism · Micro-animations |
| State | Local React `useState` (no external state library needed) |
| Linting | ESLint + TypeScript-ESLint |

---

## 📁 Project Structure

```
src/
├── App.tsx                        # Root — wires Application routers and Context Providers
├── App.css                        # Minimal overrides  
├── index.css                      # Design system: fonts, scrollbar, glass utility, animations
│
├── context/
│   ├── AuthContext.tsx            # Global Tenant Authentication variables
│   └── TicketContext.tsx          # Real-time state hub driving round-robin auto-assignments
│
├── hooks/
│   └── useChatWithRAG.ts          # EURI API vector embeddings integration for LLM retrieval
│
├── pages/
│   ├── AdminView.tsx              # Comprehensive Analytics, KB ingestion, and AI Control Panel
│   └── CustomerView.tsx           # Customer portal enabling Helpdesk searches & dynamic Ticket creation
│
└── components/
    ├── layout/
    │   ├── ShellLayout.tsx        # Top bar + three-column shell
    │   └── Sidebar.tsx            # Sidebar with search, conversations, team, channels
    │
    ├── chat/
    │   ├── ChatWorkspace.tsx      # Chat area + message state + typing simulation
    │   ├── MessageBubble.tsx      # Individual message bubble with reactions + status
    │   └── MessageComposer.tsx    # Composer with mode tabs, toolbar, auto-grow textarea
    │
    └── right-panel/
        ├── RightPanel.tsx         # Tab container (AI Assistant / Ticket / Timeline)
        ├── AssistantTab.tsx       # AI draft, quick prompts, citations, AI chat
        ├── TicketTab.tsx          # Ticket card, customer card, related tickets
        └── TimelineTab.tsx        # Activity log with vertical timeline connector
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Aman-Husain-123/Helix-Support-Intelligence.git
cd Helix-Support-Intelligence

# Install dependencies
npm install
```

### Run in development mode

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

---

## 🎨 Design System

The UI uses a custom dark design system defined in `tailwind.config.js` and `src/index.css`:

| Token | Value | Usage |
|---|---|---|
| `background` | `#060a18` | Page background |
| `sidebar` | `#08101f` | Sidebar + top bar |
| `surface` | `#0c1628` | Cards, panels |
| `border` | `#1a2640` | All borders |
| `accent` | `#6366f1` | Primary actions, highlights |
| `accentSoft` | `#4f46e5` | Hover state |

**Custom animations** (defined in Tailwind config):
- `animate-fade-in` — opacity 0→1 over 200ms
- `animate-slide-up` — slides up 8px + fade in
- `animate-glow` — alternates box-shadow glow on the logo
- `animate-typing` — bouncing dots for typing indicators
- `shimmer` — gradient shift for the AI name label

---

## 📸 UI Overview

| Section | Description |
|---|---|
| Left sidebar | Conversation switcher with search, inbox filters, team presence |
| Center workspace | Live chat with AI-assisted replies and real-time simulation |
| Right panel | Contextual AI assistant, structured ticket details, and event timeline |

---

## 📄 License

This project is for internship / portfolio use. All rights reserved © 2026 Aman Husain.
