# Step 6: Application Layer - Query Use Cases

**Status:** ✅ Completed
**Date:** February 3, 2026

## Objective

Add query-oriented use cases for read operations to keep controllers from calling repositories directly. This keeps read logic aligned with the Application layer and exposes consistent DTOs.

## 🏗️ Core Components Implemented

### 1. `FindUserByIdUseCase`

- **Path:** `backend/src/modules/user/application/use-cases/find-user-by-id/`
- **Input:** `FindUserByIdRequestDto` (`userId`)
- **Output:** `UserDto`
- **Behavior:** Loads the `User` aggregate, returns `NotFoundError` when missing.

### 2. `FindResumeByIdUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/find-resume-by-id/`
- **Input:** `FindResumeByIdRequestDto` (`resumeId`, `userId`)
- **Output:** `ResumeDto`
- **Behavior:** Loads the `Resume` aggregate scoped by `userId`, returns `NotFoundError` when missing.

## 📁 Updated File Structure

```text
backend/src/modules/
├── user/
│   └── application/
│       └── use-cases/
│           └── find-user-by-id/
│               ├── find-user-by-id.dto.ts
│               └── find-user-by-id.use-case.ts
└── resume/
    └── application/
        └── use-cases/
            └── find-resume-by-id/
                ├── find-resume-by-id.dto.ts
                └── find-resume-by-id.use-case.ts
```

## 🛠️ Design Decisions

- **Read Use Cases**: Queries are modeled as use cases to keep controllers thin and to centralize mapping to response DTOs.
- **Consistent Error Shape**: Missing resources return `NotFoundError`, matching the existing error policy.
