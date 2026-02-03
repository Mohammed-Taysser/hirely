import { User } from '../user.aggregate';

import { IDomainEvent } from '@/modules/shared/domain/events/domain-event.interface';

export class UserCreatedEvent implements IDomainEvent {
  public dateTimeOccurred: Date;
  public user: User;

  constructor(user: User) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }

  getAggregateId(): string {
    return this.user.id;
  }
}
