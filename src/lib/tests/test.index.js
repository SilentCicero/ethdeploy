const lib = require('../index.js');
const assert = require('chai').assert;

/*
SMALL:
transformTxObject,
requireLoader,
configError,
transformContracts,
loadEnvironment,

LARGE:
processOutput,
buildDeployMethod,
loadContracts,

MEDIUM:
singleEntrySourceMap,
entrySourceMap,
*/

describe('lib', () => {
  // smaller methods first

  describe('transformTxObject', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.transformTxObject, 'function');
    });
  });

  describe('requireLoader', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.requireLoader, 'function');
    });
  });

  describe('configError', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.configError, 'function');
    });
  });

  describe('loadEnvironment', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.loadEnvironment, 'function');
    });
  });

  describe('transformContracts', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.transformContracts, 'function');
    });
  });

  // medium size methods

  describe('singleEntrySourceMap', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.singleEntrySourceMap, 'function');
    });
  });

  describe('entrySourceMap', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.entrySourceMap, 'function');
    });
  });

  // larger methods second

  describe('processOutput', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.processOutput, 'function');
    });
  });

  describe('buildDeployMethod', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.buildDeployMethod, 'function');
    });
  });

  describe('loadContracts', () => {
    it('should function properly', () => {
      assert.equal(typeof lib.loadContracts, 'function');
    });
  });
});
