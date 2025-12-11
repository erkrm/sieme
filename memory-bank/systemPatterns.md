# System Patterns

## Architecture
*   **Type**: Monolithic Next.js Application (App Router).
*   **Stack**: PERN (PostgreSQL, Express/Node - via Next.js API Routes, React/Next.js, Node.js).
*   **Deployment**: Vercel-compatible (Serverless Functions) or Dockerized.

## Core Components
1.  **Authentication**: NextAuth.js with Credentials Provider and custom Prisma adapter logic.
    *   Roles: `CLIENT`, `TECHNICIAN`, `MANAGER`, `ADMIN`.
    *   RBAC: Middleware protection + API route checks.
2.  **Database**: Prisma ORM with SQLite (Dev) / PostgreSQL (Prod).
    *   *Critical Issue*: Missing `schema.prisma` file.
3.  **API Layer**: Next.js Route Handlers (`src/app/api/...`).
    *   Pattern: `/api/[role]/[resource]` or `/api/[resource]`.
4.  **Frontend**:
    *   **UI Library**: Shadcn/ui (Radix Primitives + Tailwind CSS).
    *   **State Management**: Zustand (implied dependency).
    *   **Forms**: React Hook Form + Zod.

## Design Patterns
*   **Service-Repository**: (Partially implemented) Logic often resides directly in API routes. Recommended to move complex logic to `src/lib` or services.
*   **Optimistic UI**: Expected for Work Order status updates.
*   **Mobile-First**: Technician views must be responsive.

## Directory Structure
*   `src/app`: Routes and Pages.
*   `src/components`: Reusable UI components.
*   `src/lib`: Utilities, DB client, Auth config.
*   `src/hooks`: Custom React hooks.
*   `scripts`: Maintenance and setup scripts.
