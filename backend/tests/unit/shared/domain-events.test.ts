// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AggregateRoot } = require('@dist/modules/shared/domain/base/aggregate-root.base');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { DomainEvents } = require('@dist/modules/shared/domain/events/domain-events');

class DummyAggregate extends AggregateRoot {
  constructor(label: string, id?: string) {
    super({ label }, id);
  }

  public addEvent(event: unknown): void {
    this.addDomainEvent(event as never);
  }
}

class DummyEvent {
  public dateTimeOccurred: Date;

  constructor(private readonly aggregateId: string) {
    this.dateTimeOccurred = new Date();
  }

  public getAggregateId(): string {
    return this.aggregateId;
  }
}

describe('DomainEvents', () => {
  beforeEach(() => {
    DomainEvents.clearHandlers();
    DomainEvents.clearMarkedAggregates();
    DomainEvents.setErrorHandler(undefined);
  });

  it('dispatches events for marked aggregate and clears them', async () => {
    const aggregate = new DummyAggregate('a', 'agg-1');
    const handler = jest.fn(async () => undefined);

    DomainEvents.register(handler, 'DummyEvent');

    aggregate.addEvent(new DummyEvent(aggregate.id));
    aggregate.addEvent(new DummyEvent(aggregate.id));

    await DomainEvents.dispatchEventsForAggregate(aggregate.id);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(aggregate.domainEvents).toHaveLength(0);

    await DomainEvents.dispatchEventsForAggregate(aggregate.id);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('invokes error handler when event handler throws', async () => {
    const aggregate = new DummyAggregate('a', 'agg-2');
    const onError = jest.fn(async () => undefined);

    DomainEvents.register(
      async () => {
        throw new Error('handler failed');
      },
      'DummyEvent'
    );
    DomainEvents.setErrorHandler(onError);

    aggregate.addEvent(new DummyEvent(aggregate.id));
    await DomainEvents.dispatchEventsForAggregate(aggregate.id);

    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('does not throw when handler fails and no error handler is registered', async () => {
    const aggregate = new DummyAggregate('a', 'agg-3');

    DomainEvents.register(
      async () => {
        throw new Error('handler failed');
      },
      'DummyEvent'
    );

    aggregate.addEvent(new DummyEvent(aggregate.id));

    await expect(DomainEvents.dispatchEventsForAggregate(aggregate.id)).resolves.toBeUndefined();
    expect(aggregate.domainEvents).toHaveLength(0);
  });

  it('marks aggregate only once even when multiple events are added', async () => {
    const aggregate = new DummyAggregate('a', 'agg-4');
    const handler = jest.fn(async () => undefined);

    DomainEvents.register(handler, 'DummyEvent');

    aggregate.addEvent(new DummyEvent(aggregate.id));
    aggregate.addEvent(new DummyEvent(aggregate.id));
    aggregate.addEvent(new DummyEvent(aggregate.id));

    await DomainEvents.dispatchEventsForAggregate(aggregate.id);
    expect(handler).toHaveBeenCalledTimes(3);

    await DomainEvents.dispatchEventsForAggregate(aggregate.id);
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('dispatches event with no registered handlers without failing', async () => {
    const event = new DummyEvent('agg-no-handler');

    await expect(
      (DomainEvents as unknown as { dispatch: (evt: DummyEvent) => Promise<void> }).dispatch(event)
    ).resolves.toBeUndefined();
  });

  it('removing non-marked aggregate is a no-op', () => {
    const aggregate = new DummyAggregate('a', 'agg-unknown');

    expect(() =>
      (
        DomainEvents as unknown as {
          removeAggregateFromMarkedList: (agg: DummyAggregate) => void;
        }
      ).removeAggregateFromMarkedList(aggregate)
    ).not.toThrow();
  });
});
