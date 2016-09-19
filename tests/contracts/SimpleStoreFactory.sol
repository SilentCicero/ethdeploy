import "SimpleStore.sol";
import "SimpleStoreRegistry.sol";


contract SimpleStoreFactory {
  function SimpleStoreFactory(address _registry) {
    registry = SimpleStoreRegistry(_registry);
  }

  function createSimpleStore() returns (address) {
    return address(new SimpleStore());
  }

  SimpleStoreRegistry registry;
}
