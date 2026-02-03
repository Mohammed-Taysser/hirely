import { IDomainEvent } from './domain-event.interface';

export interface IHandle<T extends IDomainEvent> {
  setupSubscriptions(): void;
  handle(event: T): Promise<void>;
}
