import { expect } from 'chai';
import * as jsyaml from 'js-yaml';
import { afterEach, beforeEach, describe, it } from 'mocha';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { loadConfig } from '../../src/config-management/config-loader.ts';

describe('Config Management - loadConfig()', (): void => {

  let dir: string;
  const filename = 'default.yml';
  const extendsFilename = 'extends.yml';

  beforeEach('create temporary dir with config file', (): void => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
    fs.writeFileSync(path.join(dir, filename), jsyaml.dump({ settings: 'one' }));
  });

  afterEach('remove temporary dir', (): void => {
    fs.rmSync(dir, { force: true, recursive: true });
  });

  it('should throw an error if given filename is not for a YAML file', (): void => {
    try {
      loadConfig(dir, 'default.txt');
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'can only load configuration from YAML files');
    }
  });

  it('should throw an error if given filename does not have a match', (): void => {
    const fakeFilename = 'i-am-a-fake-filename.yml';

    try {
      loadConfig(dir, fakeFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', `path ${path.join(dir, fakeFilename)} does not exist.`);
    }
  });

  it('should load simple config from a config file', (): void => {
    const result = loadConfig(dir, filename);

    expect(result).to.be.an('object').and.eql({ settings: 'one' });
  });

  it('should load and merge config from another file in the same directory', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@extends: ${filename}\n${jsyaml.dump({ one: 'settings' })}`);

    const result = loadConfig(dir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ one: 'settings', settings: 'one' });
  });

  it('should handle regex edge cases - no match', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@ext ends: ${filename}\n${jsyaml.dump({ one: 'settings' })}`);

    try {
      loadConfig(dir, extendsFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(jsyaml.YAMLException);
      expect(error).to.haveOwnProperty('name', 'YAMLException');
      expect(error).to.haveOwnProperty('reason', 'end of the stream or a document separator is expected');
    }
  });

  it('should handle regex edge cases - no spaces after colon', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@extends:${filename}\n${jsyaml.dump({ one: 'settings' })}`);

    const result = loadConfig(dir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ one: 'settings', settings: 'one' });
  });

  it('should handle regex edge cases - multiple spaces after colon', (): void => {
    fs.writeFileSync(
      path.join(dir, extendsFilename),
      `@extends:                              ${filename}\n${jsyaml.dump({ one: 'settings' })}`,
    );

    const result = loadConfig(dir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ one: 'settings', settings: 'one' });
  });

  it('should handle regex edge cases - should ignore anything after a space if one is found in filename', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@extends: defau lt.yml\n${jsyaml.dump({ one: 'settings' })}`);

    try {
      loadConfig(dir, extendsFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'can only load configuration from YAML files');
    }
  });

  it('should handle regex edge cases - ignore anything after a newline if one is found in filename', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@extends: defau\nlt.yml\n${jsyaml.dump({ one: 'settings' })}`);

    try {
      loadConfig(dir, extendsFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'can only load configuration from YAML files');
    }
  });

  it('should load and merge config from another file in a different directory - relative path', (): void => {
    const anotherDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-2-'));
    fs.writeFileSync(
      path.join(anotherDir, extendsFilename),
      `@extends: ../${dir.split('/').pop()}/${filename}\n${jsyaml.dump({ one: 'settings' })}`,
    );

    const result = loadConfig(anotherDir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ one: 'settings', settings: 'one' });

    fs.rmSync(anotherDir, { force: true, recursive: true });
  });

  it('should load and merge config from another file in a different directory - absolute path', (): void => {
    const anotherDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-2-'));
    fs.writeFileSync(
      path.join(anotherDir, extendsFilename),
      `@extends: ${path.join(dir, filename)}\n${jsyaml.dump({ one: 'settings' })}`,
    );

    const result = loadConfig(anotherDir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ one: 'settings', settings: 'one' });

    fs.rmSync(anotherDir, { force: true, recursive: true });
  });

  it('should throw an error if filename referenced by @extends is not a YAML file', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `@extends: random-file.txt\n${jsyaml.dump({ one: 'settings' })}`);

    try {
      loadConfig(dir, extendsFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', 'can only load configuration from YAML files');
    }
  });

  it('should throw an error if filename referenced by @extends does not have a match', (): void => {
    fs.writeFileSync(
      path.join(dir, extendsFilename),
      `@extends: i-do-not-exist.yml\n${jsyaml.dump({ one: 'settings' })}`,
    );

    try {
      loadConfig(dir, extendsFilename);
      expect.fail('call to `loadConfig()` should have thrown an error');
    } catch(error) {
      expect(error).to.be.an.instanceOf(Error);
      expect(error).to.haveOwnProperty('message', `path ${path.join(dir, 'i-do-not-exist.yml')} does not exist.`);
    }
  });

  it('should override default file if @extends is at the top', (): void => {
    fs.writeFileSync(
      path.join(dir, extendsFilename),
      `@extends: ${filename}\n${jsyaml.dump({ settings: 'two', x: 4 })}`,
    );

    const result = loadConfig(dir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ settings: 'two', x: 4 });
  });

  it('should override default file if @extends is at the bottom', (): void => {
    fs.writeFileSync(
      path.join(dir, extendsFilename),
      `${jsyaml.dump({ settings: 'three', y: true })}\n@extends: ${filename}`,
    );

    const result = loadConfig(dir, extendsFilename);

    expect(result).to.be.an('object').and.eql({ settings: 'three', y: true });
  });

  it('should deal with multiple @extends in the same file', (): void => {
    fs.writeFileSync(path.join(dir, extendsFilename), `${jsyaml.dump({ d: [], y: { a: true }, settings: 'two' })}`);
    fs.writeFileSync(
      path.join(dir, 'extends-2.yml'),
      `@extends: ${extendsFilename}\n${jsyaml.dump({ z: 42, y: { a: false } })}\n@extends: ${filename}`,
    );

    const result = loadConfig(dir, 'extends-2.yml');

    expect(result).to.be.an('object').and.eql({
      // - `extends.yml` is loaded first and "d" keeps its value since it only exists there
      d: [],
      // - `extends.yml` is loaded first and `default.yml` second, so "settings === 'two'" and is then replaced
      settings: 'one',
      // - `extends.yml` is loaded first and `extends-2.yml` third, so "y === {a: true}" and is then replaced
      y: { a: false },
      // - `extends-2.yml` is loaded third and last and "z" keeps its value since it only exists there
      z: 42,
    });
  });

});
