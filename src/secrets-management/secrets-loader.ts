import * as fs from 'fs';
import * as path from 'path';
import * as jsyaml from 'js-yaml';
import { deepMerge } from '../utils/index.ts';

export function loadSecrets(dir?: string): Record<string, unknown> {
  let result = {} as Record<string, unknown>;

  if (!dir || !fs.existsSync(dir)) {
    return JSON.parse(JSON.stringify(process.env)) as Record<string, unknown>;
  }

  fs.readdirSync(dir)
    .forEach((item): void => {
      if (fs.lstatSync(path.join(dir, item)).isFile()) {
        const lastSeparatorIndex = item.lastIndexOf('.');
        const fileName = lastSeparatorIndex > 0 ? item.slice(0, lastSeparatorIndex) : item;
        // NOTE: negative subtraction on purpose to force slice to start from the end
        const extension = lastSeparatorIndex > 0 ? item.slice(lastSeparatorIndex - item.length) : '';

        const fileContents = fs.readFileSync(path.resolve(dir, item), 'utf8');

        if (extension.match(/^\.yml$/i)) {
          result = deepMerge(result, jsyaml.load(fileContents)) as Record<string, unknown>;
          return;
        }

        result[fileName] = fileContents.trim();
      }

      // - if item is not a file nor a directory, do nothing
    });

  Object.assign(result, process.env);
  return result;
}
