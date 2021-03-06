angular.module('greenTourism').config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('!');
    $routeProvider.caseInsensitiveMatch = true;

    $routeProvider
      .when('/', {
        template: '<welcome-page></welcome-page>'
      })
      .when('/profile', {
        template: '<user-profile user="$resolve.user"></user-profile>',
        resolve: {
          user: ['User', 'currentUser', '$location',
            function getPlace(User, currentUser, $location) {
              if (currentUser) {
                return User.one(currentUser._id).get()
                  .then(function(user) {
                    return user;
                  });
              }
              $location.path('/');
            }
          ]
        }
      })
      .when('/places', {
        template: '<place-list></place-list>'
      })
      .when('/places/:placeId', {
        template: '<place-detail place="$resolve.place"></place-detail>',
        resolve: {
          place: ['$route', 'Place', function getPlace($route, Place) {
            return Place.one($route.current.params.placeId).get()
              .then(function(place) {
                return place;
              });
          }]
        }
      })
      .when('/tracks/:trackId', {
        template: '<track-detail track="$resolve.track"></track-detail>',
        resolve: {
          track: ['$route', 'Track', function getPlace($route, Track) {
            return Track.one($route.current.params.trackId).get()
              .then(function(track) {
                return track;
              });
          }]
        }
      })
      .when('/events', {
        template: '<event-list></event-list>'
      })
      .when('/events/:eventId', {
        template: '{{ctrl.eventId}}<event-detail></event-detail>'
      })
      .when('/editevent/:eventId', {
       template: '<edit-event></edit-event>'
      })
      .when('/blog', {
        template: '<blog-list blogs="$resolve.blogs"></blog-list>',
        resolve: {
          blogs: ['Blog', function BlogListController(Blog) {
            return Blog.getList().then(function(blogs) {
              return blogs;
            });
          }]
        }
      })
      .when('/blog/:selector/:id', {
        template: '<blog-list blogs="$resolve.blogs"></blog-list>',
        resolve: {
          blogs: ['$route', 'Blog', function BlogListController($route , Blog) {
            var myId = $route.current.params.id;
            var mySelector = $route.current.params.selector;
            var params = {};
            params[mySelector] = myId;
            return Blog.getList(params).then(function(blogs) {
              return blogs;
            });
          }]
        }
      })
      .when('/blog/:blogId', {
        template: '<blog-detail blog="$resolve.blog"></blog-detail>',
        resolve: {
          blog: ['$route', 'Blog', function BlogDetailController($route, Blog) {
            return Blog.one($route.current.params.blogId).get()
              .then(function(blog) {
                return blog;
              });
          }]
        }
      })
      .otherwise({
        templateUrl: 'shared/errors/404.html'
      });
  }]);
