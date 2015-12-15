

var Lich = angular.module('Lich', ['ngTagsInput','ngRoute','ui.bootstrap']);

var baseURL = window.location.origin+window.location.pathname;

Lich.config(['tagsInputConfigProvider',function(tagsInputConfigProvider) {
  tagsInputConfigProvider.setDefaults('tagsInput', { placeholder: '' });
  tagsInputConfigProvider.setActiveInterpolation('tagsInput', { placeholder: true });
}]);



Lich.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/search', {
        templateUrl: 'search.html',
        controller: 'search'
      }).
      when('/search/:tags',{
        templateUrl: 'search.html',
        controller: 'search'
      }).
      when('/checkout', {
        templateUrl: 'checkout.html',
        controller: 'checkout'
      }).
      when('/scatter/:typeId', {
        templateUrl: 'scatter.html',
        controller: 'scatter'
      }).
      when('/help',{

      }).
      otherwise({
        redirectTo: '/search'
      });
  }]);
