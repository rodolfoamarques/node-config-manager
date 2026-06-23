import { expect } from 'chai';
import Joi from 'joi';
import * as jsyaml from 'js-yaml';
import { afterEach, beforeEach, describe, it } from 'mocha';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sinon from 'sinon';
import { initConfig } from '../src/main.ts';

describe('Config Manager - initConfig()', (): void => {

  // @ts-expect-error TS complains because IDE reads tsconfig.json and not tsconfig.dev.json
  const __dirname: string = import.meta.dirname;
  let logSpy: sinon.SinonStub;

  const defaultConfigDirectoryPath: string = join(__dirname, '../config');
  const alternateConfigDirectoryPath: string = join(__dirname, '../alternate-config');
  const defaultSecretsDirectoryPath: string = join(__dirname, '../secrets');
  const alternateSecretsDirectoryPath: string = join(__dirname, '../alternate-secrets');

  afterEach((): void => {
    rmSync(defaultConfigDirectoryPath, { force: true, recursive: true });
    rmSync(alternateConfigDirectoryPath, { force: true, recursive: true });
    rmSync(defaultSecretsDirectoryPath, { force: true, recursive: true });
    rmSync(alternateSecretsDirectoryPath, { force: true, recursive: true });

    sinon.restore();
  });

  describe('Success scenarios', (): void => {

    beforeEach((): void => {
      logSpy = sinon.stub(console, 'warn').callsFake((): void => { /* do nothing to avoid polluting console */ });
    });

    it('should correctly load and validate config when using default values', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });
      writeFileSync(join(defaultSecretsDirectoryPath, 'secrets.yml'), jsyaml.dump({ PASSWORD: 'one' }));

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      const result = initConfig(Joi.object());

      expect(result).to.eql({ settings: 'one' });
    });

    it('should correctly load and validate config when using custom config directory', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });
      writeFileSync(join(defaultSecretsDirectoryPath, 'secrets.yml'), jsyaml.dump({ PASSWORD: 'one' }));

      mkdirSync(alternateConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(alternateConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      const result = initConfig(Joi.object(), 'alternate-config');

      expect(result).to.eql({ settings: 'one' });
    });

    it('should correctly load and validate config when using custom secrets directory', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(alternateSecretsDirectoryPath, { recursive: true });
      writeFileSync(
        join(alternateSecretsDirectoryPath, 'secrets.yml'),
        jsyaml.dump({ PASSWORD: 'one' }),
      );

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      const result = initConfig(Joi.object(), undefined, 'alternate-secrets');

      expect(result).to.eql({ settings: 'one' });
    });

    it('should correctly load and validate config when using custom config file entrypoint', (): void => {
      process.env['CONFIG'] = 'local';
      process.env['RANDOM-VARIABLE'] = 'default';

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });
      writeFileSync(join(defaultSecretsDirectoryPath, 'secrets.yml'), jsyaml.dump({ PASSWORD: 'one' }));

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ variable: 'i should not have been loaded' }),
      );
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['RANDOM-VARIABLE']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      const result = initConfig(Joi.object(), undefined, undefined, 'RANDOM-VARIABLE');

      expect(result).to.eql({ settings: 'one' });
    });

    it('should correctly load and validate config when secrets directory is not found', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: 'one' }),
      );

      const result = initConfig(Joi.object());

      expect(result).to.eql({ settings: 'one' });
      sinon.assert.calledOnceWithExactly(logSpy, 'YAML secrets directory cannot be found.');
    });

  });

  describe('Error scenarios', (): void => {

    beforeEach((): void => {
      logSpy = sinon.stub(console, 'warn').callsFake((): void => { /* do nothing to avoid polluting console */ });
    });

    it('should throw when config directory is not found', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(alternateConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(alternateConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: 'hello there' }),
      );

      try {
        initConfig(Joi.object());
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty(
          'message',
          'YAML configuration directory cannot be found. ' +
          'Make sure "config" folder exists in the root directory of your project.',
        );
      }
    });

    it('should throw when config file is not found', (): void => {
      process.env['CONFIG'] = 'local';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, 'default.yml'),
        jsyaml.dump({ settings: 'hello there' }),
      );

      try {
        initConfig(Joi.object());
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty(
          'message',
          `path ${join(defaultConfigDirectoryPath, 'local.yml')} does not exist.`,
        );
      }
    });

    it('should throw when secret referenced in config file is not found (secrets directory not found)', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      try {
        initConfig(Joi.object());
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('message', 'the value of secret "PASSWORD" is undefined');

        sinon.assert.calledOnceWithExactly(logSpy, 'YAML secrets directory cannot be found.');
      }
    });

    it('should throw when secret referenced in config file is not found due to empty secrets directory', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });

      try {
        initConfig(Joi.object());
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('message', 'the value of secret "PASSWORD" is undefined');
      }
    });

    it('should throw when secret in config file is not found (non-defined key in secrets file)', (): void => {
      process.env['CONFIG'] = 'default';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultSecretsDirectoryPath, 'secrets.yml'),
        jsyaml.dump({ NOT_PASSWORD: 'super-secret-password' }),
      );

      try {
        initConfig(Joi.object());
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('message', 'the value of secret "PASSWORD" is undefined');
      }
    });

    it('should throw when config validation fails', (): void => {
      process.env['CONFIG'] = 'local';

      mkdirSync(defaultConfigDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultConfigDirectoryPath, `${process.env['CONFIG']}.yml`),
        jsyaml.dump({ settings: '${PASSWORD}' }),
      );

      mkdirSync(defaultSecretsDirectoryPath, { recursive: true });
      writeFileSync(
        join(defaultSecretsDirectoryPath, 'secrets.yml'),
        jsyaml.dump({ PASSWORD: 'super-secret-password' }),
      );

      try {
        initConfig(Joi.object({ a: Joi.number() }));
        expect.fail('call to "initConfig()" should have thrown an error');
      } catch (error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('message', '"a" is required');
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
      }
    });

  });

});
