'use strict';

var app = angular.module('socialApp', ['ui.router', 'ui.bootstrap', 'satellizer']);

app.config(function($stateProvider, $urlRouterProvider, $authProvider){
  $authProvider.github({
    clientId: '48012540038bc7efae7f'
  });

  $authProvider.facebook({
    clientId: '477809465676872'
  });


  $stateProvider
    .state('home', {
      url:'/',
      templateUrl: '/html/home.html',
      controller: 'homeCtrl'
    })
    .state('profilepage', {
      url:'/profilepage',
      templateUrl: '/html/profilepage.html',
      controller: 'profilepageCtrl'
    })
    .state('editprofilepage', {
      url:'/editprofilepage',
      templateUrl: '/html/editprofilepage.html',
      controller: 'editprofilepageCtrl'
    })
    .state('people', {
      url:'/people',
      templateUrl: '/html/people.html',
      controller: 'peopleCtrl'
    })
    .state('person', {
      url:'/person',
      templateUrl: '/html/person.html',
      controller: 'personCtrl',
      params: {
          "userId": null
      }
    })

  $urlRouterProvider.otherwise('/');
});
