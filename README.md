# Task Manager - Clear-Style Todo App

A minimalist Clear-style todo app synced with Monday.com, built with Next.js 16 and deployed on Vercel.

## Features

- 📋 **Clear-style UI** - Beautiful gradient design inspired by Clear app
- 🔄 **Monday.com Sync** - Uses Monday.com as the backend (no database needed)
- 👆 **Swipe Gestures** - Swipe right to complete, swipe left to cancel
- ⬇️ **Pull to Create** - Pull down to create new tasks
- 🔐 **Google OAuth** - Restricted access to a single email
- 🤖 **Bot API** - API key access for external integrations
- 📱 **Mobile-First** - Optimized for iPhone Safari

## Environment Variables

Set these in Vercel (or `.env.local` for local development):

### Required

```bash
# Monday.com API
MONDAY_API_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjMzMjUzMzQ3NywiYWFpIjoxMSwidWlkIjoxMTY2NDUyNiwiaWFkIjoiMjAyNC0wMy0xM1QxNzozNToyNi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6NTI1NjEwOCwicmduIjoidXNlMSJ9.5j1ih-MffMLegGeNcXLgopgJ_eIYg0sZb8IGqG-gEuM
MONDAY_BOARD_ID=7327642652

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=https://task-manager-khaki-kappa.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here

# Auth restriction (only this email can access)
ALLOWED_EMAIL=pavel@landstargpk.com
```

### Optional

```bash
# Bot API access (for external integrations like OpenClaw)
API_SECRET_KEY=your_secret_key_for_bot_access
```

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations and gestures
- **NextAuth v5** - Google OAuth authentication
- **Monday.com GraphQL API** - Backend data storage

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (proxy to Monday.com)
│   │   ├── auth/         # NextAuth routes
│   │   ├── groups/       # List groups
│   │   └── tasks/        # CRUD operations on tasks
│   ├── group/[id]/       # Group view (tasks list)
│   ├── task/[id]/        # Task detail view
│   ├── login/            # Login page
│   └── page.tsx          # Home (groups list)
├── components/           # React components
│   ├── GroupRow.tsx      # Group list item
│   ├── TaskRow.tsx       # Task list item (with swipe)
│   └── PullToCreate.tsx  # Pull-to-refresh component
└── lib/
    ├── auth.ts           # NextAuth configuration
    ├── monday.ts         # Monday.com API client
    └── types.ts          # TypeScript types
```

## Monday.com Board Structure

**Board:** Personal /w Team (ID: 7327642652)

**Groups shown in UI:**
- `topics` → 📋 Pavlo (active tasks)
- `group_mm0m8a0` → 🔥 Urgent

**Actions:**
- Swipe right → Move to `new_group_mkmkw2gr` (✅ Done Pavlo)
- Swipe left → Move to `group_mm0m3wrz` (❌ Canceled)

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local with environment variables (see above)
cp .env.example .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

## Building

```bash
npm run build
```

## Deployment

This app is deployed on Vercel at:
**https://task-manager-khaki-kappa.vercel.app**

To deploy updates:
```bash
git push origin main
# Vercel auto-deploys from main branch
```

Or use Vercel CLI:
```bash
vercel --prod
```

## API Endpoints

All endpoints require authentication (Google OAuth session or `X-API-Key` header).

### Groups

- `GET /api/groups` - List all groups with task counts

### Tasks

- `GET /api/tasks?group=<id>` - List tasks in a group
- `POST /api/tasks` - Create a new task
  - Body: `{ name, groupId, priority?, project?, deadline? }`
- `GET /api/tasks/[id]` - Get task details
- `PATCH /api/tasks/[id]` - Update task
  - Body: `{ name?, priority?, project?, deadline?, status?, description?, moveToGroup? }`
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/done` - Mark task as done (move to Done group)
- `POST /api/tasks/[id]/cancel` - Cancel task (move to Canceled group)

## Bot Access Example

```bash
curl -H "X-API-Key: your_secret_key" \
  https://task-manager-khaki-kappa.vercel.app/api/groups
```

## License

Private use only.
