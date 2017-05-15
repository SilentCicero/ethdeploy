const assert = require('chai').assert;
const BN = require('bn.js'); // eslint-disable-line
const BigNumber = require('bignumber.js'); // eslint-disable-line
const ethdeploy = require('../index.js'); // eslint-disable-line
const HttpProvider = require('ethjs-provider-http'); // eslint-disable-line
const TestRPC = require('ethereumjs-testrpc');

describe('ethdeploy', () => {
  describe('main method', () => {
    it('should instantiate properly', () => {
      assert.equal(typeof ethdeploy, 'function');
    });

    it('should handle undefined', (done) => {
      ethdeploy(undefined, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle empty object', (done) => {
      ethdeploy({}, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle empty function', (done) => {
      ethdeploy(() => {}, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config', (done) => {
      ethdeploy({
        entry: [],
        output: {},
        module: {},
      }, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config no provider', (done) => {
      ethdeploy({
        entry: [],
        output: {
        },
        module: {
          deployment: () => {},
        },
      }, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with no env', (done) => {
      ethdeploy({
        entry: [],
        output: {
        },
        module: {
          environment: {},
          deployment: () => {},
        },
      }, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with provider', (done) => {
      ethdeploy({
        entry: [],
        output: {
        },
        module: {
          environment: {
            provider: new HttpProvider('http://localhost:3000'),
          },
          deployment: () => {},
        },
      }, (err, result) => {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with testrpc', (done) => {
      ethdeploy({
        entry: [],
        output: {},
        module: {
          environment: {
            name: 'localhost',
            provider: TestRPC.provider(),
          },
          deployment: (deploy, c, done1) => done(), // eslint-disable-line
        },
      }, (err, result) => {
        assert.isOk(result);
        assert.isNotOk(err);
        done();
      });
    });

    it('should handle normal entry with testrpc', (done) => {
      ethdeploy({
        entry: {
          SimpleStore: 1,
        },
        output: {},
        sourceMapper: (v, cb) => cb(null, v),
        module: {
          loaders: [
            { loader: 'ethdeploy-raw-solc-loader' },
          ],
          environment: {
            name: 'localhost',
            provider: TestRPC.provider(),
          },
          deployment: (deploy, contracts, done1) => {
            assert.equal(contracts.SimpleStore, 1);

            done1();
          }, // eslint-disable-line
        },
      }, () => done());
    });

    it('should handle normal entry with testrpc/raw solc', (done) => {
      ethdeploy({
        entry: {
          SimpleStore: {
            bytecode: '',
            interface: '',
          },
        },
        output: {},
        sourceMapper: (v, cb) => cb(null, v),
        module: {
          loaders: [
            { loader: 'ethdeploy-raw-solc-loader' },
          ],
          environment: {
            name: 'localhost',
            provider: TestRPC.provider(),
          },
          deployment: (deploy, contracts, done1) => {
            assert.equal(contracts.SimpleStore, 1);

            done1();
          }, // eslint-disable-line
        },
      }, () => done());
    });
  });
});
