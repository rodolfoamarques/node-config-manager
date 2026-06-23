import { expect } from 'chai';
import { describe, it } from 'mocha';
import { replaceStringValue } from '../../src/utils/replace-string.ts';

describe('Utils - replaceStringValue()', (): void => {

  const secrets = { SECRET_A: 'secret_a' };

  it('should do nothing for a string with no secret', (): void => {
    const result = replaceStringValue('hi', secrets);

    expect(result).to.equal('hi');
  });

  it('should throw an error when secret is not found', (): void => {
    try {
      replaceStringValue('${SECRET_A}', { SECRET_B: 'secret_b' });
      expect.fail('call to replaceStringValue() should have thrown an error');
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'the value of secret "SECRET_A" is undefined');
    }
  });

  it('should handle retrieving secrets from object with nested properties', (): void => {
    const result = replaceStringValue(
      'i am a nested secret : ${SECRET.A}',
      { SECRET: { A: 'super nested secret' } },
    );

    expect(result).to.equal('i am a nested secret : super nested secret');
  });

  it('should throw an error when nested secret is not found', (): void => {
    try {
      replaceStringValue(
        'i am a nested secret : ${SECRET.B}',
        { SECRET: { A: 'super nested secret' } },
      );
      expect.fail('call to replaceStringValue() should have thrown an error');
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'the value of secret "SECRET.B" is undefined');
    }
  });

  it('should handle retrieving secrets from an array', (): void => {
    const result = replaceStringValue(
      'i am a secret from an array : ${SECRET[1]}',
      { SECRET: ['super secret', 'another secret'] },
    );

    expect(result).to.equal('i am a secret from an array : another secret');
  });

  it('should throw an error when attempting to replace secret from non-existent position in array', (): void => {
    try {
      replaceStringValue('i am a secret from an array : ${SECRET[10]}', { SECRET: ['super secret'] });
      expect.fail('call to replaceStringValue() should have thrown an error');
    } catch (error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'the value of secret "SECRET[10]" is undefined');
    }
  });

  it('should handle multiple secrets in the same string', (): void => {
    const result = replaceStringValue(
      '${SECRET_A} ${SECRET_B}! - ${SECRET_C}',
      { SECRET_A: 'Hello', SECRET_B: 'there', SECRET_C: 'General Kenobi!' },
    );

    expect(result).to.equal('Hello there! - General Kenobi!');
  });

  describe('badly formatted secret', (): void => {

    it('should do nothing when there is no "$"', (): void => {
      const result = replaceStringValue('{SECRET_A}', secrets);

      expect(result).to.equal('{SECRET_A}');
    });

    it('should do nothing when there is no opening bracket', (): void => {
      const result = replaceStringValue('$SECRET_A}', secrets);

      expect(result).to.equal('$SECRET_A}');
    });

    it('should do nothing when there is no closing bracket', (): void => {
      const result = replaceStringValue('${ SECRET_A', secrets);

      expect(result).to.equal('${ SECRET_A');
    });

    it('should do nothing when multiple brackets exist in the beginning', (): void => {
      const result = replaceStringValue('${{{{{{{SECRET_A}', secrets);

      expect(result).to.equal('${{{{{{{SECRET_A}');
    });

    it('should do nothing when there is a " " in the middle', (): void => {
      const result = replaceStringValue('${SECR ET_A}', secrets);

      expect(result).to.equal('${SECR ET_A}');
    });

    it('should do nothing when there is a "{" in the middle', (): void => {
      const result = replaceStringValue('${SECR{ET_A}', secrets);

      expect(result).to.equal('${SECR{ET_A}');
    });

    it('should do nothing when there is a new scope in the middle', (): void => {
      const result = replaceStringValue('${SEC{R}ET_A}', secrets);

      expect(result).to.equal('${SEC{R}ET_A}');
    });

  });

  describe('correctly formatted secret', (): void => {

    it('should successfully retrieve secret when a "$" exists in the middle of the secret name', (): void => {
      const result = replaceStringValue('${SECR$ET_A}', { SECR$ET_A: 'secret_a' });

      expect(result).to.equal('secret_a');
    });

    it('should successfully retrieve secret when multiple "$" exist in the beginning of the secret name', (): void => {
      const result = replaceStringValue('$$${SECRET_A}', secrets);

      expect(result).to.equal(`$$${secrets.SECRET_A}`);
    });

    it('should successfully retrieve secret when multiple "$" exist in the end of the secret name', (): void => {
      const result = replaceStringValue('${SECRET_A}$$$$$', secrets);

      expect(result).to.equal(`${secrets.SECRET_A}$$$$$`);
    });

    it('should successfully retrieve secret when multiple brackets exist in the end of the secret name', (): void => {
      const result = replaceStringValue('${SECRET_A}}}}}}', secrets);

      expect(result).to.equal(`${secrets.SECRET_A}}}}}}`);
    });

    it('should successfully retrieve secret when no spaces exist around the secret name', (): void => {
      const result = replaceStringValue('${SECRET_A}', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when one space exists before the secret name', (): void => {
      const result = replaceStringValue('${ SECRET_A}', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when multiple spaces exist before the secret name', (): void => {
      const result = replaceStringValue('${       SECRET_A}', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when one space exists after the secret name', (): void => {
      const result = replaceStringValue('${SECRET_A }', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when multiple spaces exist after the secret name', (): void => {
      const result = replaceStringValue('${SECRET_A        }', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when one space exists before and after the secret name', (): void => {
      const result = replaceStringValue('${ SECRET_A }', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret when multiple spaces exist before and after the secret name', (): void => {
      const result = replaceStringValue('${          SECRET_A          }', secrets);

      expect(result).to.equal(secrets.SECRET_A);
    });

    it('should successfully retrieve secret for secret name with special characters', (): void => {
      const result = replaceStringValue(
        '${A-c.o<n!f?u_s)i(n\\g|SECRET}',
        { 'A-c.o<n!f?u_s)i(n\\g|SECRET': 'very secret' },
      );

      expect(result).to.equal('very secret');
    });

  });

  describe('non-string secrets', (): void => {

    it('should successfully retrieve a secret value when it is a "number"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: 123 });

      expect(result).to.be.a('string').and.equal('123');
    });

    it('should successfully retrieve a secret value when it is a "boolean"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: true });

      expect(result).to.be.a('string').and.equal('true');
    });

    it.skip('should successfully retrieve a secret value when it is a "null"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: null });

      // TODO: the next condition highlights an issue. `lodash.get()` does
      //  not differentiate property not existing from existing with null value
      expect(result).to.be.a('string').and.equal('');
    });

    it.skip('should successfully retrieve a secret value when it is an "undefined"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: undefined });

      // TODO: the next condition highlights an issue. `lodash.get()` does
      //  not differentiate property not existing from existing with undefined value
      expect(result).to.be.a('string').and.equal('');
    });

    it('should successfully retrieve a secret value when it is an "array"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: [123, 'hello', false] });

      expect(result).to.be.a('string').and.equal('[123,"hello",false]');
    });

    it('should successfully retrieve a secret value when it is an "object"', (): void => {
      const result = replaceStringValue('${SECRET_A}', { SECRET_A: { a: 'hello', b: false, c: 123 } });

      expect(result).to.be.a('string').and.equal('{"a":"hello","b":false,"c":123}');
    });

  });

});
