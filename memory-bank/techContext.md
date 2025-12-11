# Technical Context

## Core Technologies
*   **Language**: TypeScript (strict mode recommended).
*   **Framework**: Next.js 15 (App Router).
*   **Database**: PostgreSQL (Production) / SQLite (Local Dev).
*   **ORM**: Prisma 6.
*   **Authentication**: NextAuth.js v4.
*   **Styling**: Tailwind CSS 4 + Shadcn/ui.

## Dependencies
*   `@tanstack/react-query`: Data fetching and state synchronization.
*   `@tanstack/react-table`: Complex data tables.
*   `react-hook-form` + `zod`: Form handling and validation.
*   `zustand`: Client-side state management.
*   `recharts`: Data visualization (Charts).
*   `lucide-react`: Icons.

## Infrastructure
*   **Hosting**: Vercel (Recommended) or Containerized (Docker).
*   **CI/CD**: GitHub Actions (Suggested).
*   **Storage**: S3-compatible for file uploads (attachments/photos).

## Current Development Environment
*   **OS**: Windows 10.
*   **IDE**: VS Code.
*   **Database**: `db/custom.db` (SQLite).
*   **Critical Missing Config**: `prisma/schema.prisma`.

## Technical Constraints
*   **Offline Support**: Requires Service Worker implementation (PWA).
*   **Real-time**: Needs separate WebSocket server or integrated solution (e.g., Pusher, Socket.io within Next.js custom server).
*   **PDF Generation**: Needs a reliable library (e.g., `@react-pdf/renderer` or `puppeteer`) for consistent rendering across environments.
