# Hirely

## Overview

Hirely is a resume builder and export service with plan-based limits and background processing. It provides a REST API for managing users, resumes, templates, and exports, and relies on workers for PDF generation and email delivery.

## Core Capabilities

- User registration, login, refresh tokens, and user switching
- Resume CRUD with templates, themes, and structured content
- Snapshotting on updates to preserve export history
- PDF exports via Gotenberg
- Export delivery: direct download for paid tiers and email delivery for free tier
- Bulk apply flow with queue-backed email delivery
- Plan and limit management

## Architecture

- Domain layer: aggregates, value objects, and domain events
- Application layer: use cases, DTOs, and service interfaces
- Infrastructure layer: Prisma, queues, storage adapters, system integrations
- Presentation layer: controllers, routes, and middleware

Docs:

- `backend/docs/APP_OVERVIEW.md`
- `backend/docs/PLAN_CHANGES.md`
- `backend/docs/ddd/domain-layer.md`
- `backend/docs/ddd/application-layer.md`
- `backend/docs/ddd/infrastructure-layer.md`
- `backend/docs/ddd/presentation-layer.md`

## How It Works

Auth

1. Register -> creates user with default plan, returns access and refresh tokens.
2. Login -> validates credentials, returns tokens and hydrated user payload.

Resume Create and Update

1. Create -> enforces plan limits, saves aggregate, returns query DTO.
2. Update -> loads aggregate, applies changes, saves, creates snapshot, returns query DTO.
3. Delete -> returns existing DTO, then deletes aggregate.

Export

1. Direct download -> generates PDF buffer immediately.
2. Async export -> creates export record, enqueues PDF job, worker stores PDF and queues email for free tier.

Workers

- `backend/src/jobs/workers/pdf.worker.ts` handles PDF generation and storage.
- `backend/src/jobs/workers/email.worker.ts` handles sending export emails.

## Data Model (High-Level)

- User, Plan, PlanLimit
- Resume, ResumeSnapshot, ResumeExport

## Local Development

1. `cd backend`
2. `npm install`
3. Create `.env` with required variables
4. `npm run prisma:generate`
5. `npm run prisma:migrate`
6. `npm run dev`
7. In a second terminal, `npm run worker:dev`

## Required Environment Variables

- `NODE_ENV`
- `PORT`
- `ALLOWED_ORIGINS`
- `DATABASE_URL`
- `SEED_USER_PASSWORD`
- `JWT_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `REDIS_HOST`
- `REDIS_PORT`
- `GOTENBERG_URL`
- `MAX_RESUME_SECTIONS`
- `PLAN_CHANGE_INTERVAL_SECONDS`

Optional:

- `UPLOADS_DIR` for local storage
- `MAIL_FROM` for outbound emails
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` if you swap nodemailer test account

## Docker

- `docker-compose up` starts backend, Postgres, Redis, Gotenberg, and package build container.
- Backend listens on port `8080` by default when using the compose file.
