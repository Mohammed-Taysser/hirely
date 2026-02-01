# Step 2: Domain Logic - Core Entities

**Status:** ✅ Completed
**Date:** January 30, 2026

## Objective

Implement core business entities and value objects that represent the heart of the Hirely application. These objects encapsulate business rules and invariants.

## 🏗️ Core Entities Implemented

### 1. `User` (Aggregate Root)

- **Path:** `backend/src/modules/user/domain/user.aggregate.ts`
- **Responsibilities:**
  - Manages user identity, security (password), and plan association.
  - Handles verification and soft-deletion logic.
- **Value Objects Used:** `UserEmail`, `UserName`, `UserPassword`.

### 2. `Resume` (Aggregate Root)

- **Path:** `backend/src/modules/resume/domain/resume.aggregate.ts`
- **Responsibilities:**
  - Manages resume content (`ResumeData`) and branding (`themeConfig`).
  - Handles template selection and renaming logic.
- **Value Objects Used:** `ResumeName`, `ResumeData` (from `@hirely/resume-core`).

## 💎 Value Objects Implemented

### 1. `UserEmail`

- Ensures valid email format using a secure regex (ReDoS protected).
- Normalizes emails to lowercase and trimmed strings.

### 2. `UserName`

- Enforces length constraints (2-100 characters).

### 3. `UserPassword`

- Distinguishes between plain-text and hashed states.
- Rejects insecure short passwords.

### 4. `ResumeName`

- Ensures every resume has a non-empty, reasonably lengthed name.

## 📁 Updated File Structure

```text
backend/src/modules/
├── user/
│   └── domain/
│       ├── user.aggregate.ts
│       └── value-objects/
│           ├── user-email.vo.ts
│           ├── user-name.vo.ts
│           └── user-password.vo.ts
└── resume/
    └── domain/
        ├── resume.aggregate.ts
        └── value-objects/
            └── resume-name.vo.ts
```

## 🛠️ Design Decisions

- **Aggregate Root approach**: `User` and `Resume` are treated as independent aggregates to allow for better scaling and clear boundaries.
- **Strict Typing**: Replaced all `any` uses with `unknown` or specific interfaces to ensure compile-time safety.
- **Zod Validation**: All Value Objects now use `zod` for declarative, robust validation of business rules and invariants.
- **Layered Imports**: Standardized import order (External -> Domain -> Shared) for better readability.
- **Encapsulated Props**: Used `type` instead of `interface` for internal properties to simplify compatibility with the base `ValueObject` class.
