

var Lich = angular.module('Lich', ['ngTagsInput','ngRoute','ui.bootstrap']);

var baseURL = window.location.origin+window.location.pathname;



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
      when('/pca/:typeId', {
        templateUrl: 'pca.html',
        controller: 'pca'
      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);
