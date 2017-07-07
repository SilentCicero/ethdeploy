'use strict';

var dir = require('node-dir');
var fs = require('fs');
var path = require('path');
var ethUtil = require('ethjs-util');

/**
 * Returns the ISO current date time.
 *
 * @method isoTime
 * @return {String} ISOTime the ISO time string
 */
function isoTime() {
  return new Date().toISOString();
}

/**
 * Basic error method for ethdeploy
 *
 * @method isoTime
 * @param {String} msg the error message
 * @return {Object} Error the new Error object
 */
function log() {
  var _console;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return (_console = console).log.apply(_console, ['[ethdeploy ' + isoTime() + '] '].concat(args)); // eslint-disable-line
}

/**
 * Basic error method for ethdeploy
 *
 * @method isoTime
 * @param {String} msg the error message
 * @return {Object} Error the new Error object
 */
function error() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return new Error('[ethdeploy ' + isoTime() + '] ' + args.map(function (arg) {
    return arg;
  }));
}

// recursively converts all BN or BigNumber instances into string

/**
 * Converts all BigNumber and BN instances to string, even nested deep in Arrays or Objects.
 *
 * @method bnToString
 * @param {Optional} objInput optional input type, bypasses most
 * @param {Number} baseInput the base number (usually either 10 or 16).
 * @param {Boolean} hexPrefixed hex prefix the output
 * @return {Optional} output returns optional type output with converted bn's.
 */
function bnToString(objInput, baseInput, hexPrefixed) {
  var obj = objInput; // eslint-disable-line
  var base = baseInput || 10;

  // obj is an array
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      // convert items in array
      obj = obj.map(function (item) {
        return bnToString(item, base, hexPrefixed);
      });
    } else {
      if (obj.toString && (obj.lessThan || obj.dividedToIntegerBy || obj.isBN || obj.toTwos)) {
        return hexPrefixed ? '0x' + ethUtil.padToEven(obj.toString(16)) : obj.toString(base);
      } else {
        // eslint-disable-line
        // recurively converty item
        Object.keys(obj).forEach(function (key) {
          obj[key] = bnToString(obj[key], base, hexPrefixed);
        });
      }
    }
  }

  return obj;
}

/**
 * Filters a given sourcemap by specific test regex's.
 *
 * @method filterSourceMap
 * @param {Regex} testRegex the test regex (only include these files)
 * @param {Regex} includeRegex the include test regex (only include these files)
 * @param {Object} sourceMap the complete file sourcemap
 * @return {Object} filteredSourceMap the filtered sourcemap
 */
function filterSourceMap(testRegex, includeRegex, sourceMap, excludeRegex) {
  var outputData = Object.assign({});
  var testTestRegex = testRegex || /./g;
  var testIncludeRegex = includeRegex || /./g;
  var testExcludeRegex = excludeRegex || null;

  if (typeof testTestRegex !== 'object') {
    throw error('while filtering source map, ' + JSON.stringify(sourceMap) + ', test regex must be type object, got ' + typeof testRegex + '.');
  }
  if (typeof testIncludeRegex !== 'object') {
    throw error('while filtering source map, ' + JSON.stringify(sourceMap) + ', include regex must be type object, got ' + typeof testIncludeRegex + '.');
  }
  if (typeof testExcludeRegex !== 'object') {
    throw error('while filtering source map, ' + JSON.stringify(sourceMap) + ', exclude regex must be type object, got ' + typeof testExcludeRegex + '.');
  }

  Object.keys(sourceMap).forEach(function (key) {
    if (testTestRegex.test(key) && testIncludeRegex.test(key) && (testExcludeRegex === null || !testExcludeRegex.test(key))) {
      if (sourceMap[key]) {
        outputData[key] = sourceMap[key];
      }
    }
  });

  return outputData;
}

