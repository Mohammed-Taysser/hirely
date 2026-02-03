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

### 3. `GetUsersUseCase`

- **Path:** `backend/src/modules/user/application/use-cases/get-users/`
- **Input:** `GetUsersRequestDto` (`page`, `limit`, `filters`)
- **Output:** `{ users, total }`
- **Behavior:** Uses the query repository to return paginated users for list screens.

### 4. `GetUsersListUseCase`

- **Path:** `backend/src/modules/user/application/use-cases/get-users-list/`
- **Input:** `GetUsersListRequestDto` (`filters`)
- **Output:** `UserBasicDto[]`
- **Behavior:** Returns lightweight user lists (id/name) for dropdowns or selectors.

## 📁 Updated File Structure

```text
backend/src/modules/
├── user/
│   └── application/
│       └── use-cases/
│           └── find-user-by-id/
│               ├── find-user-by-id.dto.ts
│               └── find-user-by-id.use-case.ts
│           └── get-users/
│               ├── get-users.dto.ts
│               └── get-users.use-case.ts
│           └── get-users-list/
│               ├── get-users-list.dto.ts
│               └── get-users-list.use-case.ts
└── resume/
    └── application/
        └── use-cases/
            └── find-resume-by-id/
                ├── find-resume-by-id.dto.ts
                └── find-resume-by-id.use-case.ts
```

## 🛠️ Design Decisions

- **Read Use Cases**: Queries are modeled as use cases to keep controllers thin and to centralize mapping to response DTOs.
- **Query Repository**: Read operations use a dedicated query repository to keep read models separate from aggregate persistence.
- **Consistent Error Shape**: Missing resources return `NotFoundError`, matching the existing error policy.
