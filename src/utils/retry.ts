interface RetryOptions {
  minMs: number;
  maxMs: number;
}

export function retryExponential({ minMs, maxMs }: RetryOptions) {
  return function (retryCount: number) {
    const ms = Math.min(
      Math.round(Math.random() * Math.pow(2, retryCount) * minMs),
      maxMs,
    );

    return ms;
  };
}