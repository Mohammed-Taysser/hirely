# Step 4: Infrastructure Layer - Persistence

**Status:** ✅ Completed
**Date:** January 30, 2026

## Objective

Implement the Infrastructure Layer responsible for data persistence. This step realizes the abstract repository interfaces defined in the Domain/Application layers using Prisma as the concrete implementation tool.

## 🏗️ Core Components Implemented

### 1. Persistence Mappers

- **User Mapper:** `backend/src/modules/user/infrastructure/persistence/user.mapper.ts`
- **Resume Mapper:** `backend/src/modules/resume/infrastructure/persistence/resume.mapper.ts`
- **Purpose:** Translates between Domain Aggregates (e.g., `User`) and Database Models (e.g., Prisma's `User`).
- **Benefits:**
  - Decouples Domain Layer from Database Schema.
  - Handles data transformations (e.g., JSON to typed objects).
  - Ensures that data pulled from the DB correctly re-instantiates complex Value Objects.

### 2. Concrete Repositories (Prisma)

- **Prisma User Repository:** `backend/src/modules/user/infrastructure/persistence/prisma-user.repository.ts`
- **Prisma Resume Repository:** `backend/src/modules/resume/infrastructure/persistence/prisma-resume.repository.ts`
- **Purpose:** Implements the `IUserRepository` and `IResumeRepository` interfaces.
- **Key Features:**
  - Uses `prisma.user.upsert` and `prisma.resume.upsert` for idempotent saving.
  - Leverages the Mappers to maintain domain purity.
  - Provides a single point of change for data access logic.

## 📁 Updated File Structure

```text
backend/src/modules/
├── user/
│   └── infrastructure/
│       └── persistence/
│           ├── prisma-user.repository.ts
│           └── user.mapper.ts
└── resume/
    └── infrastructure/
        └── persistence/
            ├── prisma-resume.repository.ts
            └── resume.mapper.ts
```

## 🛠️ Design Decisions

- **Upsert Pattern**: Used `upsert` in repository `save` methods to handle both creation and updates uniformly based on the Entity's ID.
- **Isolation of JSON Types**: The `ResumeMapper` handles the conversion of Prisma's `Json` type into the typed `ResumeData` from `@hirely/resume-core`, keeping this infrastructure-specific "casting" out of the domain logic.
- **Explicit Mapping**: Chose manual mapping over automated libraries to ensure full control over how Value Objects are reconstructed from raw database strings (e.g., ensuring a hashed password stays marked as hashed).
