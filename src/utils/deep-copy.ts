export function deepCopy<T>(input: T): T {
  if (input === undefined) {
    // NOTE: TypeScript will infer that `T` is of type  `undefined`
    //    if `input === undefined`, so the typecast is safe
    return undefined as T;
  }

  if (input instanceof Function) {
    throw SyntaxError('Can\'t copy a function');
  }

  return JSON.parse(JSON.stringify(input)) as T;
}
