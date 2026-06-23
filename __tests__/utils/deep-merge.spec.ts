import { expect } from 'chai';
import { describe, it } from 'mocha';
import { deepMerge } from '../../src/utils/deep-merge.ts';

describe('Utils - deepMerge()', (): void => {

  describe('Basic Data Types', (): void => {

    const expectedResult = { hi: 'hello' };

    describe('first argument', (): void => {

      it('should do nothing for "undefined"', (): void => {
        const result = deepMerge(undefined, expectedResult);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "null"', (): void => {
        const result = deepMerge(null, expectedResult);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "string"', (): void => {
        const result = deepMerge('hello', expectedResult);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "number"', (): void => {
        const result = deepMerge(123, expectedResult);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "boolean"', (): void => {
        const result = deepMerge(false, expectedResult);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "Date"', (): void => {
        const result = deepMerge(new Date(), expectedResult);

        expect(result).to.equal(expectedResult);
      });

    });

    describe('second argument', (): void => {

      it('should do nothing for "undefined"', (): void => {
        const result = deepMerge(expectedResult, undefined);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "null"', (): void => {
        const result = deepMerge(expectedResult, null);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "string"', (): void => {
        const result = deepMerge(expectedResult, 'hello');

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "number"', (): void => {
        const result = deepMerge(expectedResult, 123);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "boolean"', (): void => {
        const result = deepMerge(expectedResult, false);

        expect(result).to.equal(expectedResult);
      });

      it('should do nothing for "Date"', (): void => {
        const result = deepMerge(expectedResult, new Date());

        expect(result).to.equal(expectedResult);
      });

    });

    describe('both arguments', (): void => {

      it('should throw an error for "string" / "number"', (): void => {
        try {
          deepMerge('hello', 42);
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

      it('should throw an error for "number" / "string"', (): void => {
        try {
          deepMerge(42, 'hello');
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

      it('should throw an error for "null" / "undefined"', (): void => {
        try {
          deepMerge(null, undefined);
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

      it('should throw an error for "undefined" / "null"', (): void => {
        try {
          deepMerge(undefined, null);
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

      it('should throw an error for "boolean" / "Date"', (): void => {
        try {
          deepMerge(true, new Date());
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

      it('should throw an error for "Date" / "boolean"', (): void => {
        try {
          deepMerge(new Date(), false);
          expect.fail('call to `deepMerge()` should have thrown an error');
        } catch (error) {
          expect(error).to.be.an.instanceOf(Error);
          expect(error).to.haveOwnProperty('message', 'there is nothing to merge');
        }
      });

    });

  });

  describe('Objects', (): void => {

    it('should successfully merge objects with exactly the same properties', (): void => {
      const input = { one: 2, two: 1 };
      const override = { one: 1, two: 2 };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.eql({ one: 1, two: 2 });
    });

    it('should successfully merge objects with completely different properties', (): void => {
      const input = { one: 1, three: 3 };
      const override = { two: '2', four: true };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.eql({ one: 1, two: '2', three: 3, four: true });
    });

    it('should successfully merge objects with different data types for the same property', (): void => {
      const input = { one: false, two: 9, three: 'hello' };
      const override = { one: 1, two: 'two', three: false };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.eql(override);
    });

    it('should successfully merge objects with all types of simple data types', (): void => {
      const input = { one: 5, two: 'one', three: true };
      const override = { one: 1, two: 'two', three: false };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.eql(override);
    });

    it('should successfully merge objects with "null" and/or "undefined" properties', (): void => {
      const input = { one: 1, two: 'two' };
      const override = { one: undefined, two: null };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.deep.equal(override);
    });

    it.skip('should successfully merge objects with nested dates', (): void => {
      const input = { start: new Date(2010, 0, 1), end: new Date(2020, 11, 31) };
      const override = { start: 1, middle: new Date(2015, 5, 30) };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result).to.haveOwnProperty('middle').which.is.not.equal(override.middle);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result).to.haveOwnProperty('end').which.is.not.equal(input.end);
      expect(result).to.eql({ ...override, end: input.end });
    });

    it.skip('should successfully merge objects with nested objects', (): void => {
      const input = { one: 1, two: { b: 15 } };
      const override = { one: { a: 1 }, two: { b: 10 } };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result).to.haveOwnProperty('one').which.is.not.equal(override.one);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result).to.haveOwnProperty('two').which.is.not.equal(override.two);
      expect(result).to.eql(override);
    });

    it('should successfully merge objects with arrays', (): void => {
      const input = { one: [4, 5], two: ['car', 'motorcycle'] };
      const override = { one: [1, 2, 3], two: ['one', 'two', 'three'] };

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.haveOwnProperty('one').which.is.not.equal(input.one).and.not.equal(override.one);
      expect(result).to.haveOwnProperty('two').which.is.not.equal(input.two).and.not.equal(override.two);
      expect(result).to.eql({ one: [...input.one, ...override.one], two: [...input.two, ...override.two] });
    });

    it('default test from deepmerge-ts docs', (): void => {
      const x = {
        record: {
          prop1: 'value1',
          prop2: 'value2',
        },
        array: [1, 2, 3],
        set: new Set([1, 2, 3]),
        map: new Map([
          ['key1', 'value1'],
          ['key2', 'value2'],
        ]),
      };

      const y = {
        record: {
          prop1: 'changed',
          prop3: 'value3',
        },
        array: [2, 3, 4],
        set: new Set([2, 3, 4]),
        map: new Map([
          ['key2', 'changed'],
          ['key3', 'value3'],
        ]),
      };

      const result = deepMerge(x, y);

      expect(result).to.not.equal(x);
      expect(result).to.not.equal(y);
      expect(result).to.eql({
        record: {
          prop1: 'changed',
          prop2: 'value2',
          prop3: 'value3',
        },
        array: [1, 2, 3, 2, 3, 4],
        set: new Set([1, 2, 3, 4]),
        map: new Map([
          ['key1', 'value1'],
          ['key2', 'changed'],
          ['key3', 'value3'],
        ]),
      });
    });

  });

  describe('Arrays', (): void => {

    it('should successfully merge empty arrays', (): void => {
      const input: string[] = [];
      const override: string[] = [];

      const result = deepMerge(input, override);

      expect(result).to.not.equal(input);
      expect(result).to.not.equal(override);
      expect(result).to.eql([]);
    });

    it('should successfully merge arrays of same type', (): void => {
      const input = ['hello', 'there'];
      const override = ['general', 'kenobi'];

      const result = deepMerge(input, override);

      expect(result).to.be.an('array').of.length(4);
      expect(result).to.eql([...input, ...override]);
    });

    it('should successfully merge arrays of different types', (): void => {
      const input = [42, null, false, 'hello'];
      const override = [new Date(), undefined, (): bigint => 999999999999999999n];

      const result = deepMerge(input, override);

      expect(result).to.be.an('array').with.length(7);
      expect(result).to.eql([...input, ...override]);
    });

    it('should successfully merge arrays of "null" / "undefined"', (): void => {
      const input = [null, undefined, null];
      const override = [null, null];

      const result = deepMerge(input, override);

      expect(result).to.be.an('array').with.length(5);
      expect(result).to.eql([...input, ...override]);
    });

    it.skip('should successfully merge arrays of arrays', (): void => {
      const input = [[1, 2, 3], ['hello', 'there', 'general kenobi']];
      const override = [[0, 0, 0], [false, true, true]];

      const result = deepMerge(input, override) as unknown[];

      expect(result).to.be.an('array').with.length(4);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[0]).to.not.equal(input[0]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[1]).to.not.equal(input[1]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[2]).to.not.equal(override[0]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[3]).to.not.equal(override[1]);
      expect(result).to.eql([...input, ...override]);
    });

    it.skip('should successfully merge arrays of objects', (): void => {
      const input = [{ a: 42 }, { b: 'hello' }];
      const override = [{ a: 69 }, { c: true }];

      const result = deepMerge(input, override) as unknown[];

      expect(result).to.be.an('array').with.length(4);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[0]).to.not.equal(input[0]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[1]).to.not.equal(input[1]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[2]).to.not.equal(override[0]);
      // TODO: the next condition highlights an issue. result should be a deep clone
      expect(result[3]).to.not.equal(override[1]);
      expect(result).to.eql([...input, ...override]);
    });

  });

});
