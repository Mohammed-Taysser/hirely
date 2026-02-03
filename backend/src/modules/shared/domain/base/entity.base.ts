import { randomUUID } from 'node:crypto';

/**
 * An Entity is an object that has a unique identifier that persists
 * across different states of the system.
 */
export abstract class Entity<T> {
  protected readonly _id: string;
  protected readonly props: T;

  constructor(props: T, id?: string) {
    this._id = id || randomUUID();
    this.props = props;
  }

  get id(): string {
    return this._id;
  }

  /**
   * Entities are compared by their ID, not their properties.
   */
  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return this._id === object._id;
  }
}
