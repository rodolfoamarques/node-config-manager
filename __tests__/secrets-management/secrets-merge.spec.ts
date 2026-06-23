import { expect } from 'chai';
import esmock from 'esmock';
import { afterEach, beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { replaceStringValue } from '../../src/utils/replace-string.ts';

describe('Secrets Management - populateSecrets()', (): void => {

  let populateSecrets: typeof import('../../src/secrets-management/secrets-merge.ts').populateSecrets;
  let replaceStringValueStub: sinon.SinonStub;

  const secrets = {
    SECRET_A: 'secret_a',
    SECRET_B: 'secret_b',
    SECRET_C: 'secret_c',
    SECRET_D: 'secret_d',
    SECRET_E: 'secret_e',
    SECRET_F: 'secret_f',
    SECRET_G: 'secret_g',
    SECRET_H: 'secret_h',
  };

  beforeEach(async (): Promise<void> => {
    replaceStringValueStub = sinon.stub().callsFake(
      (value: string, secrets: Record<string, unknown>): string => {
        console.log('2kjwebckwjebckwjbecwkbje');
        return replaceStringValue(value, secrets);
      },
    );

    const mergeModulePath: string = new URL('../../src/secrets-management/secrets-merge.ts', import.meta.url).pathname;
    const replaceStringModulePath: string = new URL('../../src/utils/index.ts', import.meta.url).pathname;

    const module = await esmock(mergeModulePath, import.meta.url, {
      [replaceStringModulePath]: { replaceStringValue: replaceStringValueStub },
    });

    populateSecrets = module.populateSecrets as typeof populateSecrets;
  });

  afterEach((): void => {
    esmock.purge(populateSecrets);
    sinon.restore();
  });

  describe('basic data types', (): void => {

    it('should do nothing when input is an "undefined"', (): void => {
      const result = populateSecrets(undefined as unknown as Record<string, unknown>, secrets);

      expect(result).to.equal(undefined);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "null"', (): void => {
      const result = populateSecrets(null as unknown as Record<string, unknown>, secrets);

      expect(result).to.equal(null);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "number"', (): void => {
      const result = populateSecrets(123 as unknown as Record<string, unknown>, {});

      expect(result).to.equal(123);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "boolean"', (): void => {
      const result = populateSecrets(true as unknown as Record<string, unknown>, {});

      expect(result).to.equal(true);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "string"', (): void => {
      const result = populateSecrets('test-input' as unknown as Record<string, unknown>, {});

      expect(result).to.equal('test-input');
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

  });

  describe('Objects', (): void => {

    it('should do nothing for empty object', (): void => {
      const input = {};

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are null', (): void => {
      const input = { a: null, b: null };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are numbers', (): void => {
      const input = { a: 123, b: 321 };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are booleans', (): void => {
      const input = { a: true, b: false };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are undefined', (): void => {
      const input = { a: undefined, b: undefined };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should attempt to replace when sub-properties are strings', (): void => {
      const input = { a: 'hi', b: 'hello' };

      const result = populateSecrets(input, secrets);

      // - NOTE: stub delegates to the real implementation, so values without interpolation tokens pass through unchanged
      expect(result).to.eql(input);

      // - NOTE: replaceStringValue is called once per string-valued property
      sinon.assert.callCount(replaceStringValueStub, 2);
      // - NOTE: verify the stub was called with the correct arguments for each key
      sinon.assert.calledWith(replaceStringValueStub, 'hi', secrets);
      sinon.assert.calledWith(replaceStringValueStub, 'hello', secrets);
    });

  });

  describe('Arrays', (): void => {

    it('should do nothing for empty array', (): void => {
      const result = populateSecrets([] as unknown as Record<string, unknown>, {});

      expect(result).to.eql([]);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of null', (): void => {
      const input = [null, null, null] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of numbers', (): void => {
      const input = [1, 2, 3, 4, 5] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of booleans', (): void => {
      const input = [true, false] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of undefined', (): void => {
      const input = [undefined] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should try to populate secrets (array) - array of strings', (): void => {
      const input = ['hello', 'there', 'general kenobi'] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      // - NOTE: stub delegates to real impl; no tokens → values unchanged
      expect(result).to.eql(input);

      // - NOTE: replaceStringValue is called once per string element
      sinon.assert.callCount(replaceStringValueStub, 3);
      // - NOTE: verify each string element was forwarded to the stub with the secrets map
      sinon.assert.calledWith(replaceStringValueStub, 'hello', secrets);
      sinon.assert.calledWith(replaceStringValueStub, 'there', secrets);
      sinon.assert.calledWith(replaceStringValueStub, 'general kenobi', secrets);
    });

  });

  describe('recursiveness', (): void => {

    it('should recursively populate secrets where applicable - array input', (): void => {
      const input = [123, '${SECRET_A}', true, null, [], undefined, {}] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql([ 123, 'secret_a', true, null, [], undefined, {} ]);

      // - NOTE: Only the one string element triggers a replaceStringValue call
      sinon.assert.callCount(replaceStringValueStub, 1);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_A}', secrets);
    });

    it('should recursively populate secrets where applicable - object input', (): void => {
      const input: Record<string, unknown> = {
        a: '${SECRET_A}',
        b: {
          c: '${SECRET_B}',
          d: {
            e: '${SECRET_C}',
          },
        },
        f: ['${SECRET_D}', '${SECRET_E}'],
        g: 42,
        h: null,
      };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql({
        a: 'secret_a',
        b: {
          c: 'secret_b',
          d: {
            e: 'secret_c',
          },
        },
        f: ['secret_d', 'secret_e'],
        g: 42,
        h: null,
      });
    
      // - NOTE: replaceStringValue is called once per string element
      sinon.assert.callCount(replaceStringValueStub, 5);
      // - NOTE: verify each string element was forwarded to the stub with the secrets map
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_A}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_B}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_C}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_D}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_E}', secrets);
    });

    it('should recursively populate secrets - nested array of objects', (): void => {
      const input = [
        { x: '${SECRET_F}' },
        { y: '${SECRET_G}', z: '${SECRET_H}' },
      ] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql([
        { x: 'secret_f' },
        { y: 'secret_g', z: 'secret_h' },
      ]);

      // - NOTE: replaceStringValue is called once per string element
      sinon.assert.callCount(replaceStringValueStub, 3);
      // - NOTE: verify each string element was forwarded to the stub with the secrets map
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_F}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_G}', secrets);
      sinon.assert.calledWith(replaceStringValueStub, '${SECRET_H}', secrets);
    });

  });

});
