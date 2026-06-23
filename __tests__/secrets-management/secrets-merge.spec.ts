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

  async function mockMerger(): Promise<import('../../src/secrets-management/secrets-merge.ts')> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const mod = await esmock('../../src/secrets-management/secrets-merge.ts', {
        replaceStringValue: replaceStringValueStub,
      });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return mod.default;
    }
    finally {
      // NO empty statement
    }
  }

  beforeEach(async (): Promise<void> => {
    replaceStringValueStub = sinon.stub().callsFake(
      (value: string, secrets: Record<string, unknown>): string => {
        console.log('2kjwebckwjebckwjbecwkbje');
        return replaceStringValue(value, secrets);
      },
    );

    const mockFilepath: string = new URL('../../src/secrets-management/secrets-merge.ts', import.meta.url).pathname;
    const depFilepath: string = new URL('../../src/utils/replace-string.ts', import.meta.url).pathname;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const module = await esmock(mockFilepath, import.meta.url, {
      [depFilepath]: { replaceStringValue: replaceStringValueStub },
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    populateSecrets = module.populateSecrets;
  });

  afterEach((): void => {
    esmock.purge(populateSecrets);
    sinon.restore();
  });

  describe('basic data types', (): void => {

    it('should do nothing when input is an "undefined"', (): void => {
      const result = populateSecrets(undefined as unknown as Record<string, unknown>, secrets);

      expect(result).to.equal(undefined);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "null"', (): void => {
      const result = populateSecrets(null as unknown as Record<string, unknown>, secrets);

      expect(result).to.equal(null);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "number"', (): void => {
      const result = populateSecrets(123 as unknown as Record<string, unknown>, {});

      expect(result).to.equal(123);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "boolean"', (): void => {
      const result = populateSecrets(true as unknown as Record<string, unknown>, {});

      expect(result).to.equal(true);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when input is a "string"', (): void => {
      const result = populateSecrets('test-input' as unknown as Record<string, unknown>, {});

      expect(result).to.equal('test-input');
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

  });

  describe('Objects', (): void => {

    it('should do nothing for empty object', (): void => {
      const input = {};

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are null', (): void => {
      const input = { a: null, b: null };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are numbers', (): void => {
      const input = { a: 123, b: 321 };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are booleans', (): void => {
      const input = { a: true, b: false };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing when sub-properties are undefined', (): void => {
      const input = { a: undefined, b: undefined };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should attempt to replace when sub-properties are strings', (): void => {
      const input = { a: 'hi', b: 'hello' };

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 2);
    });

  });

  describe('Arrays', (): void => {

    it('should do nothing for empty array', (): void => {
      const result = populateSecrets([] as unknown as Record<string, unknown>, {});

      expect(result).to.eql([]);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of null', (): void => {
      const input = [null, null, null] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of numbers', (): void => {
      const input = [1, 2, 3, 4, 5] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of booleans', (): void => {
      const input = [true, false] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should do nothing for array of undefined', (): void => {
      const input = [undefined] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 0);
    });

    it('should try to populate secrets (array) - array of strings', (): void => {
      const input = ['hello', 'there', 'general kenobi'] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql(input);
      // sinon.assert.callCount(populateSecretsSpy, 1);
      sinon.assert.callCount(replaceStringValueStub, 3);
    });

  });

  describe('recursiveness', (): void => {

    it('should recursively populate secrets where applicable - array input', (): void => {
      const input = [123, '${SECRET_A}', true, null, [], undefined, {}] as unknown as Record<string, unknown>;

      const result = populateSecrets(input, secrets);

      expect(result).to.eql([
        123,
        'secret_a',
        true,
        null,
        [],
        undefined,
        {},
      ]);
    });

    it('should recursively populate secrets where applicable - object input', (): void => {
      const input = {};

      const result = populateSecrets(input, secrets);

      expect(result).to.eql({});
    });

  });

});
