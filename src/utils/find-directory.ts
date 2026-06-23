import fs from 'node:fs';
import path from 'node:path';

export function getConfigDirAbsolutePath(configDirectoryName: string): string {
  const slices = process.cwd().split('/');

  while (slices.length > 1) {
    const dir = slices.join('/');
    const dirContents = fs.readdirSync(dir);

    if (dirContents.includes(configDirectoryName)) {
      return path.join(dir, configDirectoryName);
    }

    slices.pop();
  }

  throw new Error(
    'YAML configuration directory cannot be found. ' +
    `Make sure "${configDirectoryName}" folder exists in the root directory of your project.`
  );
}

export function getSecretsDirAbsolutePath(secretsDirectoryName: string): string | undefined {
  const slices = process.cwd().split('/');

  while (slices.length > 1) {
    const dir = slices.join('/');
    const dirContents = fs.readdirSync(dir);

    if (dirContents.includes(secretsDirectoryName)) {
      return path.join(dir, secretsDirectoryName);
    }

    slices.pop();
  }

  // eslint-disable-next-line no-console
  console.warn('YAML secrets directory cannot be found.');
  return;
}
