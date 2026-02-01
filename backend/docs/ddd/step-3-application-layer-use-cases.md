# Step 3: Application Layer - Use Cases

**Status:** ✅ Completed
**Date:** January 30, 2026

## Objective

Implement the Application Layer, which orchestrates the Domain Layer to perform specific business tasks (Use Cases). This layer is responsible for coordinating the flow of data to and from the domain entities and infrastructure services.

## 🏗️ Core Components Implemented

### 1. `UseCase` Interface

- **Path:** `backend/src/modules/shared/application/use-case.interface.ts`
- **Purpose:** A standard contract for all business operations.
- **Key Features:** Ensures every use case has a consistent `execute` method.

### 2. `AppError`

- **Path:** `backend/src/modules/shared/application/app-error.ts`
- **Purpose:** A flat hierarchy of application-level errors (e.g., `ValidationError`, `UnexpectedError`, `ConflictError`).
- **Key Features:** Provides a standardized, typed way to return failures from the application layer to the outer layers (controllers).

### 3. Repository Interfaces

- **User:** `backend/src/modules/user/domain/repositories/user.repository.interface.ts`
- **Resume:** `backend/src/modules/resume/domain/repositories/resume.repository.interface.ts`
- **Purpose:** Abstract contracts that define how the application layer interacts with persistence. Implementation details are deferred to the Infrastructure layer.

## 🚀 Use Cases Implemented

### 1. `RegisterUserUseCase`

- **Path:** `backend/src/modules/user/application/use-cases/register-user/`
- **Logic:**
  - Validates registration data via Value Objects.
  - Checks for existing users via `IUserRepository.exists`.
  - Hashes passwords using `tokenService`.
  - Creates and persists a new `User` aggregate.

### 2. `CreateResumeUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/create-resume/`
- **Logic:**
  - Validates resume name via `ResumeName` Value Object.
  - Creates a new `Resume` aggregate using core types from `@hirely/resume-core`.
  - Persists the resume via `IResumeRepository.save`.

## 📁 Updated File Structure

```text
backend/src/modules/
├── shared/
│   └── application/
│       ├── app-error.ts
│       └── use-case.interface.ts
├── user/
│   ├── domain/
│   │   └── repositories/
│   │       └── user.repository.interface.ts
│   └── application/
│       └── use-cases/
│           └── register-user/
│               ├── register-user.dto.ts
│               └── register-user.use-case.ts
└── resume/
    ├── domain/
    │   └── repositories/
    │       └── resume.repository.interface.ts
    └── application/
        └── use-cases/
            └── create-resume/
                └── create-resume.use-case.ts
```

## 🛠️ Design Decisions

- **Interface Segregation**: Repository interfaces are kept in the Domain layer to allow the Domain/Application layers to remain pure and independent of specific persistence technologies.
- **Standardized Responses**: Use cases return `Result` objects wrapping either a success value or an `AppError`, ensuring failure handling is explicit and typed.
- **DTOs for Input**: Used simple interfaces for input to decouple the application logic from the transport layer (Express request objects).
