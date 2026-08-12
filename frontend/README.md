# SE-TaskFlow Frontend

TaskFlow is a project management and task tracking application inspired by tools such as Jira and Trello.

This repository contains the frontend application built with Next.js. It provides the user interface for authentication, workspace management, project management, task tracking, comments, activities, and notifications.

The frontend communicates with the TaskFlow backend through a REST API.

---

## Features

### Authentication

- User registration
- User login
- Authentication state management
- Protected dashboard routes
- Logout
- Current user retrieval
- Access token based authentication

### Workspace Management

- View workspaces
- View workspace details
- Workspace members
- Workspace-based navigation
- Workspace member management

### Project Management

- View projects within a workspace
- Create projects
- Project detail pages
- Project-based task management

### Task Management

- Create tasks
- Update tasks
- Task status management
- Task priority management
- Task assignment
- Due dates
- Kanban-style task board
- Task detail modal
- Task filtering and organization

### Comments

- Add comments to tasks
- Display task comments
- Comment-related activity
- Comment-related notifications

### Activities

- Display project activity history
- Track task-related changes
- Track comment activity
- Display activity timeline

### Notifications

- Notification center
- Notification badge for unread notifications
- Notification popover
- Mark individual notifications as read
- Mark all notifications as read
- Notifications page
- Filter between all and unread notifications
- Notification type icons
- Relative notification timestamps

### UI / UX

- Responsive dashboard layout
- Dark / light theme
- Loading states
- Empty states
- Toast notifications
- Reusable UI components
- Accessible interactive components

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Next.js | React framework and application routing |
| React | UI library |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Reusable UI components |
| TanStack Query | Server state and API data management |
| React Hook Form | Form management |
| Zod | Form validation |
| Axios | HTTP client |
| Sonner | Toast notifications |
| Lucide React | Icons |

---

## Architecture

The frontend follows a feature-oriented architecture using the Next.js App Router.

```text
frontend/
│
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   │
│   ├── (dashboard)/
│   │   ├── workspaces/
│   │   │   ├── [slug]/
│   │   │   │   ├── members/
│   │   │   │   └── projects/
│   │   │   │       └── [projectId]/
│   │   │   └── page.tsx
│   │   │
│   │   └── notifications/
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── layout/
│   ├── shared/
│   └── ui/
│
├── features/
│   ├── activities/
│   ├── auth/
│   ├── comments/
│   ├── notifications/
│   ├── projects/
│   ├── tasks/
│   └── workspaces/
│   └── workspace-members/
│
├── lib/
│   ├── axios.ts
│   └── format.ts
│   └── query-client.ts
│   └── utils.ts
│
├── providers/
│   ├── auth-provider.tsx
│   ├── query-provider.tsx
│   └── theme-provider.tsx
│
├── types/
│
├── constants/
│
├── .env.local
├── package.json
└── tsconfig.json
```

### Feature Structure

Each feature is organized around its own API layer, hooks, types, and components where appropriate.

```text
features/
└── notifications/
    ├── api.ts
    ├── hooks.ts
    └── utils/
        └── notification-display.tsx
    └── components/
        └── notification-center.tsx
```

This structure keeps feature-specific logic separated and makes the application easier to maintain and extend.

---

## Routing

TaskFlow uses the Next.js App Router.

### Authentication

```text
/login
/register
```

### Workspaces

```text
/workspaces
/workspaces/[slug]
/workspaces/[slug]/members
```

### Projects

Projects are scoped to a workspace.

```text
/workspaces/[slug]/projects
/workspaces/[slug]/projects/[projectId]
```

### Notifications

```text
/notifications
```

---

## API Communication

The frontend communicates with the TaskFlow backend using Axios.

The API base URL is configured through an environment variable.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

The frontend API layer is responsible for communicating with backend endpoints, while TanStack Query manages server state, caching, loading states, and mutations.

```text
React Component
       │
       ▼
React Query Hook
       │
       ▼
Feature API
       │
       ▼
Axios
       │
       ▼
TaskFlow Backend
```

---

## Authentication Flow

The frontend uses access-token based authentication.

```text
Login / Register
       │
       ▼
Backend Authentication API
       │
       ▼
Access Token
       │
       ▼
AuthProvider
       │
       ├── Store session
       ├── Store current user
       └── Update authentication state
```

The authentication state is provided through `AuthProvider`.

Components can access the current authenticated user using:

```tsx
const { user, isAuthenticated, logout } = useAuth();
```

---

## Environment Variables

Create a `.env.local` file in the frontend root directory.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Environment files containing secrets or local configuration should not be committed to the repository.

---

## Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- TaskFlow Backend

The backend should be running before using features that require API access.

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Environment Configuration

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Available Scripts

### Development

```bash
npm run dev
```

Starts the Next.js development server.

### Production Build

```bash
npm run build
```

Creates an optimized production build and performs TypeScript validation.

### Production Server

```bash
npm run start
```

Starts the application using the production build.

### Lint

```bash
npm run lint
```

Runs ESLint checks.

---

## Production Build

Before deploying the frontend, verify that the production build succeeds:

```bash
npm run build
```

A successful build should complete TypeScript checking, page generation, and production optimization without errors.

---

## Backend Integration

The frontend is designed to work with the TaskFlow backend.

```text
TaskFlow Frontend
       │
       │ REST API
       ▼
TaskFlow Backend
       │
       ▼
PostgreSQL
```

The backend provides APIs for:

- Authentication
- Workspaces
- Workspace members
- Projects
- Tasks
- Comments
- Activities
- Notifications

---

## Project Structure Principles

The project follows several principles:

### Feature-oriented organization

Feature-specific code is grouped together rather than organizing the entire application only by file type.

### Reusable components

Common UI elements are placed in:

```text
components/ui
components/shared
components/layout
```

### Server state management

API data is managed using TanStack Query rather than duplicating server state inside React components.

### Type safety

TypeScript types are used throughout the application for:

- API responses
- Forms
- Components
- React Query hooks
- Authentication state
- Domain models

### Separation of concerns

The application separates:

```text
UI
↓
Hooks
↓
API
↓
Backend
```

This keeps components focused on presentation while API and server-state logic remain reusable.

---

## Current Application Routes

The current frontend application includes:

```text
/
├── /login
├── /register
├── /notifications
├── /workspaces
│   └── /[slug]
│       ├── /members
│       └── /projects
│           └── /[projectId]
└── /test-api
```

---

## Future Improvements

Potential future improvements include:

- Refresh token handling
- Advanced search
- Task filtering and sorting
- Calendar view
- Improved notification navigation
- Real-time notifications
- Pagination
- Optimistic UI updates
- Role-based UI permissions
- Performance optimization
- Production deployment

---

## Related Project

TaskFlow consists of a frontend and backend application.

```text
TaskFlow
│
├── frontend
│   └── Next.js
│
└── backend
    └── NestJS
```

The frontend communicates with the backend through REST APIs.

---

## License

This project is intended as a portfolio and learning project.