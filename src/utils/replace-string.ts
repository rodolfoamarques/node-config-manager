/**
 * Resolves a value from an object using a property path, supporting dot notation
 * (e.g. `a.b.c`) and bracket notation (e.g. `a[0].b`).
 *
 * This is a dependency-free replacement for `lodash.get` covering the behaviour
 * relied upon here, including the shortcut where the path is an exact own/inherited
 * key of the object (which allows keys containing dots, brackets or other special
 * characters to be retrieved directly).
 */
function getValueByPath(object: Record<string, unknown>, path: string): unknown {
  // Shortcut: if the path is a direct key of the object, use it as-is.
  if (object != null && path in Object(object)) {
    return object[path];
  }

  const rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]/g;
  const segments: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = rePropName.exec(path)) !== null) {
    if (match[1] !== undefined) {
      segments.push(match[1]); // numeric index inside brackets
    } else if (match[3] !== undefined) {
      segments.push(match[3].replace(/\\(\\)?/g, '$1')); // quoted key inside brackets
    } else {
      segments.push(match[0]); // plain property name
    }
  }

  let current: unknown = object;

  for (const segment of segments) {
    if (current === undefined || current === null) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function replaceStringValue(value: string, secrets: Record<string, unknown>): string {
  return value.replace(/\${ *([^{} ]+) *}/g, (_value: string, captureGroup: string): string => {
    const secretValue = getValueByPath(secrets, captureGroup);

    if (secretValue === undefined || secretValue === null) {
      throw new Error(`the value of secret "${captureGroup}" is undefined`);
    }

    return typeof secretValue === 'object' ? JSON.stringify(secretValue) : secretValue as string;
  });
}
