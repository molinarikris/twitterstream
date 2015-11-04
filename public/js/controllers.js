stream.controller('mainCtrl', function($socket, $scope, $http, $timeout, $mdSidenav, $mdUtil, $mdToast) {

  // Set up the sockets and forward the tweets to
  // our local event handler.

  $socket.forward(['tweet', 'error', 'new-criteria', 'remove-criteria']);

  // End Point Related Methods and Functions

  // "/sets" GET End Point

  $scope.$on('socket:tweet', function(e, data) {
    if (data.msg == "test") {
      if ($scope.sets) {
        $scope.tweets = [];
        $scope.tweets.unshift({
          user: {
            screen_name: "Mister_Error",
            profile_image_url: "https://images.duckduckgo.com/iu/?u=http%3A%2F%2Fravingroo.com%2Fwp-content%2Fuploads%2F2013%2F05%2Fmr-bill.jpg&f=1"
          },
          text: "Our servers just reset! We're resetting the stream now.",
          created_at: Date.now()
        });
      }
      $scope.sets = {};
      $http.get('/sets').then(function(res) {
        $scope.sets = res.data;
        $scope.verbs = Object.keys(res.data);
        $timeout(function() {
          $scope.tweets.unshift(data);
        }, 3000);
      }, function(res) {
        if (res) {
          alert("Something fucked up!\n" + res);
        }
      });
    } else {
      if ($scope.tweets.length >= 25) {
        $scope.tweets.pop();
      }
      $scope.tweets.unshift(data);
    }
  });
  $scope.$on('socket:new-criteria', function(e, obj) {
    if (!($scope.sets[obj.verb].indexOf(obj.noun) + 1)) {
      $scope.sets[obj.verb].push(obj.noun);
    }
  });
  $scope.$on('socket:remove-criteria', function(e, obj) {
    console.log(obj);
    $scope.sets[obj.verb] = $scope.sets[obj.verb].filter(function(el) {
      if (el == obj.noun) { return false; } else { return true;}
    });
  })

  // '/newThing' POST End Point

  $scope.newThing = function(method, noun) {

    $http.post('/newThing', {
      participle: method,
      noun: noun
    }).then(function(res) {
    }, function(res) {
      alert("Uh oh!\n" + res);
    });
    return noun;
  };

  // '/removeThing' POST End Point

  $scope.stopThing = function(method, noun) {
    $http.post('/removeThing', {
      verb: method,
      noun: noun
    }).then(function(res) {
    }, function(res) {
      alert("Uh Oh!\n" + res)
    });
  };

  $scope.$on('socket:error', function(e, err) {
    alert("Socket Error!\n" + err)
  });
  $scope.tweets = [];
  $scope.isNavActive = function(elem) {
    if ($scope.navActive == elem) {
      return "active";
    } else {
      return "";
    }
  };
  $scope.makeActive = function(elem) {
    $scope.navActive = elem;
  };
  $scope.toggle = function(side) {
    $mdSidenav(side).toggle();
  };
  $scope.close = function(side) {
    $mdSidenav(side).close();
  };
  $scope.adjustHeight = function() {
    return {
      height: window.innerHeight
    };
  };
  $scope.placeholder = function(verb) {
    if (verb == "following") {
      return "Follow a user."
    } else {
      return "Track a phrase."
    }
  }
});
