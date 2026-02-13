import { UserCreatedEvent } from '../../domain/events/user-created.event';

import { IDomainEvent } from '@/modules/shared/domain/events/domain-event.interface';
import { DomainEvents } from '@/modules/shared/domain/events/domain-events';
import { IHandle } from '@/modules/shared/domain/events/handle.interface';
import loggerService from '@/modules/shared/infrastructure/services/logger.service';

export class AfterUserCreated implements IHandle<UserCreatedEvent> {
  public setupSubscriptions(): void {
    // Register the handler with the DomainEvents dispatcher
    DomainEvents.register(
      this.handle.bind(this) as (event: IDomainEvent) => Promise<void>,
      UserCreatedEvent.name
    );
  }

  async handle(event: UserCreatedEvent): Promise<void> {
    const { user } = event;

    loggerService.info(
      `[Domain Event]: UserCreatedEvent handled. Welcome, ${user.name.value}! (${user.email.value})`
    );
  }
}
