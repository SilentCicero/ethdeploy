const utils = require('../index.js');
const assert = require('chai').assert;
const BN = require('bn.js');
const BigNumber = require('bignumber.js');

describe('utils', () => {
  describe('isoTime', () => {
    it('should function properly', () => {
      assert.equal(typeof utils.isoTime, 'function');
      assert.equal(typeof utils.isoTime(), 'string');
    });
  });

  describe('error', () => {
    it('should function properly', () => {
      assert.equal(typeof utils.error, 'function');
      assert.equal(typeof utils.error(), 'object');
    });
  });

  describe('deployContract', () => {
    it('should function properly', () => {
      assert.equal(typeof utils.deployContract, 'function');
    });
  });

  describe('filterSourceMap', () => {
    it('should function properly', () => {
      const testMap = {
        'somefile.json': '{}',
        '#.': 'ssf',
        'sdkffjsd.js': 'jsdkfk',
        'anotherfile.json': '{}',
        'sdflskjlfsd.sol': 'sdf',
        'sdfk/jsdfjksdf/kjsdfkjsfd.js': 'fssdf',
      };
      const JSONTestMap = {
        'anotherfile.json': '{}',
        'somefile.json': '{}',
      };
      const anotherFileJSON = {
        'anotherfile.json': '{}',
      };

      assert.equal(typeof utils.filterSourceMap, 'function');

      assert.deepEqual(utils.filterSourceMap(/\.(json)$/, null, testMap), JSONTestMap);
      assert.deepEqual(utils.filterSourceMap(null, /\.(json)$/, testMap), JSONTestMap);
      assert.deepEqual(utils.filterSourceMap(null, null, testMap), testMap);
      assert.deepEqual(utils.filterSourceMap(null, /anotherfile/, testMap), anotherFileJSON);
      assert.throws(() => utils.filterSourceMap(null, 4232, testMap), Error);
      assert.throws(() => utils.filterSourceMap(24323424, /anotherfile/, testMap), Error);
    });
  });

  describe('getInputSources', () => {
    it('should function properly', (done) => {
      assert.equal(typeof utils.getInputSources, 'function');

      utils.getInputSources('./src/utils/tests/testSources', (err, result) => {
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

    it('should handle a single file', (done) => {
      utils.getInputSources('./src/utils/tests/testSources/someFile.json', (err, result) => {
        assert.equal(err, null);
        assert.deepEqual(result, { 'src/utils/tests/testSources/someFile.json': '{}\n' });
        done();
      });
    });

    it('should handle invalid file', (done) => {
      utils.getInputSources('src/utils/tests/testSources/someFile.jssdn', (err) => {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle invalid file', (done) => {
      utils.getInputSources('src/utils/tests/testSousdfeFile', (err) => {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle invalid file', (done) => {
      utils.getInputSources('src/utils/tests/testSousdfeFile.jssdn', (err) => {
        assert.equal(typeof err, 'object');
        done();
      });
    });

    it('should handle a single file', (done) => {
      utils.getInputSources('src/utils/tests/testSources/someFile.json', (err, result) => {
        assert.equal(err, null);
        assert.deepEqual(result, { 'src/utils/tests/testSources/someFile.json': '{}\n' });
        done();
      });
    });
  });

  describe('bnToString', () => {
    it('should function properly', () => {
      assert.equal(typeof utils.bnToString, 'function');

      const bnToStringTests = [
        { actual: [], expected: [] },
        { actual: 0, expected: 0 },
        { actual: 'something', expected: 'something' },
        { actual: true, expected: true },
        { actual: false, expected: false },
        { actual: { something: true }, expected: { something: true } },
        { actual: { something: 'someString' }, expected: { something: 'someString' } },
        { actual: null, expected: null },
        { actual: undefined, expected: undefined },
        { actual: [22, 333, 'hello', null], expected: [22, 333, 'hello', null] },
        { actual: new BN(1), expected: '1' },
        { actual: new BigNumber(0), expected: '0' },
        { actual: new BN('1000'), expected: '1000' },
        { actual: [23498, 'sdfhjs', null, true, new BN(1), true], expected: [23498, 'sdfhjs', null, true, '1', true] },
        { actual: [23498, new BN(1), null, true, new BN(1), true], expected: [23498, '1', null, true, '1', true] },
        { actual: { cool: 45, something: new BN(1), arr: [23498, new BigNumber(1), null, true, new BN(1), true] },
          expected: { cool: 45, something: '1', arr: [23498, '1', null, true, '1', true] } },
        { actual: { cool: 45, something: new BN(1), arr: [23498, new BN(1), null, true, { another: new BN(1), cool: 222 }, true] },
          expected: { cool: 45, something: '1', arr: [23498, '1', null, true, { another: '1', cool: 222 }, true] } },
      ];

      bnToStringTests.forEach((testCase) => {
        assert.deepEqual(utils.bnToString(testCase.actual), testCase.expected);
      });
    });

    it('should hex prefix properly', () => {
      assert.deepEqual(utils.bnToString(new BN('249824987'), 16, true), `0x0${new BN('249824987').toString(16)}`);
    });
  });
});
