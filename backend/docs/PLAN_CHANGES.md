# Plan Changes (Upgrade/Downgrade)

## Scope

This feature allows a user to change their plan by plan code (e.g., `FREE`, `PRO`).

## Current Behavior (MVP)

- Plan changes are **immediate**.
- No billing provider integration yet.
- No proration or scheduled downgrades.
- User can only change **their own** plan.

## API

### Endpoint

`PATCH /users/:userId/plan`

### Request

```json
{
  "planCode": "PRO"
}
```

### Response

Returns the updated user payload (full user DTO).

### Errors

- `404` if user or plan is not found
- `400` if plan code is missing
- `403` if user tries to change another user’s plan

## Implementation Notes

- Use case: `backend/src/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case.ts`
- Controller: `backend/src/modules/user/user.controller.ts`
- Route: `backend/src/modules/user/user.route.ts`

## Future Enhancements

- Scheduled downgrades at end of billing cycle
- Billing provider integration (Stripe/Paddle)
- Plan change history table
- Proration rules
