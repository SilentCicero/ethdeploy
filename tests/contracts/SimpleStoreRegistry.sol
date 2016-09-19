

contract SimpleStoreRegistry {
  function register(address _simpleStore) {
    ServiceRegistered(_simpleStore, services.length);
    services.push(_simpleStore);
  }

  function getService(uint _serviceId) returns (address) {
    return services[_serviceId];
  }

  address[] public services;

  event ServiceRegistered(address _service, uint _serviceId);
}
