# node-config-manager

A tool to manage configuration files and secrets.


### Main module usage

- Import the module in your project;
- Add a directory at root level for your configuration files (named `config` by default);
- Add a YAML file inside the configuration directory with your application configuration (named `default.yml` by default);
- _(optional)_ Add a directory at root level for your secrets files (named `secrets` by default);
- _(optional)_ Add a YAML file inside the configuration directory with your application secrets;
- _(required if you have a secrets directory, optional otherwise)_ update your `.gitignore` file to ignore the entirety of your secrets directory
- _(optional)_ update your `.gitignore` file to ignore any local dev environment, if you have one
- update your entrypoint file to `import { initConfig, Joi } from 'node-config-manager`;
- update your entrypoint file and add a Joi validation schema that corresponds to your configuration schema;
- _(optional)_ update your entrypoint file and add a type that corresponds to your configuration schema;
- update your entrypoint file to call `const appConfig = initConfig<ConfigType>(validationRules);`;

That's it. You now have your configuration imported and validated (and optionally typed if working with TypeScript).

##### Full Example usage

```yml
# config/default.yml

api:
  port: 7020
  
authorization:
  secret: ${ AUTH_SECRET }
```

```yml
# secrets/secrets.yml

AUTH_SECRET: mysecret
```

```typescript
import { initConfig, Joi } from 'node-config-manager';

type ConfigSchema = {
  api: { port: number; };
  authorization: { secret: string; };
};

const validationRules = Joi.object({
  api: { port: Joi.number() },
  authorization: { secret: Joi.string() },
});

const config: ConfigSchema = initConfig<ConfigSchema>(validationRules);

console.log(config.api.port); // - 7020
console.log(config.authorization.secret) // - mysecret
```


### Configuration loading

The purpose of a configuration file is to create a container of values that your application
cannot live without, but that may change for each of the deployment environments. Normally,
these values are key to the good functioning of your application but do not contain highly
sensitive information. Hence, these files can be safely kept in your VCS to be easily shared
between team members and to enable and facilitate testing in different environments.

Examples of configuration key/value pairs include:

- `port: 1234`, the port where an API is listening for incoming requests
- `third_party_base_url: "https://third-party.service.com""`, the base DNS of a third-party service your application needs to interact with
- etc.

This module attempts to read configuration files from `./config` folder by default.

> NOTE: _You can override the default directory in the `initConfig` function._

This module uses the `process.env['CONFIG']` environment variable's value to determine the name of the
config entrypoint file. If it is not set, the module will attempt to use the `./config/default.yml`
file by default. If you wish to use a different filename as the entrypoint, you can set this variable
either in the scripts that execute your application or directly in your source code.

> NOTE: _You can override the environment variable to be used in the `initConfig` function._

##### Example usage

To override config directories and environment variable (all optional):

```typescript
// - setting the process env will indicate to the module that
//    'custom-entrypoint-config-file.yml' is the file to be imported for config loading
process.env['alternate-environment-variable-name'] = 'custom-entrypoint-config-file.yml';

const config: ConfigSchema = initConfig<ConfigSchema>(
  validationRules,
// - setting the optional second parameter will indicate to the module that 
//    config files are located in the 'alternate-config-folder-name' directory
  'alternate-config-folder-name',
  undefined,
// - setting the optional fourth parameter will indicate to the module that
//    the environment variable that contains the entrypoint config filename
//    is 'alternate-environment-variable-name' as previously set
  'alternate-environment-variable-name',
);
```


### Configuration Extension

Subdirectories of the root configuration directory are currently ignored.

It is possible to extend an existing configuration file, overriding and/or adding any properties.
This can be done by using a `@extends filename.yml` statement anywhere in the config file.

> NOTE: _It is recommended that the extends expression is placed as the first line of the config file for readability._

Chains of extensions are fully supported, even if files are in different directories.
In case of extension of files in other directories, both relative and absolute paths are supported.
Multiple extensions in the same file are also supported. 

> NOTE: _Be aware that when extending multiple files, order is important._

##### Example usage

```yml 
# config/default.yml

api:
  port: 7020

googleUrl: 'https://google.com'
```

```yml 
# config/base.yml

authUrl: 'http://localhost:8080/auth'

paymentsTimeout: 5000
```

```yml 
# config/extension_1.yml
@extends: base.yml

api:
  port: 3999

googleUrl:
```

```yml 
# config/extension_2.yml
@extends: extension_1.yml

authUrl: 'https://auth-service.com'
 
@extends: default.yml 
```

```typescript
import { initConfig } from 'node-config-manager';

process.env['CONFIG'] = 'extension_2.yml';

const config = initConfig(validationRules);

// since `extension_2.yml` extends `extension_1.yml` which in turn extends `base.yml`, the latter is the first to be loaded
// `base.yml` is the only one that sets "paymentsTimeout", so the key is added and the value is never overwritten
console.log(config.paymentsTimeout); // '5000'

// `extension_1.yml` was the second to be loaded and `default.yml` the third
// since `extension_2.yml` also extends `default.yml` but after extending `extension_1.yml`, `default.yml` is the third to be loaded
// `extension_1.yml` is loaded second, setting "api" to `{port: 3999}`.
// it also sets "api.port", overriding its value
console.log(config.api.port); // 7020

// same applies for the "googleUrl" being added by `base.yml` and set to "undefined"
// and then replaced by the value loaded from `default.yml`
console.log(config.googleUrl); // 'https://google.com'

// being the second to be loaded, `base.yml` adds the "authUrl" and sets it to "http://localhost:8080/auth"
// since `extends_2.yml` is the fourth and last to be loaded, it overwrites the value of this property
console.log(config.authUrl); // 'https://auth-service.com'
```

