# DDD One-Page Cheat Sheet (Hirely)

## Core Idea
Put business rules in the **Domain**, orchestrate in **Application**, implement tech in **Infrastructure**, and keep HTTP in **Presentation**.

## Layers at a Glance

```text
[ Presentation ]  -> controllers, routes, middleware
        |
        v
[ Application ]   -> use cases, DTOs, interfaces
        |
        v
[ Domain ]        -> aggregates, value objects, domain events
        |
        v
[ Infrastructure ]-> Prisma, queues, storage, external APIs
```

## Responsibilities
- Domain: rules + invariants
- Application: workflows + orchestration
- Infrastructure: I/O and external systems
- Presentation: HTTP glue

## DO / DON'T
- DO keep domain free of Prisma/Express/queues
- DO keep controllers thin
- DON'T call Prisma directly from controllers
- DON'T import infra implementations into use cases

## Flow Diagram: Resume Update

```text
HTTP
  |
  v
ResumeController.updateResume()
  |
  v
UpdateResumeUseCase.execute()
  |
  +--> ResumeRepository.findById()
  |       (domain aggregate)
  +--> ResumeRepository.save()
  +--> ResumeSnapshotRepository.createSnapshot()
  +--> ResumeQueryRepository.findById()
  |
  v
HTTP response (updated DTO)
```

## Flow Diagram: Async Export

```text
HTTP
  |
  v
EnqueueResumeExportUseCase.execute()
  |
  +--> RateLimiter.consume()
  +--> ResumeSnapshotRepository.createSnapshot()
  +--> ExportService.createExportRecord()
  +--> ExportQueue.enqueuePdf()
  |
  v
PDF Worker
  |
  +--> ExportService.processPdfExport()
  |     +--> Storage.uploadBuffer()
  |     +--> ExportEmailQueue.enqueue() [free tier]
  |
  v
Email Worker -> ExportEmailService.sendExportEmail()
```

## Quick Examples

Domain
```ts
// user.aggregate.ts
public updateEmail(email: UserEmail): void {
  this.props.email = email;
}
```

Application
```ts
// create-resume.use-case.ts
const planLimit = await planLimitQueryRepository.findByPlanId(planId);
if (count >= planLimit.maxResumes) return Result.fail(new ForbiddenError(...));
```

Infrastructure
```ts
// prisma-user.repository.ts
await prisma.user.upsert({ ... });
```

Presentation
```ts
// auth.controller.ts
const result = await registerUserUseCase.execute(input);
return responseService.success(res, { data: result.getValue() });
```

## Where To Look
- Domain: `backend/src/modules/*/domain/*`
- Application: `backend/src/modules/*/application/*`
- Infrastructure: `backend/src/modules/*/infrastructure/*`
- Presentation: `backend/src/modules/*/*.controller.ts`
