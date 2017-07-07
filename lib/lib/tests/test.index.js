'use strict';

var lib = require('../index.js');
var assert = require('chai').assert;

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

describe('lib', function () {
  // smaller methods first

  describe('transformTxObject', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.transformTxObject, 'function');
    });
  });

  describe('requireLoader', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.requireLoader, 'function');
    });
  });

  describe('configError', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.configError, 'function');
    });
  });

  describe('loadEnvironment', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.loadEnvironment, 'function');
    });
  });

  describe('transformContracts', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.transformContracts, 'function');
    });
  });

  // medium size methods

  describe('singleEntrySourceMap', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.singleEntrySourceMap, 'function');
    });
  });

  describe('entrySourceMap', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.entrySourceMap, 'function');
    });
  });

  // larger methods second

  describe('processOutput', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.processOutput, 'function');
    });
  });

  describe('buildDeployMethod', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.buildDeployMethod, 'function');
    });
  });

  describe('loadContracts', function () {
    it('should function properly', function () {
      assert.equal(typeof lib.loadContracts, 'function');
    });
  });
});