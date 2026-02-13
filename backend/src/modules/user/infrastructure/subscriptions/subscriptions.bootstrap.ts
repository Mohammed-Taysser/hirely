import { AfterUserCreated } from './after-user-created';

export const registerUserSubscriptions = (): void => {
  const afterUserCreatedHandler = new AfterUserCreated();
  afterUserCreatedHandler.setupSubscriptions();
};
