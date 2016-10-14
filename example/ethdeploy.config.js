const contracts = {
  SimpleStore:
 { bytecode: '6060604052603b8060106000396000f3606060405260e060020a600035046360fe47b1811460245780636d4ce63c14602e575b005b6004356000556022565b6000546060908152602090f3',
   functionHashes: { 'get()': '6d4ce63c', 'set(uint256)': '60fe47b1' },
   interface: '[{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"set","outputs":[],"type":"function"},{"constant":false,"inputs":[],"name":"get","outputs":[{"name":"","type":"uint256"}],"type":"function"}]\n',
   opcodes: 'PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0x3B DUP1 PUSH1 0x10 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0xE0 PUSH1 0x2 EXP PUSH1 0x0 CALLDATALOAD DIV PUSH4 0x60FE47B1 DUP2 EQ PUSH1 0x24 JUMPI DUP1 PUSH4 0x6D4CE63C EQ PUSH1 0x2E JUMPI JUMPDEST STOP JUMPDEST PUSH1 0x4 CALLDATALOAD PUSH1 0x0 SSTORE PUSH1 0x22 JUMP JUMPDEST PUSH1 0x0 SLOAD PUSH1 0x60 SWAP1 DUP2 MSTORE PUSH1 0x20 SWAP1 RETURN ',
   runtimeBytecode: '606060405260e060020a600035046360fe47b1811460245780636d4ce63c14602e575b005b6004356000556022565b6000546060908152602090f3',
   solidity_interface: 'contract SimpleStore{function set(uint256 _value);function get()returns(uint256 );}' },
SimpleStoreService:
 { bytecode: '6060604052604051602080608f83395060806040525160008054600160a060020a03191682178082557f60fe47b1000000000000000000000000000000000000000000000000000000006080908152602d608452600160a060020a0391909116916360fe47b19160a4919060248183876161da5a03f1156002575050505060068060896000396000f3606060405200',
   functionHashes: {},
   interface: '[{"inputs":[{"name":"_simpleStore","type":"address"}],"type":"constructor"}]\n',
   opcodes: 'PUSH1 0x60 PUSH1 0x40 MSTORE PUSH1 0x40 MLOAD PUSH1 0x20 DUP1 PUSH1 0x8F DUP4 CODECOPY POP PUSH1 0x80 PUSH1 0x40 MSTORE MLOAD PUSH1 0x0 DUP1 SLOAD PUSH1 0x1 PUSH1 0xA0 PUSH1 0x2 EXP SUB NOT AND DUP3 OR DUP1 DUP3 SSTORE PUSH32 0x60FE47B100000000000000000000000000000000000000000000000000000000 PUSH1 0x80 SWAP1 DUP2 MSTORE PUSH1 0x2D PUSH1 0x84 MSTORE PUSH1 0x1 PUSH1 0xA0 PUSH1 0x2 EXP SUB SWAP2 SWAP1 SWAP2 AND SWAP2 PUSH4 0x60FE47B1 SWAP2 PUSH1 0xA4 SWAP2 SWAP1 PUSH1 0x24 DUP2 DUP4 DUP8 PUSH2 0x61DA GAS SUB CALL ISZERO PUSH1 0x2 JUMPI POP POP POP POP PUSH1 0x6 DUP1 PUSH1 0x89 PUSH1 0x0 CODECOPY PUSH1 0x0 RETURN PUSH1 0x60 PUSH1 0x40 MSTORE STOP ',
   runtimeBytecode: '606060405200',
   solidity_interface: 'contract SimpleStoreService{function SimpleStoreService(address _simpleStore);}' }
};

module.exports = {
  output: {
    environment: 'testrpc',
    path: './example/environments.json',
  },
  entry: {
    testrpc: contracts,
  },
  module: function(deploy, contracts, environment){
    deploy(contracts.SimpleStore).then(function(simpleStoreInstance){
      deploy(contracts.SimpleStoreService, simpleStoreInstance.address).then(function(){
        environment.log('Yay!');
      });

      deploy(contracts.SomeCustomInstance);
    });
  },
  config: {
    'defaultAccount': 0,
    'defaultGas': 3000000,
    'environments': {
      'testrpc': {
        'provider': {
          'type': 'http',
          'host': 'http://localhost',
          'port': 8545,
        },
        'objects': {
          'SomeCustomInstance': {
            'class': 'SimpleStore',
            'from': 3, // a custom account
            'gas': 2900000, // some custom gas
          },
        },
      },
    },
  },
};
