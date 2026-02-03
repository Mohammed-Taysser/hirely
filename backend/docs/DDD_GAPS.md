# Gap Analysis: Missing Use Cases & Issues

Before proceeding, we have identified several missing components required to fully replicate the existing service functionality in the new DDD architecture.

## 1. Authentication Module

**Current Status:** `RegisterUserUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, and `SwitchUserUseCase` are implemented.
**Missing:**

- **Controller Wiring**: Ensure all auth routes use the application layer use cases and avoid direct service calls in controllers.
  - `auth.controller.ts`: replace `userService.findUserById(...)` with a query use case or query repository for response hydration.

## 2. User Module

**Current Status:** `User` aggregate, repository, `RegisterUserUseCase`, `UpdateUserUseCase`, and `DeleteUserUseCase` exist.
**Missing:**

- **Query / Finder Methods**: Implemented `GetUsersUseCase` and `GetUsersListUseCase`; continue migrating any remaining list endpoints to the query repository.
  - `user.controller.ts`: already using query repos; verify no remaining direct service usage.

## 3. Resume Module

**Current Status:** `CreateResumeUseCase`, `UpdateResumeUseCase`, `DeleteResumeUseCase`, `CreateResumeSnapshotUseCase`, `ExportResumeUseCase`, `GetResumeExportsUseCase`, `GetResumeExportStatusUseCase`, and `EnqueueResumeExportUseCase` are implemented.
**Missing:**

- **Query Use Cases for Lists**:
  - `resume.controller.ts`: `getResumes`, `getResumesList`, and `getResumeSnapshots` still call `resumeService` directly.
- **Plan/Limit Checks in Use Cases**:
  - `resume.controller.ts`: `createResume` uses `resumeService.getPlanLimit` + `countUserResumes` directly; consider a use case to encapsulate plan limit checks.
- **Remaining Export Flows**: Consider moving export queue workers into domain events if you want full decoupling.

## 4. Plan Module

**Current Status:** Controller uses `planService` directly.
**Missing:**

- **DDD Layer**: No domain/application/infrastructure separation yet (use cases + repositories + mappers).

## 5. Export Module

**Current Status:** Controller uses `exportService` directly.
**Missing:**

- **DDD Layer**: Use cases and service abstractions for export status list/single endpoints.

## 6. ResumeTemplate Module

**Current Status:** Controller uses `resumeTemplateService` directly.
**Missing:**

- **DDD Layer (optional)**: Use cases for listing templates if you want consistent application-layer access.

## 7. Technical Constraints / Issues

- **Password Hashing Abstraction**: Added `IPasswordHasher`, and auth use cases now use it for comparison.
- **Legacy Build Errors**: As noted, the build fails due to unrelated legacy files. These might become blockers if we try to switch the main entry point to the new code without cleaning them up.
- **Controller Integration**: Continue migrating remaining controllers to use application-layer use cases instead of services.

## Recommendation

To complete the migration for the **User & Resume** modules, we should prioritize:

1.  **Auth**: Ensure any remaining auth endpoints use the new use cases consistently.
2.  **User**: Finish migrating remaining list endpoints to query use cases.
3.  **Resume**: `CreateResumeSnapshotUseCase` and `ExportResumeUseCase`.

This would cover the core CRUD lifecycle before tackling more advanced features like Snapshots or Exports.