/**
 * This will wait for a transaction to present a receipt
 *
 * @method getTransactionSuccess
 * @param {Object} eth the eth query instance
 * @param {Object} txHash the transaction hash
 * @param {Object} timeout settings
 * @param {Function} callback the final callback
 * @callback {Object} contractInstance the deployed contract instance with receipt prop
 */
function getTransactionSuccess(eth, txHash) {
  var timeout = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 800000;
  var callback = arguments[3];

  var cb = callback || function cb() {};
  var count = 0;
  return new Promise(function (resolve, reject) {
    var txInterval = setInterval(function () {
      eth.getTransactionReceipt(txHash, function (err, result) {
        if (err) {
          clearInterval(txInterval);
          cb(err, null);
          reject(err);
        }

        if (!err && result) {
          clearInterval(txInterval);
          cb(null, result);
          resolve(result);
        }
      });

      if (count >= timeout) {
        clearInterval(txInterval);
        var errMessage = 'Receipt timeout waiting for tx hash: ' + txHash;
        cb(errMessage, null);
        reject(errMessage);
      }
      count += 7000;
    }, 7000);
  });
}

/**
 * Deploy the contract with eth, factory, and args
 *
 * @method deployContract
 * @param {Object} eth the eth query instance
 * @param {Object} factory the contract factory
 * @param {Array} args the contract constructor arguments
 * @param {Function} callback the final callback
 * @callback {Object} contractInstance the deployed contract instance with receipt prop
 */
function deployContract(eth, factory, args, callback) {
  factory['new'].apply(factory, args).then(function (txHash) {
    getTransactionSuccess(eth, txHash, 8000000, function (receiptError, receipt) {
      if (receiptError) {
        callback(receiptError, null);
      }

      if (receipt) {
        var contractInstance = factory.at(receipt.contractAddress);
        contractInstance.receipt = receipt;
        callback(null, contractInstance);
      }
    });
  })['catch'](callback);
}

/**
 * Get all input source for a specific pathname, used for mapping config entry
 *
 * @method getInputSources
 * @param {String} pathname a path string to a file or directory
 * @param {Function} callback the final callback that returns the sources
 * @callback {Object} sourceMap returns a source map for this pathname
 */
function getInputSources(pathname, callback) {
  var filesRead = 0;
  var sources = {};

  // test file is a file, the last section contains a extention period
  if (String(pathname).split('/').pop().indexOf('.') !== -1) {
    (function () {
      var searchPathname = pathname.substr(0, 2) === './' ? pathname.slice(2) : pathname;

      fs.readFile(searchPathname, 'utf8', function (readFileError, fileData) {
        var _callback;

        // eslint-disable-line
        if (readFileError) {
          return callback(error('while while getting input sources ' + readFileError));
        }

        callback(null, (_callback = {}, _callback[searchPathname] = fileData, _callback));
      });
    })();
  } else {
    // get all file names
    dir.files(pathname, function (filesError, files) {
      // eslint-disable-line
      if (filesError) {
        return callback(error('while while getting input sources ' + filesError));
      }

      // if no files in directory, then fire callback with empty sources
      if (files.length === 0) {
        callback(null, sources);
      } else {
        // read all files
        dir.readFiles(pathname, function (readFilesError, content, filename, next) {
          var _Object$assign;

          // eslint-disable-line
          if (readFilesError) {
            return callback(error('while getting input sources ' + readFilesError));
          }

          // add input sources to output
          sources = Object.assign({}, sources, (_Object$assign = {}, _Object$assign[path.join('./', filename)] = content, _Object$assign));

          // increase files readFiles
          filesRead += 1;

          // process next file
          if (filesRead === files.length) {
            callback(null, sources);
          } else {
            next();
          }
        });
      }
    });
  }
}

// the base utilty methods for ethdeploy
module.exports = {
  isoTime: isoTime,
  error: error,
  log: log,
  deployContract: deployContract,
  filterSourceMap: filterSourceMap,
  getInputSources: getInputSources,
  bnToString: bnToString
};