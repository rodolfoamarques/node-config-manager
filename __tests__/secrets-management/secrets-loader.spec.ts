import { expect } from 'chai';
import * as jsyaml from 'js-yaml';
import { afterEach, beforeEach, describe, it } from 'mocha';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadSecrets } from '../../src/secrets-management/secrets-loader.ts';

describe('Secrets Management - loadSecrets()', (): void => {

  let dir: string;

  beforeEach('create temporary dir with secrets files', (): void => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'secrets-test-'));
  });

  afterEach('remove temporary dir', (): void => {
    fs.rmSync(dir, { force: true, recursive: true });
  });

  it('should populate secrets from `process.env` if secrets directory does not exist', (): void => {
    const result = loadSecrets(dir);

    expect(result).to.exist.and.be.an('object');
    expect(result).to.eql(process.env);
    expect(result).to.not.equal(process.env);
  });

  describe('secret files', (): void => {

    it('should populate secrets from `process.env` and one YAML file in secrets directory', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets.yml'), jsyaml.dump({ keyOne: 'one' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, keyOne: 'one' });
    });

    it('should populate secrets from `process.env` and multiple YAML files in secrets directory', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets.yml'), jsyaml.dump({ keyOne: 'one' }));
      fs.writeFileSync(path.join(dir, 'secrets2.yml'), jsyaml.dump({ keyTwo: 'two' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({
        ...process.env,
        keyOne: 'one',
        keyTwo: 'two',
      });
    });

    it('should populate secrets from `process.env` and CERT files in secrets directory', (): void => {
      fs.writeFileSync(path.join(dir, 'not-a-yaml.crt'), 'random-data');

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, 'not-a-yaml': 'random-data' });
    });

    it('should handle edge cases for filenames - filename with no dots in name', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets-edge-case'), jsyaml.dump({ keyThree: 'three' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, 'secrets-edge-case': 'keyThree: three' });
    });

    it('should handle edge cases for filenames - filename that starts with a dot and has no extension', (): void => {
      fs.writeFileSync(path.join(dir, '.secrets'), jsyaml.dump({ keyFour: 'four' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, '.secrets': 'keyFour: four' });
    });

    it('should handle edge cases for filenames - filename that ends with a dot', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets.'), jsyaml.dump({ keyFive: 'five' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, 'secrets': 'keyFive: five' });
    });

    it('should handle edge cases for filenames - filename that ends with multiple dots', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets...'), jsyaml.dump({ keySix: 'six' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, 'secrets..': 'keySix: six' });
    });

    it('should handle edge cases for filenames - yaml with multiple non-sequential dots in name', (): void => {
      fs.writeFileSync(path.join(dir, 'secrets.edge.case.yml'), jsyaml.dump({ keySeven: 'seven' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({ ...process.env, keySeven: 'seven' });
    });

    it('should take value from `process.env` when same key exists in secrets file', (): void => {
      process.env['keyOne'] = 'not one';

      fs.writeFileSync(path.join(dir, 'secrets.yml'), jsyaml.dump({ keyOne: 'one', keyTwo: 'two' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql({
        ...process.env, // - for `keyOne`, maintains the value from `process.env`
        keyTwo: 'two', //  - for `keyTwo`, takes the value from secrets file
      });
    });

  });

  describe('secret directories', (): void => {

    it('should ignore files in sub directories', (): void => {
      fs.mkdirSync(path.join(dir, 'i-am-a-random-folder'));
      fs.writeFileSync(path.join(dir, 'i-am-a-random-folder', 'secrets.yml'), jsyaml.dump({ keyOne: 'one' }));

      const result = loadSecrets(dir);

      expect(result).to.exist.and.be.an('object');
      expect(result).to.eql(process.env);
    });

  });

});
