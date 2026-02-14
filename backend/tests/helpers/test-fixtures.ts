const AUTH_CREDENTIAL = 'auth-credential-value-2026';
const SHORT_CREDENTIAL = 'short';

const successResult = <T>(value: T) => ({
  isFailure: false,
  isSuccess: true,
  error: null,
  getValue: () => value,
});

const failureResult = (error: unknown) => ({
  isFailure: true,
  isSuccess: false,
  error,
  getValue: () => {
    throw new Error('Cannot get value from failure result');
  },
});

export { AUTH_CREDENTIAL, SHORT_CREDENTIAL, failureResult, successResult };
