import { deepmergeCustom } from 'deepmerge-ts';

export function isObject(input: unknown): input is object {
  return input !== null && Object.prototype.toString.call(input) !== '[object Date]' && typeof input === 'object';
}

export function deepMerge(input: unknown, override: unknown): unknown {
  if (!isObject(input) && !isObject(override)) {
    throw new Error('there is nothing to merge');
  }

  const mergeFunction = deepmergeCustom({ filterValues: false });

  if (isObject(input) && !isObject(override)) {
    return mergeFunction(override, input);
  }

  return mergeFunction(input, override);
}
