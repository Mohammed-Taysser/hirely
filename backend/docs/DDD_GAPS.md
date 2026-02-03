# Gap Analysis: Missing Use Cases & Issues

Before proceeding, we have identified several missing components required to fully replicate the existing service functionality in the new DDD architecture.

## 1. Authentication Module

**Current Status:** `RegisterUserUseCase`, `LoginUseCase`, `RefreshTokenUseCase`, and `SwitchUserUseCase` are implemented.
**Missing:**

- **Controller Wiring**: Ensure all auth routes use the application layer use cases.

## 2. User Module

**Current Status:** `User` aggregate, repository, `RegisterUserUseCase`, `UpdateUserUseCase`, and `DeleteUserUseCase` exist.
**Missing:**

- **Query / Finder Methods**: Implemented `GetUsersUseCase` and `GetUsersListUseCase`; continue migrating any remaining list endpoints to the query repository.

## 3. Resume Module

**Current Status:** `CreateResumeUseCase`, `UpdateResumeUseCase`, and `DeleteResumeUseCase` are implemented.
**Missing:**

- **`CreateResumeSnapshotUseCase`**: Handles versioning.
- **`ExportResumeUseCase`**: Handles PDF/Export generation logic.

## 4. Technical Constraints / Issues

- **Direct Infrastructure Dependency**: The `RegisterUserUseCase` imports `tokenService` directly. ideally, an `IPasswordHasher` interface should be defined in the Domain/Application layer and injected, abiding by the Dependency Inversion Principle.
- **Legacy Build Errors**: As noted, the build fails due to unrelated legacy files. These might become blockers if we try to switch the main entry point to the new code without cleaning them up.
- **Controller Integration**: Continue migrating remaining controllers to use application-layer use cases instead of services.

## Recommendation

To complete the migration for the **User & Resume** modules, we should prioritize:

1.  **Auth**: Ensure any remaining auth endpoints use the new use cases consistently.
2.  **User**: Finish migrating remaining list endpoints to query use cases.
3.  **Resume**: `CreateResumeSnapshotUseCase` and `ExportResumeUseCase`.

This would cover the core CRUD lifecycle before tackling more advanced features like Snapshots or Exports.
