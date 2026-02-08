# Plan Changes (Upgrade/Downgrade)

## Scope

This feature allows a user to change their plan by plan code (e.g., `FREE`, `PRO`).

## Current Behavior (MVP)

- Plan changes are **immediate** by default.
- Optional scheduling via `scheduleAt` (future ISO date).
- Scheduled plan changes are applied by a BullMQ worker every `PLAN_CHANGE_INTERVAL_SECONDS` (default 300s).
- No billing provider integration yet.
- No proration or billing-cycle alignment.
- User can only change **their own** plan.

## API

### Endpoint

`PATCH /users/:userId/plan`

### Request

```json
{
  "planCode": "PRO",
  "scheduleAt": "2026-02-10T12:00:00.000Z"
}
```

### Response

Returns the updated user payload (full user DTO).

If `scheduleAt` is in the future, the plan change is stored as `pendingPlanId` and
`pendingPlanAt`, and the user’s `planId` remains unchanged until applied.

### Errors

- `404` if user or plan is not found
- `400` if plan code is missing
- `403` if user tries to change another user’s plan

## Implementation Notes

- Use case: `backend/src/modules/user/application/use-cases/change-user-plan/change-user-plan.use-case.ts`
- Controller: `backend/src/modules/user/user.controller.ts`
- Route: `backend/src/modules/user/user.route.ts`

## Future Enhancements

- Scheduled downgrades aligned to billing cycle
- Billing provider integration (Stripe/Paddle)
- Plan change history table
- Proration rules
