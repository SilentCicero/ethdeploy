const plugins = require('../index.js');
const assert = require('chai').assert;

describe('plugins', () => {
  describe('JSONMinifier', () => {
    it('should function properly', () => {
      assert.equal(typeof plugins.JSONMinifier, 'function');
      const data = {
        output: '{}',
      };
      const result = (new plugins.JSONMinifier()).process(data);
      const expected = '{}';
      assert.deepEqual(result, expected);
    });
  });

  describe('JSONExpander', () => {
    it('should function properly', () => {
      assert.equal(typeof plugins.JSONExpander, 'function');
      const data = {
        output: '{"a":"b"}',
      };
      const expected =
`{
  "a": "b"
}`;
      const result = (new plugins.JSONExpander()).process(data);
      assert.deepEqual(result, expected);
    });
  });

  describe('IncludeContracts', () => {
    it('should function properly', () => {
      assert.equal(typeof plugins.IncludeContracts, 'function');
      const data = {
        output: '{}',
        contracts: {
          SimpleStoreInterface: {
            bytecode: '0x...',
            interface: '[{....}]',
          },
          Token: {
            bytecode: '0x...',
            interface: '[{....}]',
          },
          Proxy: {
            bytecode: '0x...',
            interface: '[{....}]',
          },
        },
      };
      const result = (new plugins.IncludeContracts(['SimpleStoreInterface', 'Token', 'Proxy'])).process(data);
      const expected = '{"contracts":{"SimpleStoreInterface":{"bytecode":"0x...","interface":"[{....}]"},"Token":{"bytecode":"0x...","interface":"[{....}]"},"Proxy":{"bytecode":"0x...","interface":"[{....}]"}}}';
      assert.deepEqual(result, expected);
    });
  });


  describe('JSONFilter', () => {
    it('should function properly', () => {
      assert.equal(typeof plugins.JSONFilter, 'function');
      const unfilteredObjectString =
`
{
  "ropsten": {
    "SimpleStore": {
      "bytecode": "0x...",
      "interface": "[{}]",
      "address": "0x3a70a6765746af3bfa974fff9d753d4b6c56b333",
      "inputs": [],
      "transactionObject": {
        "from": "0x7f3e74e3dbb4091973ea1b449692c504c35ef768",
        "gas": 3000001
      },
      "WILL_BE_FILTERED": "OUT"
    }
  }
}
`;
      const data = {
        output: unfilteredObjectString,
      };
      const result = (new plugins.JSONFilter()).process(data);
      const expected = '{"ropsten":{"SimpleStore":{"bytecode":"0x...","interface":"[{}]","address":"0x3a70a6765746af3bfa974fff9d753d4b6c56b333","inputs":[],"transactionObject":{"from":"0x7f3e74e3dbb4091973ea1b449692c504c35ef768","gas":3000001}}}}';
      assert.deepEqual(result, expected);
    });
  });
});

