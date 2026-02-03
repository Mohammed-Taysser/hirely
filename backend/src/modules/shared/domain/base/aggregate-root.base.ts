import { IDomainEvent } from '../events/domain-event.interface';
import { DomainEvents } from '../events/domain-events';

import { Entity } from './entity.base';

/**
 * An Aggregate Root is an Entity that serves as the entry point
 * to an Aggregate. It ensures the consistency of changes
 * within the aggregate boundary.
 */
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: IDomainEvent[] = []; // Placeholder for domain events logic

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(domainEvent: IDomainEvent): void {
    // Add the event to this aggregate's list of domain events
    this._domainEvents.push(domainEvent);
    // Add this aggregate instance to the DomainEvents' list of aggregates who have
    // events to notify subscribers about.
    DomainEvents.markAggregateForDispatch(this);
    // Log the event for debugging purposes
    console.log(`[Domain Event Created]:`, domainEvent.constructor.name);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }
}
