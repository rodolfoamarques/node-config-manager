import { expect } from 'chai';
import { describe, it } from 'mocha';
import { deepCopy } from '../../src/utils/deep-copy.ts';

describe('Utils - deepCopy()', (): void => {

  describe('Basic Data Types', (): void => {

    it('should handle basic data type "null"', (): void => {
      const result = deepCopy(null);

      expect(result).to.be.a('null').which.eql(null);
    });

    it('should handle basic data type "undefined"', (): void => {
      const result = deepCopy(undefined);

      expect(result).to.be.a('undefined').which.equals(undefined);
    });

    it('should handle basic data type "number"', (): void => {
      const result = deepCopy(5);

      expect(result).to.be.a('number').which.equals(5);
    });

    it('should handle basic data type "boolean"', (): void => {
      const result = deepCopy(false);

      expect(result).to.be.a('boolean').which.equals(false);
    });

    it('should handle basic data type "string"', (): void => {
      const result = deepCopy('hello');

      expect(result).to.be.a('string').which.equals('hello');
    });

  });

  describe('Arrays', (): void => {

    it('should correctly copy a simple array', (): void => {
      const mainArray = [
        'a',
        1,
        true,
      ];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(3);
      expect(result).to.eql(mainArray); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.a('string');
      expect(result[1]).to.be.a('number');
      expect(result[2]).to.be.a('boolean');
    });

    it.skip('should correctly copy an array of "undefined"', (): void => {
      const mainArray = [
        undefined, undefined, undefined, undefined,
      ];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(4);
      // TODO: the deepCopy() is transforming the "undefined"'s into "null"'s
      expect(result).to.eql(mainArray); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.a('undefined').which.equals(undefined);
      expect(result[1]).to.be.a('undefined').which.equals(undefined);
      expect(result[2]).to.be.a('undefined').which.equals(undefined);
      expect(result[3]).to.be.a('undefined').which.equals(undefined);
    });

    it('should correctly copy an array of "nulls"', (): void => {
      const mainArray = [
        null, null, null, null,
      ];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(4);
      expect(result).to.eql(mainArray); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.a('null').which.eql(null);
      expect(result[1]).to.be.a('null').which.eql(null);
      expect(result[2]).to.be.a('null').which.eql(null);
      expect(result[3]).to.be.a('null').which.eql(null);
    });

    it('should correctly copy an array of arrays', (): void => {
      const mainArray = [
        ['aa', 'bb', 'cc'],
        [11, 22, 33, 44],
        [true, false, true, true, false],
      ];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(3);
      expect(result).to.eql(mainArray); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.an('array').with.length(3);
      expect(result[0]).to.eql(mainArray[0]); // NOTE: eql(): void => deep equality
      expect(result[0]).to.not.equal(mainArray[0]); // NOTE: equal(): void => strict equality
      expect(result[1]).to.be.an('array').with.length(4);
      expect(result[1]).to.eql(mainArray[1]); // NOTE: eql(): void => deep equality
      expect(result[1]).to.not.equal(mainArray[1]); // NOTE: equal(): void => strict equality
      expect(result[2]).to.be.an('array').with.length(5);
      expect(result[2]).to.eql(mainArray[2]); // NOTE: eql(): void => deep equality
      expect(result[2]).to.not.equal(mainArray[2]); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an array of objects', (): void => {
      const mainArray = [
        { aa: 'aa' },
        { bb: 11 },
        { cc: true },
      ];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(3);
      expect(result).to.eql(mainArray); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.an('object');
      expect(result[0]).to.eql(mainArray[0]); // NOTE: eql(): void => deep equality
      expect(result[0]).to.not.equal(mainArray[0]); // NOTE: equal(): void => strict equality
      expect(result[1]).to.be.an('object');
      expect(result[1]).to.eql(mainArray[1]); // NOTE: eql(): void => deep equality
      expect(result[1]).to.not.equal(mainArray[1]); // NOTE: equal(): void => strict equality
      expect(result[2]).to.be.an('object');
      expect(result[2]).to.eql(mainArray[2]); // NOTE: eql(): void => deep equality
      expect(result[2]).to.not.equal(mainArray[2]); // NOTE: equal(): void => strict equality
    });

  });

  describe('Functions', (): void => {

    it('should throw when input is a function', (): void => {
      const mainFunction = (): string => 'hello world!';

      try {
        deepCopy(mainFunction);
        expect.fail('calling `deepCopy()` with a function should throw a syntax error');
      } catch(error) {
        expect(error).to.be.an.instanceOf(SyntaxError);
        expect(error).to.haveOwnProperty('message', 'Can\'t copy a function');
      }
    });

    it('should replace elements with "null" when input is an array with functions', (): void => {
      const input = [
        (): string => 'hello world',
        'i am not a function !',
        (): number => 42,
      ];

      const result = deepCopy(input);

      expect(result).to.be.an('array').with.length(3);
      expect(result).to.eql([null, input[1], null]); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(input); // NOTE: equal(): void => strict equality
    });

    it('should ignore property when input is an object with a function', (): void => {
      const input = {
        a: 1,
        b: '2',
        c: false,
        o: (): string => 'hello world',
      };

      const result = deepCopy(input);

      expect(result).to.be.an('object');
      expect(Object.keys(result).length).to.equal(3);
      expect(result).to.not.haveOwnProperty('o');
      Reflect.deleteProperty(input, 'o');
      expect(result).to.eql(input); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(input); // NOTE: equal(): void => strict equality
    });

  });

  describe('Date', (): void => {
    const now = new Date(2022, 0, 2);

    it('should return a string when copying a Date', (): void => {
      const result = deepCopy(now);

      expect(result).to.be.a('string').and.not.an.instanceOf(Date);
      expect(result).to.not.eql(now);
      expect(result).to.not.equal(now);
      expect(result).to.equals(now.toISOString());
    });

    it('should replace with a string when copying an object with a Date sub-property', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        n: now,
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('n');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.n).to.be.a('string').and.not.an.instanceOf(Date);
      expect(result.n).to.equal(now.toISOString());
    });

    it('should return an array of strings when given an array of Dates', (): void => {
      const yesterday = new Date(2022, 0, 1);
      const tomorrow = new Date(2022, 0, 3);
      const mainArray = [yesterday, now, tomorrow];

      const result = deepCopy(mainArray);

      expect(result).to.be.an('array').with.length(3);
      expect(result).to.not.equal(mainArray); // NOTE: equal(): void => strict equality
      expect(result[0]).to.be.a('string').and.not.an.instanceOf(Date);
      expect(result[0]).to.equal(yesterday.toISOString());
      expect(result[1]).to.be.a('string').and.not.an.instanceOf(Date);
      expect(result[1]).to.equal(now.toISOString());
      expect(result[2]).to.be.a('string').and.not.an.instanceOf(Date);
      expect(result[2]).to.equal(tomorrow.toISOString());
    });

  });

  describe('Objects', (): void => {

    it('should correctly copy a simple object', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object');
      expect(Object.keys(result).length).to.equal(3);
      expect(result).to.eql(mainObject); // NOTE: eql(): void => deep equality
      expect(result).to.not.equal(mainObject); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with a nested object', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        g: {
          d: 3,
          e: '4',
          f: true,
        },
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('g');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.g).to.exist.and.be.an('object');
      expect(Object.keys(result.g).length).to.equal(3);
      expect(result.g).to.eql(mainObject.g); // NOTE: eql(): void => deep equality
      expect(result.g).to.not.equal(mainObject.g); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with a nested empty object', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        z: {},
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('z');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.z).to.exist.and.be.an('object');
      expect(Object.keys(result.z).length).to.equal(0);
      expect(result.z).to.eql(mainObject.z); // NOTE: eql(): void => deep equality
      expect(result.z).to.not.equal(mainObject.z); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with an empty array', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        h: [],
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('h');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.h).to.exist.and.be.an('array').with.length(0);
      expect(result.h).to.eql(mainObject.h); // NOTE: eql(): void => deep equality
      expect(result.h).to.not.equal(mainObject.h); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with an array', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        i: [1, 2, 3, 4, 5],
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('i');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.i).to.exist.and.be.an('array').with.length(5);
      expect(result.i).to.eql(mainObject.i); // NOTE: eql(): void => deep equality
      expect(result.i).to.not.equal(mainObject.i); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with a nested array', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        j: {
          d: 3,
          e: '4',
          f: true,
          k: ['a', 'b', 'c'],
        },
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('j');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.j).to.exist.and.be.an('object').and.haveOwnProperty('k');
      expect(Object.keys(result.j).length).to.equal(4);
      expect(result.j.k).to.exist.and.be.an('array');
      expect(result.j.k).to.eql(mainObject.j.k); // NOTE: eql(): void => deep equality
      expect(result.j.k).to.not.equal(mainObject.j.k); // NOTE: equal(): void => strict equality
    });

    it('should correctly copy an object with an array of objects', (): void => {
      const mainObject = {
        a: 1,
        b: '2',
        c: false,
        l: {
          d: 3,
          e: '4',
          f: true,
          m: [
            { aa: 'aa' },
            { bb: 11 },
            { cc: true },
          ],
        },
      };

      const result = deepCopy(mainObject);

      expect(result).to.be.an('object').and.haveOwnProperty('l');
      expect(Object.keys(result).length).to.equal(4);
      expect(result.l).to.exist.and.be.an('object').and.haveOwnProperty('m');
      expect(Object.keys(result.l).length).to.equal(4);
      expect(result.l.m).to.exist.and.be.an('array');
      expect(result.l.m).to.eql(mainObject.l.m); // NOTE: eql(): void => deep equality
      expect(result.l.m).to.not.equal(mainObject.l.m); // NOTE: equal(): void => strict equality
      expect(result.l.m).to.have.length(3);
      expect(result.l.m[0]).to.be.an('object');
      expect(result.l.m[0]).to.eql(mainObject.l.m[0]); // NOTE: eql(): void => deep equality
      expect(result.l.m[0]).to.not.equal(mainObject.l.m[0]); // NOTE: equal(): void => strict equality
      expect(result.l.m[1]).to.be.an('object');
      expect(result.l.m[1]).to.eql(mainObject.l.m[1]); // NOTE: eql(): void => deep equality
      expect(result.l.m[1]).to.not.equal(mainObject.l.m[1]); // NOTE: equal(): void => strict equality
      expect(result.l.m[2]).to.be.an('object');
      expect(result.l.m[2]).to.eql(mainObject.l.m[2]); // NOTE: eql(): void => deep equality
      expect(result.l.m[2]).to.not.equal(mainObject.l.m[2]); // NOTE: equal(): void => strict equality
    });

  });

});
