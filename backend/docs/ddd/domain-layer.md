# Domain Layer

## Purpose

Encapsulate core business rules and invariants. This layer defines the vocabulary of the system.

## What Belongs Here

- Aggregates, entities, and value objects
- Domain events
- Domain services (only if behavior does not fit an entity/value object)
- Domain-level errors (when they describe business rules)

## Where To Find It

- `backend/src/modules/*/domain/*`
- `backend/src/modules/shared/domain/*`

## Dependencies

- Allowed: shared domain utilities (`Result`, base classes, domain events)
- Not allowed: application, infrastructure, or presentation code

## Examples

- `backend/src/modules/user/domain/user.aggregate.ts`
- `backend/src/modules/user/domain/value-objects/user-email.vo.ts`
- `backend/src/modules/shared/domain/events/*`

## Guardrails

- No persistence or transport concerns (no Prisma, HTTP, queues)
- Keep rules close to the aggregate or value object
- Emit domain events when business state changes

## Before/After Example

Before (anti-pattern: primitive email validation in app layer)

```ts
// Application code doing ad-hoc validation
if (!input.email.includes('@')) throw new Error('Invalid email');
```

After (current: value object owns invariants)

```ts
// Domain value object
const emailResult = UserEmail.create(input.email);
if (emailResult.isFailure) return Result.fail(new ValidationError(...));
```
