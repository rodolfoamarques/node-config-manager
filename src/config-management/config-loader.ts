import * as fs from 'fs';
import * as path from 'path';
import * as jsyaml from 'js-yaml';
import { deepMerge } from '../utils/index.ts';

export function loadConfig<T>(dir: string, filename: string): T {
  const extension = filename.substring(filename.length - 4);
  if (extension !== '.yml') {
    throw new Error('can only load configuration from YAML files');
  }

  const filePath = path.resolve(dir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`path ${filePath} does not exist.`);
  }

  let result = {} as T;
  const fileContents = fs.readFileSync(filePath, 'utf8')
    .replace(/@extends: *([^\n ]+)/ig, (_a, parentFilename: string) => {
      const parentConfig = loadConfig(dir, parentFilename.trim());
      result = deepMerge(result, parentConfig) as T;

      return '';
    });

  return deepMerge(result, jsyaml.load(fileContents)) as T;
}
