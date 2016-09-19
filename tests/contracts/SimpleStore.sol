

contract SimpleStore {

  function set(uint _value) {
    store = _value;
  }

  function get() returns (uint) {
    return store;
  }

  uint store;
}
