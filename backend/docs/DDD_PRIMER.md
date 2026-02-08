# DDD Primer (Hirely)

## Purpose
This document explains Domain-Driven Design (DDD) with concrete examples from this codebase. It is written for developers who want to understand the structure and why it is useful.

## What DDD Is
DDD is a design approach where the business domain is the core of the system. Code is organized so that domain rules live in the domain layer, while application workflows, infrastructure, and HTTP concerns stay separate.

## Why We Use DDD Here
- Business rules stay centralized and consistent.
- Use cases are easy to test and evolve.
- Infrastructure can change without rewriting the domain.
- Controllers stay thin and focused on HTTP.

## Layers and Responsibilities

### Domain Layer
- Owns business rules and invariants.
- Contains aggregates, value objects, and domain events.
- Does not depend on HTTP, Prisma, or queues.

Example
```ts
// backend/src/modules/user/domain/user.aggregate.ts
public updateEmail(email: UserEmail): void {
  this.props.email = email;
  this.props.updatedAt = new Date();
}
```

### Application Layer
- Orchestrates use cases and workflows.
- Depends on domain types and interfaces.
- Does not import Prisma or Express.

Example
```ts
// backend/src/modules/resume/application/use-cases/create-resume/create-resume.use-case.ts
const planLimit = await planLimitQueryRepository.findByPlanId(request.planId);
if (currentCount >= planLimit.maxResumes) return Result.fail(new ForbiddenError(...));
const resume = Resume.create(...);
await resumeRepository.save(resume);
```

### Infrastructure Layer
- Implements interfaces using Prisma, queues, storage, email.
- Encapsulates external systems and I/O.

Example
```ts
// backend/src/modules/user/infrastructure/persistence/prisma-user.repository.ts
await prisma.user.upsert({ ... });
```

### Presentation Layer
- HTTP controllers, routes, middleware.
- Converts requests into use case inputs.
- Maps use case results to responses.

Example
```ts
// backend/src/modules/auth/auth.controller.ts
const result = await registerUserUseCase.execute(input);
return responseService.success(res, { data: result.getValue() });
```

## End-to-End Example: Resume Update

### Goal
Update resume content, persist changes, create a snapshot, and return an updated DTO.

### Flow
1. Controller receives HTTP request.
2. `UpdateResumeUseCase` loads the aggregate and applies changes.
3. Repository saves the aggregate.
4. Snapshot repository creates a snapshot for export history.
5. Query repository returns the updated DTO.

Relevant files
- `backend/src/modules/resume/resume.controller.ts`
- `backend/src/modules/resume/application/use-cases/update-resume/update-resume.use-case.ts`
- `backend/src/modules/resume/infrastructure/persistence/prisma-resume.repository.ts`
- `backend/src/modules/resume/infrastructure/persistence/prisma-resume-snapshot.repository.ts`
- `backend/src/modules/resume/infrastructure/persistence/prisma-resume.query.repository.ts`

## End-to-End Example: Async Export

### Goal
Create an export record, enqueue PDF generation, deliver email on free tier.

### Flow
1. Controller calls `EnqueueResumeExportUseCase`.
2. Use case enforces rate limits and plan limits.
3. Snapshot and export record are created.
4. Export queue is enqueued.
5. PDF worker generates and stores PDF.
6. Free tier triggers email queue.
7. Email worker sends message.

Relevant files
- `backend/src/modules/resume/application/use-cases/enqueue-resume-export/enqueue-resume-export.use-case.ts`
- `backend/src/modules/export/infrastructure/services/export.service.ts`
- `backend/src/jobs/workers/pdf.worker.ts`
- `backend/src/jobs/workers/email.worker.ts`

## Common DDD Smells (What To Avoid)
- Controllers calling Prisma directly.
- Use cases importing infrastructure implementations.
- Domain entities depending on HTTP or DB libraries.
- Application logic scattered across middleware and services.

## Practical Checklist
- Domain code contains no Prisma or HTTP imports.
- Application use cases only depend on interfaces.
- Infrastructure implements interfaces only.
- Controllers map HTTP to use cases.

## Where To Look Next
- `backend/docs/ddd/domain-layer.md`
- `backend/docs/ddd/application-layer.md`
- `backend/docs/ddd/infrastructure-layer.md`
- `backend/docs/ddd/presentation-layer.md`
