

var Lich = angular.module('Lich', ['ngTagsInput','ngRoute']);




Lich.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/search', {
        templateUrl: 'search.html',
        controller: 'search'
      }).
      when('/checkout', {
        templateUrl: 'checkout.html',
        controller: 'checkout'
      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);