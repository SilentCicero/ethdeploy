'use strict';

var assert = require('chai').assert;
var BN = require('bn.js'); // eslint-disable-line
var BigNumber = require('bignumber.js'); // eslint-disable-line
var ethdeploy = require('../index.js'); // eslint-disable-line
var HttpProvider = require('ethjs-provider-http'); // eslint-disable-line
var TestRPC = require('ethereumjs-testrpc');

describe('ethdeploy', function () {
  describe('main method', function () {
    it('should instantiate properly', function () {
      assert.equal(typeof ethdeploy, 'function');
    });

    it('should handle undefined', function (done) {
      ethdeploy(undefined, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle empty object', function (done) {
      ethdeploy({}, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle empty function', function (done) {
      ethdeploy(function () {}, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config', function (done) {
      ethdeploy({
        entry: [],
        output: {},
        module: {}
      }, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config no provider', function (done) {
      ethdeploy({
        entry: [],
        output: {},
        module: {
          deployment: function deployment() {}
        }
      }, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with no env', function (done) {
      ethdeploy({
        entry: [],
        output: {},
        module: {
          environment: {},
          deployment: function deployment() {}
        }
      }, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with provider', function (done) {
      ethdeploy({
        entry: [],
        output: {},
        module: {
          environment: {
            provider: new HttpProvider('http://localhost:3000')
          },
          deployment: function deployment() {}
        }
      }, function (err, result) {
        assert.isOk(err);
        assert.isNotOk(result);
        done();
      });
    });

    it('should handle normal config with testrpc', function (done) {
      ethdeploy({
        entry: [],
        output: {},
        module: {
          environment: {
            name: 'localhost',
            provider: TestRPC.provider()
          },
          deployment: function deployment(deploy, c, done1) {
            return done();
          } }
      }, function (err, result) {
        assert.isOk(result);
        assert.isNotOk(err);
        done();
      });
    });

    it('should handle normal entry with testrpc', function (done) {
      ethdeploy({
        entry: {
          SimpleStore: 1
        },
        output: {},
        sourceMapper: function sourceMapper(v, cb) {
          return cb(null, v);
        },
        module: {
          loaders: [{ loader: 'ethdeploy-raw-solc-loader' }],
          environment: {
            name: 'localhost',
            provider: TestRPC.provider()
          },
          deployment: function deployment(deploy, contracts, done1) {
            assert.equal(contracts.SimpleStore, 1);

            done1();
          } }
      }, function () {
        return done();
      });
    });

    it('should handle normal entry with testrpc/raw solc', function (done) {
      ethdeploy({
        entry: {
          SimpleStore: {
            bytecode: '',
            'interface': ''
          }
        },
        output: {},
        sourceMapper: function sourceMapper(v, cb) {
          return cb(null, v);
        },
        module: {
          loaders: [{ loader: 'ethdeploy-raw-solc-loader' }],
          environment: {
            name: 'localhost',
            provider: TestRPC.provider()
          },
          deployment: function deployment(deploy, contracts, done1) {
            assert.equal(contracts.SimpleStore, 1);

            done1();
          } }
      }, function () {
        return done();
      });
    });
  });
});