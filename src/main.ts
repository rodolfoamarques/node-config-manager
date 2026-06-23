import * as Joi from 'joi';
import { loadConfig } from './config-management/index.ts';
import { loadSecrets, populateSecrets } from './secrets-management/index.ts';
import { deepCopy, getConfigDirAbsolutePath, getSecretsDirAbsolutePath, validateWrapper } from './utils/index.ts';

export function initConfig<T>(
  rules: Joi.Schema,
  configDirName = 'config',
  secretsDirName = 'secrets',
  configEnvVariable = 'CONFIG',
): T {
  const config = loadConfig(
    getConfigDirAbsolutePath(configDirName),
    `${process.env[configEnvVariable] ?? 'default'}.yml`,
  );

  const secrets = loadSecrets(getSecretsDirAbsolutePath(secretsDirName));

  const populatedConfig = populateSecrets(deepCopy(config) as Record<string, unknown>, secrets);
  return validateWrapper<T>(populatedConfig as T, rules);
}
