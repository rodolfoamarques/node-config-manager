import { replaceStringValue } from '../utils/index.ts';

export function populateSecrets(
  input: Record<string, unknown>,
  secrets: Record<string, unknown>,
): Record<string, unknown> {
  // - NOTE: only attempt to replace values in input if it is a non-null object
  if (input !== null && typeof input === 'object') {
    Object.entries(input).forEach(([key, value]): void => {
      // - NOTE: if the value is not a string, valid object or array
      if (value === null || (!Array.isArray(value) && !['string', 'object'].includes(typeof value))) {
        return;
      }

      // - NOTE: if the value is an array
      if (Array.isArray(value)) {
        // - NOTE: recursively populate secrets for each element of all array sub properties
        input[key] = value.map((item: unknown) => {
          if (item === null || item === undefined) {
            return undefined;
          }

          if (typeof item === 'object') {
            return populateSecrets(item as Record<string, unknown>, secrets);
          }

          if (typeof item === 'string') {
            return replaceStringValue(item, secrets);
          }

          return item;
        });
        return;
      }

      // - NOTE: if the value is an object (already checked for non-null and array, so this condition can be simple)
      if (typeof value === 'object') {
        // - NOTE: recursively populate secrets for all object sub properties
        input[key] = populateSecrets(value as Record<string, unknown>, secrets);
        return;
      }

      // - NOTE: if the value is a string
      if (typeof value === 'string') {
        input[key] = replaceStringValue(value, secrets);
        return;
      }
    });
  }

  return input;
}
