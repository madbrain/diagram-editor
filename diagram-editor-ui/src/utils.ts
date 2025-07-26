export interface Defer<T> {
  resolve: (value: T) => void;
  reject: () => void;
  promise: Promise<T>;
}

export function defer<T>(): Defer<T> {
  const deferred = {} as Defer<T>;
  const promise = new Promise<T>((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  deferred.promise = promise;
  return deferred;
}

export function makeMap<T>(
  l: Array<T>,
  idGetter: (value: T) => string
): { [key: string]: T } {
  const result: Record<string, T> = {};
  l.forEach((e) => {
    result[idGetter(e)] = e;
  });
  return result;
}
