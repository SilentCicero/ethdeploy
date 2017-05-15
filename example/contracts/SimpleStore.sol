pragma solidity ^0.4.4;

contract SimpleStore {
  uint256 public store;

  function SimpleStore(uint256 _initialValue) {
    store = _initialValue;
  }

  function setStore(uint256 _value) public {
    store = _value;
  }

  function getValue() public constant returns (uint256) {
    return store;
  }
}
