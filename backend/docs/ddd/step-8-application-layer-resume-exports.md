# Step 8: Application Layer - Resume Snapshots & Exports

**Status:** ✅ Completed
**Date:** February 3, 2026

## Objective

Move snapshot creation and PDF export generation into the Application layer to keep controllers thin and enforce consistent error handling.

## 🏗️ Core Components Implemented

### 1. `CreateResumeSnapshotUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/create-resume-snapshot/`
- **Input:** `CreateResumeSnapshotRequestDto` (`userId`, `resumeId`)
- **Output:** Snapshot DTO (`id`, `resumeId`, `userId`, `data`, `createdAt`)
- **Behavior:** Creates a snapshot for the current resume data or returns `NotFoundError`.

### 2. `ExportResumeUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/export-resume/`
- **Input:** `ExportResumeRequestDto` (`userId`, `resumeId`)
- **Output:** `ResumeExportResult` (`pdfBuffer`)
- **Behavior:** Generates a PDF buffer via the export service abstraction.

## 📁 Updated File Structure

```text
backend/src/modules/resume/
├── application/
│   ├── repositories/
│   │   └── resume-snapshot.repository.interface.ts
│   ├── services/
│   │   └── resume-export.service.interface.ts
│   └── use-cases/
│       ├── create-resume-snapshot/
│       │   ├── create-resume-snapshot.dto.ts
│       │   └── create-resume-snapshot.use-case.ts
│       └── export-resume/
│           ├── export-resume.dto.ts
│           └── export-resume.use-case.ts
└── infrastructure/
    ├── persistence/
    │   └── prisma-resume-snapshot.repository.ts
    └── services/
        └── resume-export.service.ts
```

## 🛠️ Design Decisions

- **Repository + Service Abstractions**: Snapshot creation and export generation are delegated to repository/service interfaces for testability.
- **Controller Simplicity**: Controllers call use cases and handle only HTTP mapping concerns.
