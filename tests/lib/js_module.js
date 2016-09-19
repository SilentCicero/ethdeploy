'use strict';

// For geth
if (typeof dapple === 'undefined') {
  var dapple = {};
}

if (typeof web3 === 'undefined' && typeof Web3 === 'undefined') {
  var Web3 = require('web3');
}

dapple['tests'] = (function builder () {
  var environments = {};

  function ContractWrapper (headers, _web3) {
    if (!_web3) {
      throw new Error('Must supply a Web3 connection!');
    }

    this.headers = headers;
    this._class = _web3.eth.contract(headers.interface);
  }

  ContractWrapper.prototype.deploy = function () {
    var args = new Array(arguments);
    args[args.length - 1].data = this.headers.bytecode;
    return this._class.new.apply(this._class, args);
  };

  var passthroughs = ['at', 'new'];
  for (var i = 0; i < passthroughs.length; i += 1) {
    ContractWrapper.prototype[passthroughs[i]] = (function (passthrough) {
      return function () {
        return this._class[passthrough].apply(this._class, arguments);
      };
    })(passthroughs[i]);
  }

  function constructor (_web3, env) {
    if (!env) {
      env = {};
    }
    while (typeof env !== 'object') {
      if (!(env in environments)) {
        throw new Error('Cannot resolve environment name: ' + env);
      }
      env = environments[env];
    }

    if (typeof _web3 === 'undefined') {
      if (!env.rpcURL) {
        throw new Error('Need either a Web3 instance or an RPC URL!');
      }
      _web3 = new Web3(new Web3.providers.HttpProvider(env.rpcURL));
    }

    this.headers = {
      'SimpleStore': {
        'interface': [
          {
            'constant': false,
            'inputs': [
              {
                'name': '_value',
                'type': 'uint256'
              }
            ],
            'name': 'set',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [],
            'name': 'get',
            'outputs': [
              {
                'name': '',
                'type': 'uint256'
              }
            ],
            'type': 'function'
          }
        ],
        'bytecode': '606060405260978060106000396000f360606040526000357c01000000000000000000000000000000000000000000000000000000009004806360fe47b11460415780636d4ce63c14605757603f565b005b605560048080359060200190919050506078565b005b606260048050506086565b6040518082815260200191505060405180910390f35b806000600050819055505b50565b600060006000505490506094565b9056'
      },
      'SimpleStoreFactory': {
        'interface': [
          {
            'constant': false,
            'inputs': [],
            'name': 'createSimpleStore',
            'outputs': [
              {
                'name': '',
                'type': 'address'
              }
            ],
            'type': 'function'
          },
          {
            'inputs': [
              {
                'name': '_registry',
                'type': 'address'
              }
            ],
            'type': 'constructor'
          }
        ],
        'bytecode': '6060604052604051602080610195833981016040528080519060200190919050505b80600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b506101398061005c6000396000f360606040526000357c0100000000000000000000000000000000000000000000000000000000900480636d9070c2146037576035565b005b60426004805050606e565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b600060405160a780610092833901809050604051809103906000f09050608f565b9056606060405260978060106000396000f360606040526000357c01000000000000000000000000000000000000000000000000000000009004806360fe47b11460415780636d4ce63c14605757603f565b005b605560048080359060200190919050506078565b005b606260048050506086565b6040518082815260200191505060405180910390f35b806000600050819055505b50565b600060006000505490506094565b9056'
      },
      'SimpleStoreRegistry': {
        'interface': [
          {
            'constant': false,
            'inputs': [
              {
                'name': '_simpleStore',
                'type': 'address'
              }
            ],
            'name': 'register',
            'outputs': [],
            'type': 'function'
          },
          {
            'constant': true,
            'inputs': [
              {
                'name': '',
                'type': 'uint256'
              }
            ],
            'name': 'services',
            'outputs': [
              {
                'name': '',
                'type': 'address'
              }
            ],
            'type': 'function'
          },
          {
            'constant': false,
            'inputs': [
              {
                'name': '_serviceId',
                'type': 'uint256'
              }
            ],
            'name': 'getService',
            'outputs': [
              {
                'name': '',
                'type': 'address'
              }
            ],
            'type': 'function'
          },
          {
            'anonymous': false,
            'inputs': [
              {
                'indexed': false,
                'name': '_service',
                'type': 'address'
              },
              {
                'indexed': false,
                'name': '_serviceId',
                'type': 'uint256'
              }
            ],
            'name': 'ServiceRegistered',
            'type': 'event'
          }
        ],
        'bytecode': '6060604052610269806100126000396000f360606040526000357c0100000000000000000000000000000000000000000000000000000000900480634420e4861461004f578063c22c4f4314610067578063ef0e239b146100a95761004d565b005b61006560048080359060200190919050506100eb565b005b61007d60048080359060200190919050506101dd565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6100bf600480803590602001909190505061021f565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b7f4d1e8f2391b486da617ac19662a2e74b44dbb88223c32ac66162549b45e3097281600060005080549050604051808373ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a16000600050805480600101828181548183558181151161019a57818360005260206000209182019101610199919061017b565b80821115610195576000818150600090555060010161017b565b5090565b5b5050509190906000526020600020900160005b83909190916101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550505b50565b600060005081815481101561000257906000526020600020900160005b9150909054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000600060005082815481101561000257906000526020600020900160005b9054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050610264565b91905056'
      }
    };

    this.classes = {};
    for (var key in this.headers) {
      this.classes[key] = new ContractWrapper(this.headers[key], _web3);
    }

    this.objects = {};
    for (var i in env.objects) {
      var obj = env.objects[i];
      this.objects[i] = this.classes[obj['class']].at(obj.address);
    }
  }

  return {
    class: constructor,
    environments: environments
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = dapple['tests'];
}
