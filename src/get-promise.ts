export type Promiser<T> = {
  promise: Promise<T>,
  resolve: (t: T) => any,
  reject: (t: any) => any
};

export function getPromise<T>(): Promiser<T> {
  let resolve, reject;
  const promise = new Promise<T>((r, rr) => (resolve = r) && (reject = rr))
  return {promise, resolve, reject}
}

