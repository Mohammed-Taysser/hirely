# Step 5: Communication - Domain Events

**Status:** ✅ Completed
**Date:** January 31, 2026

## Objective

Implement a Domain Event system to decouple side effects from core business transactions. This ensures that changes in one aggregate (e.g., User Created) can trigger actions in other parts of the system (e.g., Send Welcome Email) without tight coupling.

## 🏗️ Core Components Implemented

### 1. Event Dispatching Infrastructure

- **`IDomainEvent` Interface:** `backend/src/modules/shared/domain/events/domain-event.interface.ts`
  - Standard contract for all domain events.
- **`DomainEvents` Dispatcher:** `backend/src/modules/shared/domain/events/domain-events.ts`
  - Centralized Publish/Subscribe mechanism.
  - Manages handler registration and event dispatching.
- **`IHandle` Interface:** `backend/src/modules/shared/domain/events/handle.interface.ts`
  - Contract for event subscribers.

### 2. Integration with Aggregates

- **Aggregate Root Updates:** `backend/src/modules/shared/domain/base/aggregate-root.base.ts`
  - `addDomainEvent` method now automatically marks the aggregate for dispatch in the `DomainEvents` system.
- **Repository Integration:** `PrismaUserRepository` and `PrismaResumeRepository` now call `DomainEvents.dispatchEventsForAggregate(id)` after successfully saving data. This creates a "Transactional Outbox" like behavior where events are only sent if persistence succeeds.

### 3. Concrete Implementation (User Domain)

- **Use Case:** "User Registered"
- **Event:** `UserCreatedEvent` (`backend/src/modules/user/domain/events/user-created.event.ts`)
  - Carries the `User` aggregate as payload.
- **Subscriber:** `AfterUserCreated` (`backend/src/modules/user/subscriptions/after-user-created.ts`)
  - Listens for `UserCreatedEvent`.
  - Simulates a side effect (console log for welcome message).
- **Registration:** `backend/src/modules/user/user.subscriptions.ts`
  - Entry point to instantiate subscribers.
  - Imported in `server.ts` to ensure listeners are active at startup.

## 📁 Updated File Structure

```text
backend/src/modules/
├── shared/
│   └── domain/
│       └── events/
│           ├── domain-events.ts
│           ├── domain-event.interface.ts
│           └── handle.interface.ts
└── user/
    ├── domain/
    │   └── events/
    │       └── user-created.event.ts
    ├── subscriptions/
    │   └── after-user-created.ts
    └── user.subscriptions.ts
```

## 🛠️ Design Decisions

- **Decoupled Side Effects**: By moving the "Welcome Email" logic out of the `RegisterUserUseCase` and into an event subscriber, the use case remains focused solely on the transaction of creating a user account.
- **Async Dispatch**: Event handlers are executed asynchronously after the database transaction commits, preventing slow side effects (like external API calls) from blocking the user response.
- **Setup-on-Startup**: Using `user.subscriptions.ts` imported in `server.ts` guarantees that all event listeners are registered before any requests are processed.
