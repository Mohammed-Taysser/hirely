import { AggregateRoot } from '../base/aggregate-root.base';

import { IDomainEvent } from './domain-event.interface';
export class DomainEvents {
  private static handlersMap: Map<string, ((event: IDomainEvent) => Promise<void>)[]> = new Map();
  private static markedAggregates: AggregateRoot<unknown>[] = [];

  /**
   * Called by the Aggregate Root to signal that it has events ready to be published.
   */
  public static markAggregateForDispatch(aggregate: AggregateRoot<unknown>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  /**
   * Called by the Repository (or Application Service) to dispatch events
   * for a specific aggregate after a successful transaction/save.
   */
  public static async dispatchEventsForAggregate(id: string): Promise<void> {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      const events = aggregate.domainEvents;

      for (const event of events) {
        await this.dispatch(event);
      }

      aggregate.clearEvents();
      this.removeAggregateFromMarkedList(aggregate);
    }
  }

  /**
   * Register a handler for a specific domain event.
   */
  public static register(
    callback: (event: IDomainEvent) => Promise<void>,
    eventClassName: string
  ): void {
    const handlers = this.handlersMap.get(eventClassName) || [];
    handlers.push(callback);
    this.handlersMap.set(eventClassName, handlers);
  }

  /**
   * Clears all handlers (useful for testing).
   */
  public static clearHandlers(): void {
    this.handlersMap.clear();
  }

  /**
   * Clears marked aggregates (useful for testing).
   */
  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  private static findMarkedAggregateByID(id: string): AggregateRoot<unknown> | null {
    return this.markedAggregates.find((a) => a.id === id) || null;
  }

  private static removeAggregateFromMarkedList(aggregate: AggregateRoot<unknown>): void {
    const index = this.markedAggregates.findIndex((a) => a.equals(aggregate));
    if (index !== -1) {
      this.markedAggregates.splice(index, 1);
    }
  }

  private static async dispatch(event: IDomainEvent): Promise<void> {
    const eventClassName = event.constructor.name;
    const handlers = this.handlersMap.get(eventClassName) || [];

    for (const handler of handlers) {
      // We don't await handlers to block the main flow?
      // Usually, domain events in Node can be async but `await` ensures consistency within the same process.
      // However, if we want them decoupled, we might not await.
      // For now, let's await to catch errors easier in this monolith phase.
      try {
        await handler(event);
      } catch (err) {
        console.error(`[DomainEvents]: Error handling ${eventClassName}`, err);
      }
    }
  }
}
