import { UserCreatedEvent } from '../domain/events/user-created.event';

import { IDomainEvent } from '@/modules/shared/domain/events/domain-event.interface';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';
import { IHandle } from '@/modules/shared/domain/events/handle.interface';

export class AfterUserCreated implements IHandle<UserCreatedEvent> {
  constructor() {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    // Register the handler with the DomainEvents dispatcher
    DomainEvents.register(
      this.handle.bind(this) as (event: IDomainEvent) => Promise<void>,
      UserCreatedEvent.name
    );
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    const { user } = event;

    // Simulate a side-effect, e.g., sending a welcome email or Logging
    console.log(
      `[Domain Event]: UserCreatedEvent handled. Welcome, ${user.name.value}! (${user.email.value})`
    );
  }
}
