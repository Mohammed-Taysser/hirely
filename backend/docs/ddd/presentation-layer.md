# Presentation Layer

## Purpose

Handle delivery mechanisms: HTTP, request validation, authentication, and response formatting.

## What Belongs Here

- Controllers and routes
- Middlewares (auth, validation, error handling)
- Request/response shaping and error mapping

## Where To Find It

- `backend/src/modules/*/presentation/*.controller.ts`
- `backend/src/modules/*/presentation/*.route.ts`
- `backend/src/middleware/*`
- `backend/src/modules/shared/presentation/*`

## Dependencies

- Allowed: application use cases and DTO schemas
- Not allowed: direct database access or infrastructure-specific libraries

## Examples

- `backend/src/modules/resume/presentation/resume.controller.ts`
- `backend/src/modules/auth/presentation/auth.controller.ts`
- `backend/src/middleware/authenticate.middleware.ts`

## Guardrails

- Keep logic thin: delegate to use cases
- Map application errors to HTTP responses here
- Validate inputs before calling use cases

## Before/After Example

Before (anti-pattern: controller issues tokens)

```ts
// auth.controller.ts
const accessToken = tokenService.signAccessToken(user);
const refreshToken = tokenService.signRefreshToken(user);
```

After (current: controller delegates to use case)

```ts
// auth.controller.ts
const result = await registerUserUseCase.execute(input);
return responseService.success(res, { data: result.getValue() });
```
