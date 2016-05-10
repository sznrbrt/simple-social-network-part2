'use strict';

var app = angular.module('socialApp');

app.controller('homeCtrl', function($scope, Users, $state, $auth, $localStorage) {
  console.log('homeCtrl');
  $scope.signUpPanel = false;
  $scope.newUser = {};
  $scope.logInPanel = false;
  $scope.logInInst = false;
  $scope.loginDetailsObj = {};

  $scope.authenticate = provider => {
    $auth.authenticate(provider)
    .then(function(res) {
        $localStorage.currentUser = res.data;
        $state.go('profilepage');
      })
      .catch(function(response) {
        // Something went wrong.
      });
  };

  $scope.login = function() {
    Users.login($scope.loginDetailsObj)
      .then((res) => {
        $state.go('profilepage');
      })
  }

  $scope.openSignup = function() {
    $scope.signUpPanel = true;
    $scope.logInPanel = false;
  }
  $scope.openLogin = function() {
    $scope.signUpPanel = false;
    $scope.logInPanel = true;
  }

  $scope.signup = function() {
    if(!$scope.newUser.profileImg) $scope.newUser.profileImg = "http://placehold.it/100x100";
    Users.signup($scope.newUser)
      .then((res) => {
        $scope.signUpPanel = false;
        $scope.newUser = {};
        $scope.logInPanel = true;
        $scope.logInInst = true;
      })
  }
});

app.controller('profilepageCtrl', function($scope, Users, $state, StoreData, $localStorage) {
  console.log('profilepageCtrl');
  $scope.myprofile = {};

  Users.loadprofile()
    .then((res) => {
      $scope.myprofile = res.data;
      if(!res.data.profileImg) $scope.myprofile.profileImg = "http://placehold.it/100x100";
    })

  $scope.logout = function() {
    Users.logout()
      .then((res) => {
        $state.go('home');
      })
  }

  $scope.editProfile = function() {
    StoreData.set($scope.myprofile);
    $state.go('editprofilepage')
  }

  $scope.acceptRequest = (id) => {
    var id2 = id;
    var id1 = $localStorage.currentUser;
    Users.acceptRequest(id1, id2)
      .then((res) => {
        Users.loadprofile()
          .then((res) => {
            $scope.myprofile = res.data;
            if(!res.data.profileImg) $scope.myprofile.profileImg = "http://placehold.it/100x100";
          })
      })
  }
  $scope.declineRequest = (id) => {
    var id2 = id;
    var id1 = $localStorage.currentUser;
    Users.declineRequest(id1, id2)
      .then((res) => {
        Users.loadprofile()
          .then((res) => {
            $scope.myprofile = res.data;
            if(!res.data.profileImg) $scope.myprofile.profileImg = "http://placehold.it/100x100";
          })
      })
  }
});

app.controller('editprofilepageCtrl', function($scope, Users, $state, StoreData) {
  console.log('editprofilepageCtrl');
  $scope.editedUser = StoreData.get();

  $scope.clearAndBack = () => {
    $state.go('profilepage');
  }

  $scope.logout = function() {
    Users.logout()
      .then((res) => {
        $state.go('home');
      })
  }

  $scope.edit = () => {
    var edtUser = $scope.editedUser;
    Users.editprofile(edtUser)
      .then((res) => {
        $state.go('profilepage');
      })
  }
});

app.controller('peopleCtrl', function($scope, Users, $state, StoreData) {
  console.log('peopleCtrl');

  $scope.people = [];
  Users.getPeople()
    .then((res) => {
      $scope.people = res.data;
    })

  $scope.logout = function() {
    Users.logout()
      .then((res) => {
        $state.go('home');
      })
  }

  $scope.openProfile = function(userId) {
    $state.go('person', {"userId": userId})
  }
});

app.controller('personCtrl', function($scope, Users, $state, StoreData, $stateParams, $localStorage) {
  console.log('personCtrl');

  function renderPage() {
    Users.getPerson($stateParams.userId)
    .then((res) => {
      $scope.person = res.data;
      $scope.isNotMyFriend = $scope.person.friends.filter((friend) => {
        return friend._id === $scope.currentUser;
      }).length === 0;
      $scope.isNotRequested = $scope.person.friendrequests.filter((friend) => {
        return friend === $scope.currentUser;
      }).length === 0;
    })
  }

  $scope.person = {};
  $scope.currentUser = $localStorage.currentUser;
  $scope.isNotMyFriend = true;
  renderPage();

  $scope.logout = function() {
    Users.logout()
      .then((res) => {
        $state.go('home');
      })
  }

  $scope.sendRequest = () => {
    Users.sendRequest($scope.currentUser, $scope.person._id)
      .then((res) => {
        console.log(res.data);
        renderPage();
      })
  }

  $scope.removeFriend = () => {
    var id1 = $scope.currentUser;
    var id2 = $scope.person._id;
    Users.removeFriend(id1, id2)
      .then((res) => {
        renderPage();
      })
  }
});
