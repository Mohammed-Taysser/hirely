# Application Layer

## Purpose

Coordinate use cases and enforce application workflows. This layer orchestrates domain behavior and delegates technical concerns to interfaces.

## What Belongs Here

- Use cases (`UseCase` implementations)
- Application DTOs (input/output)
- Application service interfaces (repositories, queues, mail, storage, etc.)
- Query use cases / query repositories

## Where To Find It

- `backend/src/modules/*/application/*`
- `backend/src/modules/shared/application/*`

## Dependencies

- Allowed: domain layer, application interfaces, shared domain utilities
- Not allowed: infrastructure implementations (Prisma, Redis, BullMQ, etc.)

## Examples

- `backend/src/modules/resume/application/use-cases/create-resume/*`
- `backend/src/modules/auth/application/use-cases/login/*`
- `backend/src/modules/resume/application/services/*.interface.ts`
- `backend/src/modules/billing/application/services/billing.service.interface.ts`
- `backend/src/modules/activity/application/services/activity.service.interface.ts`
- `backend/src/modules/resume/application/services/export-email-queue.service.interface.ts`
- `backend/src/modules/resume/application/services/export-storage.service.interface.ts`
- `backend/src/modules/resume/application/services/pdf-renderer.service.interface.ts`
- `backend/src/modules/resume/application/services/resume-template-renderer.service.interface.ts`

## Guardrails

- No direct database or network calls
- Return `Result` or typed application errors
- Keep controllers thin by moving orchestration here

## Before/After Example

Before (anti-pattern: controller orchestrates plan lookup + register + query)

```ts
// Controller did this orchestration
const plan = await planQueryRepo.findByCode('FREE');
const user = await registerUserUseCase.execute({ ... , planId: plan.id });
const fullUser = await userQueryRepo.findById(user.id);
```

After (current: application use case coordinates the flow)

```ts
// CreateUserWithPlanUseCase.execute(...)
const plan = await planQueryRepository.findByCode(planCode);
const created = await registerUserUseCase.execute({ ... , planId: plan.id });
const fullUser = await userQueryRepository.findById(created.getValue().id);
return Result.ok(fullUser);
```
