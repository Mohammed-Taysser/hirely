# Module Boundaries

## Why this exists

Layer rules alone are not enough. In DDD, each module (bounded context) should expose stable **application contracts** and hide internals.

Without module boundaries:

- another module can import your domain types directly
- use cases start depending on other modules' concrete use-case classes
- refactors become risky because internals leak across modules

## Enforced Rules

Checked by:

- `npm run arch:check`
- `npm run lint` (runs `arch:check` first)
- GitHub Actions workflow: `.github/workflows/backend-quality.yml`

Rules:

1. Cross-module imports are forbidden for:
   - `domain/*`
   - `infrastructure/*`
   - `presentation/*`
2. Imports to `application/use-cases/*` are forbidden from inside `src/modules/*` (even same-module).
3. Cross-module dependencies must go through:
   - `application` contracts/interfaces
   - `shared` module contracts/utilities
4. Intra-module layer rules are enforced for both alias and relative imports:
   - `domain` cannot import `application` / `infrastructure` / `presentation`
   - `application` cannot import `infrastructure` / `presentation`
   - `infrastructure` cannot import `presentation`

## Examples

Bad:

```ts
import { CreateUserWithPlanUseCase } from '@/modules/user/application/use-cases/create-user-with-plan/create-user-with-plan.use-case';
```

Good:

```ts
import { ICreateUserWithPlanService } from '@/modules/user/application/services/create-user-with-plan.service.interface';
```

Bad:

```ts
import { UserEmail } from '@/modules/user/domain/value-objects/user-email.vo';
```

Good:

```ts
import { IUserQueryRepository } from '@/modules/user/application/repositories/user.query.repository.interface';
```

## Current Scope

This check runs for:

- `src/modules/**`
- `src/jobs/**`
- `src/commands/**`

Composition root files in `src/apps/**` are intentionally not part of this check, so wiring can reference concrete implementations.