Module is using [deepmerge-ts]()'s `deepmerge` function to compute the final configuration object.


### Secrets loading

The purpose of a secrets file is to create a container of values similar to configuration values
in principle, but that contain highly sensitive information. Hence, they should never be added
to your VCS and should only be shared via secure channels or platforms.

Examples of configuration key/value pairs include:

- `api_token: "super-secret-token"`, the token used in the `Authorization` header of your API
- `username: "john-doe"` and ` password: admin123`, the credentials of your user to your system
- etc.

This module attempts to read secrets files from `./secrets` folder by default.

> NOTE: _You can override this directory name in the `initConfig` function._

##### Example usage

To override config/secret directories and CONFIG environment variable (all optional):

```typescript
const config: ConfigSchema = initConfig<ConfigSchema>(
  validationRules,
  undefined,
// - setting the optional third parameter will indicate to the module that 
//    secrets files are located in the 'alternate-secrets-folder-name' directory
  'alternate-secrets-folder-name',
  undefined,
);
```

##### Secrets file management

Subdirectories of the root secrets directory are currently ignored.

All files in the root secrets directory that have a `.yml` file extension,
have their contents parsed into a key/pair object. I.E.:

```yaml
# secrets/secrets.yml

AUTH_SECRET: some-secret
PASSWORD: strongpassword
```

```typescript
import { initConfig } from 'node-config-manager';

const config = initConfig(validationRules);

console.log(nonExposedInternalSecretsVariable['AUTH_SECRET']); // "some-secret"
console.log(nonExposedInternalSecretsVariable['PASSWORD']); // "strongpassword"
```

For all other files with any other file extensions, the name of the file becomes the name of
the environment variable and the full contents of the file are assigned as the value. I.E.:

```shell
// secrets/fake-rsa-private.key
-----BEGIN RSA PRIVATE KEY-----
MIIEyDCCA7CgAwIBAgIJAK7EOOdlwxT/MA0GCSqGSIb3DQEBCwUAMIGjMRswCQYD
vx18ciuIZH/We0sXcjLxCSpgpz4+PCcWJYXnzvE7FgZcpoNwAREDdRqRZp/+1Kbq
kDNG1bPK0OeicSOVPmzc3z3BYJbsgjel2QQjGg==
-----END RSA PRIVATE KEY-----
```

```typescript
import { initConfig } from 'node-config-manager';

const config = initConfig(validationRules);

console.log(nonExposedInternalSecretsVariable['fake-rsa-private.key']);
// "-----BEGIN RSA PRIVATE KEY-----\nMIIEyDCCA7 ... 3BYJbsgjel2QQjGg==\n-----END RSA PRIVATE KEY-----"
```

> NOTE: _If the filename has no file extension (i.e. `./secrets/i-am-a-secrets-file`), it is treated as a non-YAML file.

> NOTE:
>  _If the filename ends with a `.` character, it is treated as a non-YAML file
>  and the last dot is excluded from the generated environment variable. I.E.:_
>    - _file:_ `./secrets/secrets...`
>    - _generated environment variable:_ `process.env['secrets..']`

Secrets can also be loaded from the `process.env` global variable regardless of existence of a secrets directory
and/or secrets files. If you want to load some or all of your secrets via this variable, simply populate it in
your script commands, i.e.:

```shell
$ SECRET_TOKEN="super-secret-token" API_PASSWORD="very-lenghty-password" yarn start
```

It is, for obvious reasons, highly recommended that you do not commit these commands to your VCS. Use this approach
mainly when manually forcing certain variables to specific values or in your CI pipelines or deployment processes
when you can leverage on other secret storage mechanisms.

> NOTE: _Secrets that are set via `process.env` take precedence over ones with the same key set in secrets files._ 

##### Populating env variables/secrets into configuration file

The recommended usage of secret variable references is one of: `${ SECRET_A }` or `${SECRET_B}`.
The reason is purely aesthetical and non-technical, these two forms simply promote better readability.

However, the following rules apply:
 - all special characters are supported, except ` `, `{` and `}`;
   - `${ A-c.o<n!f?u_s)i(n\g|SECRET }` is valid
   - `${ SEC RET_A }` is invalid - will interpret the value literally as a string and not as a secret
   - `${ SEC{RET_A }` is invalid - will interpret the value literally as a string and not as a secret
   - `${ SEC{R}ET_A }` is invalid - will interpret the value literally as a string and not as a secret
   - `${ SEC}RET_A }` is valid - will interpret `${ SEC}` as a secret and replace it, appending `RET_A }` as a literal string
 - multiple spaces after `{` and before `}` are supported and ignored
   - `${     SECRET_B    }` is equivalent to `${SECRET_B}`
 - multiple brackets are not supported and the value will be interpreted literally
   - `secret: ${{SECRET_A}}` is invalid - will interpret the value literally as a string and not as a secret
 - multiple leading `$` are not supported
   - `secret: $$$${SECRET_A}` is valid - will interpret the first three `$` literally as a string and attempt to replace `${SECRET_A}`
     (i.e. if `SECRET_A` is defined as `"super-strong-password"`, the result will be `secret: "$$$super-strong-password"`)
