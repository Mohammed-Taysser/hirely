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

**Current Status:** `CreateResumeUseCase`, `UpdateResumeUseCase`, `DeleteResumeUseCase`, `ExportResumeUseCase`, `GetResumeExportsUseCase`, `GetResumeExportStatusUseCase`, and `EnqueueResumeExportUseCase` are implemented.
**Missing:**

- **Query Use Cases for Lists**:
  - `resume.controller.ts`: `getResumes`, `getResumesList`, and `getResumeSnapshots` still call `resumeService` directly.
- **Plan/Limit Checks in Use Cases**:
  - `resume.controller.ts`: `createResume` uses `resumeService.getPlanLimit` + `countUserResumes` directly; consider a use case to encapsulate plan limit checks.
- **Remaining Export Flows**: Consider moving export queue workers into domain events if you want full decoupling.

## 4. Plan Module

**Current Status:** Query/command repositories and use cases are in place; controller is wired to use cases.
**Missing:**

- **Domain Model**: Optional — add plan aggregate/value objects if business rules grow.

## 5. Export Module

**Current Status:** Export status uses an application use case and service abstraction.
**Missing:**

- **Other Endpoints**: Move any remaining export flows (if added later) into use cases.

## 6. ResumeTemplate Module

**Current Status:** Controller uses `GetResumeTemplatesUseCase` with an infrastructure service wrapper.
**Missing:**

- **None**: DDD layer is in place for listing templates.

## 7. System Module

**Current Status:** Health check logic moved to `GetHealthCheckUseCase` + infrastructure service.
**Missing:**

- **None**: Controller is thin and follows application layer.

## 8. Technical Constraints / Issues

- **Password Hashing Abstraction**: Added `IPasswordHasher`, and auth use cases now use it for comparison.
- **Legacy Build Errors**: As noted, the build fails due to unrelated legacy files. These might become blockers if we try to switch the main entry point to the new code without cleaning them up.
- **Controller Integration**: Continue migrating remaining controllers to use application-layer use cases instead of services.

## Recommendation

To complete the migration for the **User & Resume** modules, we should prioritize:

1.  **Auth**: Ensure any remaining auth endpoints use the new use cases consistently.
2.  **User**: Finish migrating remaining list endpoints to query use cases.
3.  **Resume**: `ExportResumeUseCase`.

This would cover the core CRUD lifecycle before tackling more advanced features like Snapshots or Exports.
