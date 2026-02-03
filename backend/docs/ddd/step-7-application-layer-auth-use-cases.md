# Step 7: Application Layer - Auth Use Cases

**Status:** ✅ Completed
**Date:** February 3, 2026

## Objective

Move authentication flows into the Application layer to keep controllers thin and to enforce consistent error handling and token generation.

## 🏗️ Core Components Implemented

### 1. `LoginUseCase`

- **Path:** `backend/src/modules/auth/application/use-cases/login/`
- **Input:** `LoginRequestDto` (`email`, `password`)
- **Output:** `LoginResponseDto` (user payload + access/refresh tokens)
- **Behavior:** Validates credentials and issues tokens via `ITokenService`.

### 2. `RefreshTokenUseCase`

- **Path:** `backend/src/modules/auth/application/use-cases/refresh-token/`
- **Input:** `RefreshTokenRequestDto` (`refreshToken`)
- **Output:** `RefreshTokenResponseDto` (new access/refresh tokens)
- **Behavior:** Verifies refresh tokens and rotates them.

### 3. `SwitchUserUseCase`

- **Path:** `backend/src/modules/auth/application/use-cases/switch-user/`
- **Input:** `SwitchUserRequestDto` (`userId`)
- **Output:** `SwitchUserResponseDto` (user payload + access/refresh tokens)
- **Behavior:** Loads the target user and issues tokens for impersonation/switching.

## 📁 Updated File Structure

```text
backend/src/modules/auth/
└── application/
    └── use-cases/
        ├── login/
        │   ├── login.dto.ts
        │   └── login.use-case.ts
        ├── refresh-token/
        │   ├── refresh-token.dto.ts
        │   └── refresh-token.use-case.ts
        └── switch-user/
            ├── switch-user.dto.ts
            └── switch-user.use-case.ts
```

## 🛠️ Design Decisions

- **Token Service Abstraction**: Use cases depend on `ITokenService` so the implementation can be swapped (JWT, session, etc.).
- **Consistent Error Handling**: Invalid tokens/credentials are modeled as `ValidationError` to keep controller mapping simple.
