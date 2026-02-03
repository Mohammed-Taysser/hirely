# Gap Analysis: Missing Use Cases & Issues

Before proceeding, we have identified several missing components required to fully replicate the existing service functionality in the new DDD architecture.

## 1. Authentication Module

**Current Status:** `RegisterUserUseCase` and `LoginUseCase` are implemented.
**Missing:**

- **`RefreshTokenUseCase`**: Logic currently in `auth.controller.ts`.
- **`SwitchUserUseCase`**: Logic currently in `auth.controller.ts`.

## 2. User Module

**Current Status:** `User` aggregate, repository, `RegisterUserUseCase`, `UpdateUserUseCase`, and `DeleteUserUseCase` exist.
**Missing:**

- **Query / Finder Methods**: The `UserService` has `getPaginatedUsers`. In DDD, this is often handled by specific "Query" handlers or separated from the "Command" (Write) repositories to keep Aggregates focused on state changes.

## 3. Resume Module

**Current Status:** `CreateResumeUseCase`, `UpdateResumeUseCase`, and `DeleteResumeUseCase` are implemented.
**Missing:**

- **`CreateResumeSnapshotUseCase`**: Handles versioning.
- **`ExportResumeUseCase`**: Handles PDF/Export generation logic.

## 4. Technical Constraints / Issues

- **Direct Infrastructure Dependency**: The `RegisterUserUseCase` imports `tokenService` directly. ideally, an `IPasswordHasher` interface should be defined in the Domain/Application layer and injected, abiding by the Dependency Inversion Principle.
- **Legacy Build Errors**: As noted, the build fails due to unrelated legacy files. These might become blockers if we try to switch the main entry point to the new code without cleaning them up.
- **Controller Integration**: We still need to wire the new Use Cases into the Express implementation (`auth.controller.ts`) to actually use them.

## Recommendation

To complete the migration for the **User & Resume** modules, we should prioritize:

1.  **Auth**: `LoginUseCase`, `RefreshTokenUseCase`, `SwitchUserUseCase`.
2.  **User**: Query handlers for list/pagination use cases.
3.  **Resume**: `CreateResumeSnapshotUseCase` and `ExportResumeUseCase`.

This would cover the core CRUD lifecycle before tackling more advanced features like Snapshots or Exports.
