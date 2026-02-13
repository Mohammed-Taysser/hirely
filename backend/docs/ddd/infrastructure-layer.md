# Infrastructure Layer

## Purpose

Provide technical implementations for application interfaces: persistence, messaging, external APIs, storage, system access.

## What Belongs Here

- Prisma repositories and query repositories
- Queue implementations (BullMQ)
- External services (email, storage, system health)
- Low-level adapters (PDF rendering, Redis, S3, etc.)

## Where To Find It

- `backend/src/modules/*/infrastructure/*`
- `backend/src/apps/*` (composition/config)

## Dependencies

- Allowed: application interfaces, external libraries, config
- Not allowed: importing presentation/controller code

## Examples

- `backend/src/modules/user/infrastructure/persistence/prisma-user.repository.ts`
- `backend/src/modules/resume/infrastructure/services/gotenberg-pdf-renderer.service.ts`
- `backend/src/modules/resume/infrastructure/services/local-export-storage.service.ts`
- `backend/src/modules/resume/infrastructure/services/resume-template-renderer.service.ts`
- `backend/src/modules/billing/infrastructure/services/billing.service.ts`
- `backend/src/modules/activity/infrastructure/services/activity.service.ts`
- `backend/src/modules/resume/infrastructure/services/bullmq-export-email-queue.service.ts`

## Guardrails

- Keep implementation details here (Prisma, Redis, BullMQ)
- Avoid leaking infrastructure types into application DTOs

## Before/After Example

Before (anti-pattern: middleware hits Prisma directly)

```ts
// authenticate.middleware.ts
const user = await prisma.user.findUnique({ where: { id } });
```

After (current: middleware uses a repository)

```ts
// authenticate.middleware.ts
const user = await userRepository.findById(id);
```
