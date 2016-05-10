'use strict';

var app = angular.module('socialApp');

app.service('Users', function($http, $localStorage) {

  this.signup = (newUserObj) => {
    return $http.post('./api/users/register', newUserObj);
  }
  this.login = (loginDetailsObj) => {
    return $http.post('./api/users/login', loginDetailsObj)
                .then((res) => {
                  $localStorage.currentUser = res.data;
                });
  }
  this.logout = (loginDetailsObj) => {
    return $http.delete('./api/users/logout', loginDetailsObj)
                .then((res) => {
                  $localStorage.currentUser = null;
                });
  }

  this.loadprofile = () => {
    return $http.get('./api/users/profile');
  }

  this.editprofile = (editedUserObj) => {
    return $http.put('./api/users/profile', editedUserObj);
  }

  this.getPeople = () => {
    return $http.get('./api/users/people');
  }

  this.getPerson = (id) => {
    return $http.get('./api/users/people/' + id);
  }

  this.sendRequest = (id1, id2) => {
    return $http.post(`./api/users/${id1}/friendRequest/${id2}`);
  }

  this.acceptRequest = (id1, id2) => {
    return $http.post(`./api/users/${id1}/acceptRequest/${id2}`);
  }

  this.declineRequest = (id1, id2) => {
    return $http.post(`./api/users/${id1}/declineRequest/${id2}`);
  }

  this.removeFriend = (id1, id2) => {
    return $http.post(`./api/users/${id1}/removeFriend/${id2}`);
  }

})

app.service('StoreData', function() {
  var storeData = {};
  this.get = () => { return storeData }
  this.set = (data) => { storeData = data }
})
