import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { chdir } from 'node:process';
import sinon from 'sinon';
import { getConfigDirAbsolutePath, getSecretsDirAbsolutePath } from '../../src/utils/find-directory.ts';

describe('Utils - getConfigDirAbsolutePath()', (): void => {

  // @ts-expect-error TS complains because IDE reads tsconfig.json and not tsconfig.dev.json
  const __dirname: string = import.meta.dirname;

  it('should throw an error when a name of a non-existing directory is given', (): void => {
    const nonExistingDirectoryName = 'i-surely-do-not-exist';
    try {
      getConfigDirAbsolutePath(nonExistingDirectoryName);
      expect.fail('calling `getConfigDirAbsolutePath()` should have thrown an error');
    } catch(error: unknown) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.ownProperty('message').which.equals(
        'YAML configuration directory cannot be found. ' +
        `Make sure "${nonExistingDirectoryName}" folder exists in the root directory of your project.`
      );
    }
  });

  it('should throw an error when an empty string is given', (): void => {
    try {
      getConfigDirAbsolutePath('');
      expect.fail('calling `getConfigDirAbsolutePath()` should have thrown an error');
    } catch(error: unknown) {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.ownProperty('message').which.equals(
        'YAML configuration directory cannot be found. ' +
        'Make sure "" folder exists in the root directory of your project.'
      );
    }
  });

  it('should correctly return absolute filesystem path when config directory is in the tree', (): void => {
    const tempDirAbsolutePath = mkdtempSync(join(__dirname, '../../config-test'));
    chdir(__dirname);

    const dirNameToFind = tempDirAbsolutePath.split('/').pop() as string;
    const result = getConfigDirAbsolutePath(dirNameToFind);

    expect(result).to.equal(tempDirAbsolutePath);

    rmSync(tempDirAbsolutePath, { force: true, recursive: true });
  });

  it('should correctly return absolute filesystem path when config directory is a sibling', (): void => {
    const tempDirAbsolutePath = mkdtempSync(join(__dirname, 'config-test'));
    chdir(__dirname);

    const dirNameToFind = tempDirAbsolutePath.split('/').pop() as string;
    const result = getConfigDirAbsolutePath(dirNameToFind);

    expect(result).to.equal(tempDirAbsolutePath);

    rmSync(tempDirAbsolutePath, { force: true, recursive: true });
  });

});

describe('Utils - getSecretsDirAbsolutePath()', (): void => {

  // @ts-expect-error TS complains because IDE reads tsconfig.json and not tsconfig.dev.json
  const __dirname: string = import.meta.dirname;
  let logSpy: sinon.SinonStub;

  beforeEach((): void => {
    logSpy = sinon.stub(console, 'warn').callsFake((): void => { /* do nothing to avoid polluting console */ });
  });

  afterEach((): void => {
    sinon.restore();
  });

  it('should log a warning and return "undefined" when a name of a non-existing directory is given', (): void => {
    const nonExistingDirectoryName = 'i-surely-do-not-exist';

    const result = getSecretsDirAbsolutePath(nonExistingDirectoryName);

    expect(result).to.equal(undefined);
    sinon.assert.calledOnceWithExactly(logSpy, 'YAML secrets directory cannot be found.');
  });

  it('should log a warning and return "undefined" when an empty string is given', (): void => {
    const result = getSecretsDirAbsolutePath('');

    expect(result).to.equal(undefined);
    sinon.assert.calledOnceWithExactly(logSpy, 'YAML secrets directory cannot be found.');
  });

  it('should correctly return absolute filesystem path when config directory is in the tree', (): void => {
    // TODO: stub console.warn
    const tempDirAbsolutePath = mkdtempSync(join(__dirname, '../../config-test'));
    chdir(__dirname);

    const dirNameToFind = tempDirAbsolutePath.split('/').pop() as string;
    const result = getSecretsDirAbsolutePath(dirNameToFind);

    expect(result).to.equal(tempDirAbsolutePath);
    sinon.assert.notCalled(logSpy);

    rmSync(tempDirAbsolutePath, { force: true, recursive: true });
  });

  it('should correctly return absolute filesystem path when config directory is a sibling', (): void => {
    // TODO: stub console.warn
    const tempDirAbsolutePath = mkdtempSync(join(__dirname, 'config-test'));
    chdir(__dirname);

    const dirNameToFind = tempDirAbsolutePath.split('/').pop() as string;
    const result = getSecretsDirAbsolutePath(dirNameToFind);

    expect(result).to.equal(tempDirAbsolutePath);
    sinon.assert.notCalled(logSpy);

    rmSync(tempDirAbsolutePath, { force: true, recursive: true });
  });

});
