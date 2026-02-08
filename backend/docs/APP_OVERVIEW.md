# Hirely Application Overview

## Purpose
Hirely provides a resume-building API with plan-based limits and export capabilities. Users can create and edit resumes, generate PDF exports, and send exports via email. Background workers handle heavy tasks like PDF rendering and email delivery.

## High-Level Components
- API server built with Express
- Prisma-based persistence for Users, Resumes, Exports, and Plans
- Redis-backed queues for PDF generation and email delivery
- Gotenberg for HTML-to-PDF rendering
- Local storage adapter (with optional S3 adapter)

## Architecture Summary
- Domain layer models business rules and invariants.
- Application layer coordinates use cases and defines interfaces.
- Infrastructure layer implements repositories, queues, storage, and external services.
- Presentation layer exposes HTTP controllers, routes, and middleware.

See layer docs:
- `backend/docs/ddd/domain-layer.md`
- `backend/docs/ddd/application-layer.md`
- `backend/docs/ddd/infrastructure-layer.md`
- `backend/docs/ddd/presentation-layer.md`

## Core Flows

### Registration
1. `RegisterUserUseCase` delegates to `CreateUserWithPlanUseCase`.
2. Plan is resolved by code, user is created via aggregate and repository.
3. Access and refresh tokens are issued and returned.

### Login
1. `LoginUseCase` validates credentials via password hasher.
2. Tokens are issued and the full user DTO is hydrated by the query repository.

### Resume Create
1. `CreateResumeUseCase` validates name and checks plan limits.
2. Aggregate is created and persisted.
3. Query repository returns a full resume DTO for the response.

### Resume Update
1. `UpdateResumeUseCase` loads the aggregate and applies changes.
2. Save persists the new state.
3. A snapshot is created for export history.
4. Query repository returns the updated DTO.

### Resume Delete
1. `DeleteResumeUseCase` fetches the existing DTO.
2. The aggregate is deleted.
3. The previously fetched DTO is returned.

### Export (Direct)
1. `ExportResumeUseCase` renders HTML and converts to PDF.
2. PDF buffer is returned directly for download.

### Export (Async)
1. `EnqueueResumeExportUseCase` enforces rate and plan limits.
2. Snapshot and export record are created.
3. PDF job is enqueued.
4. PDF worker renders and stores the PDF.
5. Free-tier exports trigger an email job.
6. Email worker sends the message using the export record.

## Workers and Queues
- PDF worker: `backend/src/jobs/workers/pdf.worker.ts`
- Email worker: `backend/src/jobs/workers/email.worker.ts`
- Export queue interface: `backend/src/modules/export/application/services/export-queue.service.interface.ts`
- Email queue interface: `backend/src/modules/export/application/services/export-email-queue.service.interface.ts`

## Key Modules
- Auth: JWT issuance and session flows
- User: identity and profile management
- Resume: aggregate, snapshots, and exports
- Export: export records, status, and PDF processing
- Plan: plan limits and management
- Apply: bulk apply workflow
- ResumeTemplate: template listing
- System: health checks

## Data Model (High-Level)
- User: identity, plan, verification state
- Plan and PlanLimit: capabilities and thresholds
- Resume: structured data + template metadata
- ResumeSnapshot: point-in-time resume data for exports
- ResumeExport: export status, storage key, and expiry

## Configuration
Required env vars are validated in `backend/src/apps/config.ts`. The most important are:
- Database and Redis configuration
- JWT secrets and expiry durations
- Gotenberg URL
- Maximum allowed resume sections

## Local Development
1. Install dependencies in `backend/`.
2. Ensure `.env` is present with the required keys.
3. Generate Prisma client and apply migrations.
4. Run `npm run dev` for the API and `npm run worker:dev` for workers.

## Docker
`docker-compose.yml` provisions Postgres, Redis, Gotenberg, and a package build container for local development.
