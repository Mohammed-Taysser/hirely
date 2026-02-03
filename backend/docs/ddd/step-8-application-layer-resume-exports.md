# Step 8: Application Layer - Resume Snapshots & Exports

**Status:** ✅ Completed
**Date:** February 3, 2026

## Objective

Move snapshot creation and PDF export generation into the Application layer, and add read/queue flows for resume exports.

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

### 3. `GetResumeExportsUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/get-resume-exports/`
- **Input:** `GetResumeExportsRequestDto` (`page`, `limit`, `filters`)
- **Output:** `{ exports, total }`
- **Behavior:** Returns paginated export records via a query repository.

### 4. `GetResumeExportStatusUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/get-resume-export-status/`
- **Input:** `GetResumeExportStatusRequestDto` (`userId`, `resumeId`, `exportId`)
- **Output:** Export status payload (`status`, `expiresAt`, `downloadUrl`)
- **Behavior:** Queries export status through the export service abstraction.

### 5. `EnqueueResumeExportUseCase`

- **Path:** `backend/src/modules/resume/application/use-cases/enqueue-resume-export/`
- **Input:** `EnqueueResumeExportRequestDto` (`user`, `resumeId`)
- **Output:** `{ exportId, delivery }`
- **Behavior:** Enforces export limits and queues PDF generation.

## 📁 Updated File Structure

```text
backend/src/modules/resume/
├── application/
│   ├── repositories/
│   │   └── resume-snapshot.repository.interface.ts
│   │   └── resume-export.query.repository.interface.ts
│   ├── services/
│   │   └── resume-export.service.interface.ts
│   └── use-cases/
│       ├── create-resume-snapshot/
│       │   ├── create-resume-snapshot.dto.ts
│       │   └── create-resume-snapshot.use-case.ts
│       └── export-resume/
│           ├── export-resume.dto.ts
│           └── export-resume.use-case.ts
│       └── get-resume-exports/
│           ├── get-resume-exports.dto.ts
│           └── get-resume-exports.use-case.ts
│       └── get-resume-export-status/
│           ├── get-resume-export-status.dto.ts
│           └── get-resume-export-status.use-case.ts
│       └── enqueue-resume-export/
│           ├── enqueue-resume-export.dto.ts
│           └── enqueue-resume-export.use-case.ts
└── infrastructure/
    ├── persistence/
    │   └── prisma-resume-snapshot.repository.ts
    │   └── prisma-resume-export.query.repository.ts
    └── services/
        └── resume-export.service.ts
```

## 🛠️ Design Decisions

- **Repository + Service Abstractions**: Snapshot creation and export generation are delegated to repository/service interfaces for testability.
- **Controller Simplicity**: Controllers call use cases and handle only HTTP mapping concerns.
