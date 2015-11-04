stream = angular.module('angular-twitter-app', ['ngSocket', 'ngMaterial']).
  config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('blue')
      .accentPalette('green')
      .backgroundPalette('grey').dark();
  }).
  factory('$socket', function(socketFactory) {
    return socketFactory();
  });
