import { expect } from 'chai';
import Joi from 'joi';
import { beforeEach, describe, it } from 'mocha';
import sinon from 'sinon';
import { validateWrapper } from '../../src/utils/validation-wrapper.ts';

describe('Utils - validateWrapper()', (): void => {

  let logSpy: sinon.SinonStub;

  beforeEach((): void => {
    logSpy = sinon.stub(console, 'warn').callsFake((): void => { /* do nothing to avoid polluting console */ });
  });

  afterEach((): void => {
    sinon.restore();
  });

  describe('error handling scenarios', (): void => {

    it('should throw an error when value has one error', (): void => {
      const value = { a: false };
      const rules = Joi.object({ a: Joi.number() });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty('message', '"a" must be a number');
      }
    });

    it('should throw once with all errors when value has multiple errors - `abortEarly: false`', (): void => {
      const value = { a: false, b: 123 };
      const rules = Joi.object({ a: Joi.number(), b: Joi.boolean() });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty('message', '"a" must be a number. "b" must be a boolean');
      }
    });

    it('should not throw errors for extra unknown properties in value - `allowUnknown: true`', (): void => {
      const value = { a: 123, b: false };
      const rules = Joi.object({ a: Joi.number() });

      try {
        validateWrapper(value, rules);
      } catch {
        expect.fail('call to `validateWrapper()` should NOT have thrown an error');
      }
    });

    it('should not implicitly type cast input - `convert: false`', (): void => {
      const value = { a: '123' };
      const rules = Joi.object({ a: Joi.number() });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty('message', '"a" must be a number');
      }
    });

    it('should throw an error when dates are passed in wrong format - `dateFormat: "iso"`', (): void => {
      // NOTE: the validTimestamp params add nothing to the test itself
      //   they are here simply to provide examples of acceptable data
      const value = {
        invalidTimestampA: '1/2/1999',
        invalidTimestampB: '2023-02-06T13:39:23Z',
        invalidTimestampC_1: '1675695784000', // NOTE: remember => (JavaScriptTimestamp = UnixTimestamp * 1000)
        invalidTimestampC_2: 1675695784000, // NOTE: remember => (JavaScriptTimestamp = UnixTimestamp * 1000)
        invalidTimestampC_3: new Date().getTime(),
        invalidTimestampD_1: new Date(),
        invalidTimestampD_2: '02-06-2023T13:39:23Z',
        validTimestampA: new Date(),
        validTimestampB: new Date(),
        validTimestampC: new Date(),
        validTimestampD: '2023-02-06T13:39:23Z',
      };
      const rules = Joi.object({
        invalidTimestampA: Joi.date(),
        validTimestampA: Joi.date(),
        invalidTimestampB: Joi.date().iso(),
        validTimestampB: Joi.date().iso(),
        invalidTimestampC_1: Joi.date().timestamp(),
        invalidTimestampC_2: Joi.date().timestamp(),
        invalidTimestampC_3: Joi.date().timestamp(),
        validTimestampC: Joi.date().timestamp(),
        invalidTimestampD_1: Joi.string().isoDate(),
        invalidTimestampD_2: Joi.string().isoDate(),
        validTimestampD: Joi.string().isoDate(),
      });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty(
          'message',
          '"invalidTimestampA" must be a valid date. "invalidTimestampB" must be a valid date. ' +
          '"invalidTimestampC_1" must be a valid date. "invalidTimestampC_2" must be a valid date. ' +
          '"invalidTimestampC_3" must be a valid date. "invalidTimestampD_1" must be a string. ' +
          '"invalidTimestampD_2" must be in iso format',
        );
      }
    });

    it('should throw an error when properties are missing - `presence: "required"`', (): void => {
      const value = {};
      const rules = Joi.object({ a: Joi.number(), b: Joi.boolean().required(), c: Joi.string().optional() });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty('message', '"a" is required. "b" is required');
      }
    });

    it('should require by default all properties described in rules', (): void => {
      const value = { a: 123 };
      const rules = Joi.object({ a: Joi.number(), b: Joi.string() });

      try {
        validateWrapper(value, rules);
        expect.fail('call to `validateWrapper()` should have thrown an error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(Error);
        expect(error).to.haveOwnProperty('name', 'ConfigValidationError');
        expect(error).to.haveOwnProperty('message', '"b" is required');
      }
    });

  });

  describe('warning scenarios', (): void => {

    it('should log a warning from normal validation', (): void => {
      const value = { a: 123 };
      const rules = Joi.object({ a: Joi.number().min(500).warn() });

      validateWrapper(value, rules);

      sinon.assert.calledOnceWithExactly(
        logSpy,
        'Config Validation Warnings:\n  a - "a" must be greater than or equal to 500',
      );
    });

    it('should log a warning from a property not described in the rules', (): void => {
      const value = {
        a: 'i am a string',
        b: 123,
      };
      const rules = Joi.object({ a: Joi.string() });

      validateWrapper(value, rules);

      sinon.assert.calledOnceWithExactly(logSpy, 'Config Validation Warnings:\n  b - "b" is not allowed');
    });

    it('should log once multiple warnings from multiple properties not described in the rules', (): void => {
      const value = {
        a: 'i am a string',
        b: 123,
        c: {
          d: true,
          e: [],
        },
      };
      const rules = Joi.object({
        a: Joi.string(),
        c: Joi.object({ d: Joi.boolean() }),
      });

      validateWrapper(value, rules);

      sinon.assert.calledOnceWithExactly(
        logSpy,
        'Config Validation Warnings:\n  ' +
        'c.e - "c.e" is not allowed\n  b - "b" is not allowed',
      );
    });

    it('should not log anything if there are no warnings', (): void => {
      const value = { a: 'i am a string' };
      const rules = Joi.object({ a: Joi.string() });

      validateWrapper(value, rules);

      sinon.assert.callCount(logSpy, 0);
    });

  });

  describe('success scenarios', (): void => {

    it('should successfully validate and return value', (): void => {
      const value = {
        a: 'i am a string',
        b: 123,
      };
      const rules = Joi.object({
        a: Joi.string(),
        b: Joi.number().positive().integer(),
      });

      const result = validateWrapper<{ a: string; b: number; }>(value, rules);

      expect(result).to.be.an('object');
      expect(result).to.eql(value);
      expect(result).to.not.equal(value);
    });

    it('should remove from returned value any properties not described in rules', (): void => {
      const value = {
        a: 'i am a string',
        b: 123,
        c: false,
      };
      const rules = Joi.object({ a: Joi.string() });

      const result = validateWrapper<{ a: string; b: number; }>(value, rules);

      expect(result).to.eql({ a: 'i am a string' });
    });

    it('should not add defaults to any property - `noDefaults: true`', (): void => {
      const value = {};
      const rules = Joi.object({ a: Joi.string().default('hello').optional() });

      const result = validateWrapper<Record<string, string>>(value, rules);

      expect(result).to.not.eql({ a: 'hello' });
      expect(result).to.eql(value);
    });

  });

});
