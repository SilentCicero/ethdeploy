'use strict';

var utils = require('../index.js');
var assert = require('chai').assert;
var BN = require('bn.js');
var BigNumber = require('bignumber.js');

describe('utils', function () {
  describe('isoTime', function () {
    it('should function properly', function () {
      assert.equal(typeof utils.isoTime, 'function');
      assert.equal(typeof utils.isoTime(), 'string');
    });
  });

  describe('error', function () {
    it('should function properly', function () {
      assert.equal(typeof utils.error, 'function');
      assert.equal(typeof utils.error(), 'object');
    });
  });

  describe('deployContract', function () {
    it('should function properly', function () {
      assert.equal(typeof utils.deployContract, 'function');
    });
  });

  describe('filterSourceMap', function () {
    it('should function properly', function () {
      var testMap = {
        'somefile.json': '{}',
        '#.': 'ssf',
        'sdkffjsd.js': 'jsdkfk',
        'anotherfile.json': '{}',
        'sdflskjlfsd.sol': 'sdf',
        'sdfk/jsdfjksdf/kjsdfkjsfd.js': 'fssdf'
      };
      var JSONTestMap = {
        'anotherfile.json': '{}',
        'somefile.json': '{}'
      };
      var anotherFileJSON = {
        'anotherfile.json': '{}'
      };

      assert.equal(typeof utils.filterSourceMap, 'function');

      assert.deepEqual(utils.filterSourceMap(/\.(json)$/, null, testMap), JSONTestMap);
      assert.deepEqual(utils.filterSourceMap(null, /\.(json)$/, testMap), JSONTestMap);
      assert.deepEqual(utils.filterSourceMap(null, null, testMap), testMap);
      assert.deepEqual(utils.filterSourceMap(null, /anotherfile/, testMap), anotherFileJSON);
      assert.throws(function () {
        return utils.filterSourceMap(null, 4232, testMap);
      }, Error);
      assert.throws(function () {
        return utils.filterSourceMap(24323424, /anotherfile/, testMap);
      }, Error);
    });
  });

  describe('getInputSources', function () {
    it('should function properly', function (done) {
      assert.equal(typeof utils.getInputSources, 'function');

      utils.getInputSources('./src/utils/tests/testSources', function (err, result) {
        assert.equal(err, null);
        assert.deepEqual(result, {
          'src/utils/tests/testSources/someDir/AnotherDir/something.json': '{"yes": 1}\n',
          'src/utils/tests/testSources/someDir/anotherFile': '',
          'src/utils/tests/testSources/someDir/someDeeperDir/AnotherDeeperDir/anotherFile': '',
          'src/utils/tests/testSources/someFile.json': '{}\n',
          'src/utils/tests/testSources/someFile.s': 'const cool = 1;\n\nmodule.exports = cool;\n' });
        done();
      });
    });

    it('should handle a single file', function (done) {
      utils.getInputSources('./src/utils/tests/testSources/someFile.json', function (err, result) {
        assert.equal(err, null);
        assert.deepEqual(result, { 'src/utils/tests/testSources/someFile.json': '{}\n' });
        done();
      });
    });

    it('should handle invalid file', function (done) {
      utils.getInputSources('src/utils/tests/testSources/someFile.jssdn', function (err) {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle invalid file', function (done) {
      utils.getInputSources('src/utils/tests/testSousdfeFile', function (err) {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle invalid file', function (done) {
      utils.getInputSources('src/utils/tests/testSousdfeFile.jssdn', function (err) {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle a single file', function (done) {
      utils.getInputSources('src/utils/tests/testSources/someFile.json', function (err, result) {
        assert.equal(err, null);
        assert.deepEqual(result, { 'src/utils/tests/testSources/someFile.json': '{}\n' });
        done();
      });
    });
  });

  describe('bnToString', function () {
    it('should function properly', function () {
      assert.equal(typeof utils.bnToString, 'function');

      var bnToStringTests = [{ actual: [], expected: [] }, { actual: 0, expected: 0 }, { actual: 'something', expected: 'something' }, { actual: true, expected: true }, { actual: false, expected: false }, { actual: { something: true }, expected: { something: true } }, { actual: { something: 'someString' }, expected: { something: 'someString' } }, { actual: null, expected: null }, { actual: undefined, expected: undefined }, { actual: [22, 333, 'hello', null], expected: [22, 333, 'hello', null] }, { actual: new BN(1), expected: '1' }, { actual: new BigNumber(0), expected: '0' }, { actual: new BN('1000'), expected: '1000' }, { actual: [23498, 'sdfhjs', null, true, new BN(1), true], expected: [23498, 'sdfhjs', null, true, '1', true] }, { actual: [23498, new BN(1), null, true, new BN(1), true], expected: [23498, '1', null, true, '1', true] }, { actual: { cool: 45, something: new BN(1), arr: [23498, new BigNumber(1), null, true, new BN(1), true] },
        expected: { cool: 45, something: '1', arr: [23498, '1', null, true, '1', true] } }, { actual: { cool: 45, something: new BN(1), arr: [23498, new BN(1), null, true, { another: new BN(1), cool: 222 }, true] },
        expected: { cool: 45, something: '1', arr: [23498, '1', null, true, { another: '1', cool: 222 }, true] } }];

      bnToStringTests.forEach(function (testCase) {
        assert.deepEqual(utils.bnToString(testCase.actual), testCase.expected);
      });
    });

    it('should hex prefix properly', function () {
      assert.deepEqual(utils.bnToString(new BN('249824987'), 16, true), '0x0' + new BN('249824987').toString(16));
    });
  });
});