# Domain-Driven Design (DDD) Implementation Roadmap

This document tracks the progress of implementing DDD principles in the Hirely application. Our goal is to create a maintainable, testable, and business-centric architecture.

## 🗺️ Roadmap Progress

- [x] **Step 1: Domain Layer Foundations**
  - Create base classes for Entities, Value Objects, and Aggregate Roots.
  - Implement a `Result` pattern for functional error handling.
- [x] **Step 2: Domain Logic - Core Entities**
  - Define core Domain Entities (e.g., User, Resume, Application).
  - Define Value Objects for business constraints (e.g., Email, Phone, SalaryRange).
- [x] **Step 3: Application Layer - Use Cases**
  - Implement Application Services/Command Handlers.
  - Define Input/Output DTOs.
- [x] **Step 4: Infrastructure Layer - Persistence**
  - Implement Repositories using Prisma.
  - Create Mappers to convert between Domain Entities and Persistence Models.
- [x] **Step 5: Communication - Domain Events**
  - Implement an Event Dispatcher.
  - Add logic to handle events within and across bounded contexts.
- [x] **Step 6: Application Layer - Query Use Cases**
  - Add read use cases for query operations (User, Resume).
  - Standardize query DTOs and response mapping.
- [x] **Step 7: Application Layer - Auth Use Cases**
  - Add refresh token and user switching use cases.
  - Wire auth flows through the application layer.

---

## 📂 Implementation Modules

Detailed reports for each step:

1. [Step 1: Domain Layer Foundation](./step-1-domain-layer-foundation.md)
2. [Step 2: Domain Logic - Core Entities](./step-2-core-entities-and-value-objects.md)
3. [Step 3: Application Layer - Use Cases](./step-3-application-layer-use-cases.md)
4. [Step 4: Infrastructure Layer - Persistence](./step-4-infrastructure-layer-persistence.md)
5. [Step 5: Communication - Domain Events](./step-5-communication-domain-events.md)
6. [Step 6: Application Layer - Query Use Cases](./step-6-application-layer-queries.md)
7. [Step 7: Application Layer - Auth Use Cases](./step-7-application-layer-auth-use-cases.md)
