angular.module('placeList', ['filterMapType', 'popularTracks'])
  .component('placeList', {
    templateUrl: 'components/place/place-list/place-list.template.html',
    controller: ['placesOnMap', 'mapMarkingTypes', 'Place', 'Track', 'currentUser', 'constants', 'Restangular', '$scope',
      function(placesOnMap, mapMarkingTypes, Place, Track, currentUser, constants, Restangular, $scope) {
        var places = [];
        var tracks = [];
        var counter;
        var typesLength;
        var addTrackForm = angular.element('form[name="trackMaker"]');
        var ctrl = this;
        ctrl.addPlaceMenuIsOpen = false;
        ctrl.addTrackMenuIsOpen = false;

        ctrl.user = currentUser;

        // -----START ADD Place-----
        ctrl.newPlace = angular.copy(constants.emptyPlaceModel);
        ctrl.newPlaceType = '';
        ctrl.newPlacePhoto = '';
        ctrl.formNewPlaceSubmitted = false;

        ctrl.toggleAddPlaceMenu = function() {
          if (ctrl.addPlaceMenuIsOpen) {
            placesOnMap.closeAddPlaceMenu();
            ctrl.addPlaceMenuIsOpen = false;
          } else {
            placesOnMap.openAddPlaceMenu();
            ctrl.addPlaceMenuIsOpen = true;
          }
        };

        ctrl.createNewPlace = function(form) {
          var addPlaceForm = angular.element('form[name="placeMaker"]');
          var checkActiveType;
          var newPlaces = [];
          ctrl.coordsIsDefined = placesOnMap.coordsIsDefined;
          ctrl.formNewPlaceSubmitted = true;
          if (addPlaceForm.hasClass('ng-valid') && placesOnMap.coords) {
            ctrl.newPlace.type = ctrl.newPlaceType;
            ctrl.newPlace.owner = ctrl.user._id; // TODO: move into server-side
            ctrl.newPlace.location.coordinates = placesOnMap.coords;
            newPlaces.push(ctrl.newPlace);
            Restangular.oneUrl('location', 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + placesOnMap.coords[1] +
            '&lon=' + placesOnMap.coords[0] + '&addressdetails=0&zoom=10').get().then(function(result) {
              ctrl.newPlace.address = result.display_name;
              Place.post(ctrl.newPlace).then(function() {
                checkActiveType = angular.element('#' + ctrl.newPlace.type + ' span');
                if (checkActiveType.hasClass(constants.checkedClass)) {
                  placesOnMap.showPlaces(newPlaces);
                } else {
                  ctrl.checkType(ctrl.newPlace.type);
                }
                ctrl.resetAddPlaceForm(form);
              });
            });
          }
        };

        ctrl.resetAddPlaceForm = function(form) {
          var newPlaceLongitude = angular.element('#longitude');
          var newPlaceLatitude = angular.element('#latitude');
          if (form) {
            ctrl.newPlace = angular.copy(constants.emptyPlaceModel);
            ctrl.newPlaceType = '';
            form.$setPristine();
            form.$setUntouched();
            ctrl.formNewPlaceSubmitted = false;
            newPlaceLongitude.text('');
            newPlaceLatitude.text('');
            placesOnMap.coords = [];
            placesOnMap.coordsIsDefined = false;
            placesOnMap.removeNewMarker();
          }
        };
        // -----END ADD Place-----

        // -----START ADD Track-----
        ctrl.newTrack = angular.copy(constants.emptyTrackModel);
        ctrl.formNewTrackSubmitted = false;
        ctrl.addPointMenuIsOpen = false;
        ctrl.newPoint = angular.copy(constants.emptyPlaceModel);
        var newTrack;
        var newPointForTrack;
        var placesForTrack = [];
        var newPointsForTrack = [];

        ctrl.toggleAddTrackMenu = function() {
          var map = placesOnMap.map;
          if (ctrl.addTrackMenuIsOpen) {
            ctrl.addTrackMenuIsOpen = false;
            map.off('click', addNewTrackPoint);
            for (var key in placesOnMap.places) {
              placesOnMap.places[key].forEach(function(place) {
                place.off('click', addExistingPointIntoNewTrack);
              });
            }
          } else {
            ctrl.addTrackMenuIsOpen = true;
            map.on('click', addNewTrackPoint);
            for (var key2 in placesOnMap.places) {
              placesOnMap.places[key2].forEach(function(place) {
                place.on('click', addExistingPointIntoNewTrack);
              });
            }
          }
        };

        function addExistingPointIntoNewTrack() {
          var map = placesOnMap.map;
          var existingPoint = {
            name: '',
            _id: '',
            location: {
              coordinates: []
            }
          };
          placesForTrack.push([this._latlng.lat, this._latlng.lng]);
          existingPoint.name = this.name;
          existingPoint._id = this._id;
          existingPoint.location.coordinates[0] = this._latlng.lng;
          existingPoint.location.coordinates[1] = this._latlng.lat;
          placesOnMap.newTrackPoints.push([existingPoint]);
          ctrl.newTrackPoints = placesOnMap.newTrackPoints;
          addNewTrackOnMap(placesForTrack);
          if (newPointForTrack) {
            map.removeLayer(newPointForTrack);
          }
          console.log(placesOnMap.newTrackPoints);
          $scope.$digest();
        }

        function addNewTrackPoint(e) {
          var map = placesOnMap.map;
          ctrl.addPointMenuIsOpen = true;
          ctrl.newPoint.location.coordinates[0] = e.latlng.lng;
          ctrl.newPoint.location.coordinates[1] = e.latlng.lat;
          if (newPointForTrack) {
            map.removeLayer(newPointForTrack);
          }
          addNewPointOnMap(e.latlng.lat, e.latlng.lng);
          $scope.$digest();
        }

        function addNewTrackOnMap(points) {
          var map = placesOnMap.map;
          if (newTrack) {
            map.removeLayer(newTrack);
          }
          newTrack = L.polyline(points, {
            color: '#000',
            opacity: 1
          }).addTo(map);
        }

        function addNewPointOnMap(lat, lon) {
          var map = placesOnMap.map;
          newPointForTrack = L.marker([lat, lon]).addTo(map);
        }

        ctrl.createNewPointForTrack = function(form) {
          if (ctrl.newPoint.name && ctrl.newPoint.type) {
            ctrl.newPoint.owner = ctrl.user._id;
            placesOnMap.newTrackPoints.push([ctrl.newPoint]);
            placesForTrack.push([ctrl.newPoint.location.coordinates[1], ctrl.newPoint.location.coordinates[0]]);
            ctrl.newTrackPoints = placesOnMap.newTrackPoints;
            console.log(placesOnMap.newTrackPoints);
            addNewTrackOnMap(placesForTrack);
            ctrl.addPointMenuIsOpen = false;
            ctrl.newPoint = angular.copy(constants.emptyPlaceModel);
            newPointsForTrack.push(newPointForTrack);
            newPointForTrack = null;
          }
        };

        ctrl.createNewTrack = function(form) {
          var addTrackForm = angular.element('form[name="trackMaker"]');
          var checkActiveType;
          ctrl.formNewTrackSubmitted = true;
          if (addTrackForm.hasClass('ng-valid')) {
            ctrl.newTrack.owner = ctrl.user._id;
            placesOnMap.newTrackPoints.forEach(function(point, index) {
            var newPoints = [];
              if (point[0]._id) {
                ctrl.newTrack.places.push(point[0]._id);
              } else {
                newPoints.push(point[0]);
                Restangular.oneUrl('location', 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + point[0].location.coordinates[1] +
                '&lon=' + point[0].location.coordinates[0] + '&addressdetails=0&zoom=10').get().then(function(result) {
                  point[0].address = result.display_name;
                  console.log(point);
                  Place.post(point[0]).then(function(response) {
                    console.log(response);
                    ctrl.newTrack.places.push(response.record._id);
                    checkActiveType = angular.element('#' + point[0].type + ' span');
                    if (checkActiveType.hasClass(constants.checkedClass)) {
                      placesOnMap.showPlaces(newPoints);
                    } else {
                      ctrl.checkType(point[0].type);
                    }
                    if (index == placesOnMap.newTrackPoints.length - 1) {
                      addNewTrackIntoDB(ctrl.newTrack);
                    }
                  });
                });
              }
            });
            ctrl.resetAddTrackForm(form);
          }
        };

        function addNewTrackIntoDB(object) {
          console.log(object);
        }

        ctrl.resetAddTrackForm = function(form) {
          var map = placesOnMap.map;
          newPointsForTrack.forEach(function(point) {
            map.removeLayer(point);
          });
          /* if (form) {
            ctrl.newTrack = angular.copy(constants.emptyTrackModel);
            ctrl.newTrackType = '';
            form.$setPristine();
            form.$setUntouched();
            ctrl.formNewTrackSubmitted = false;
          }*/
        };
        // -----END ADD Track-----

        ctrl.placesType = mapMarkingTypes.places;
        typesLength = Object.keys(ctrl.placesType).length;
        placesOnMap.removePlaces();
        placesOnMap.showMap();
        placesOnMap.initGroupsOfPlaces(ctrl.placesType);

        // ---START---- ShowPlacesOnLoad
        // TODO: Move this inside resolve
        Place.getList({type: constants.placesOnLoad}).then(function(result) {
          counter = 1;
          places = result.concat(places);
          placesOnMap.showPlaces(result, constants.placesOnLoad);
          if (ctrl.addTrackMenuIsOpen) {
            placesOnMap.places[constants.placesOnLoad].forEach(function(place) {
              place.on('click', addExistingPointIntoNewTrack);
            });
          }
          angular.element('#' + constants.placesOnLoad + ' span').addClass(constants.checkedClass);
          angular.element('#Streets span').addClass(constants.checkedClass);
        });
        // ----END---- ShowPlacesOnLoad

        // ----START---- FilterByOneOfType
        ctrl.checkType = function(input) {
          var spanCheck = angular.element('#' + input + ' span');
          if (spanCheck.hasClass(constants.checkedClass)) {
            counter--;
            spanCheck.removeClass(constants.checkedClass);
            angular.element('#all span').removeClass(constants.checkedClass);
            if (ctrl.addTrackMenuIsOpen) {
              placesOnMap.places[input].forEach(function(place) {
                place.off('click', addExistingPointIntoNewTrack);
              });
            }
            placesOnMap.removePlaces(input);
            places = places.filter(function(place) {
              return place.type != input;
            });
          } else {
            counter++;
            spanCheck.addClass(constants.checkedClass);

            if (counter == typesLength)
              angular.element('#all span').addClass(constants.checkedClass);

            Place.getList({type: input}).then(function(result) {
              places = result.concat(places);
              placesOnMap.showPlaces(result, input);
              if (ctrl.addTrackMenuIsOpen) {
                placesOnMap.places[input].forEach(function(place) {
                  place.on('click', addExistingPointIntoNewTrack);
                });
              }
            });
          }
        };
        // ----END---- FilterByOneOfType

        // ----START---- FilterCheckAll
        ctrl.checkAll = function() {
          var spanCheck = angular.element('#all span');
          if (spanCheck.hasClass(constants.checkedClass)) {
            counter = 0;
            angular.element('.placeFilter a span').removeClass(constants.checkedClass);
            for (key in placesOnMap.places) {
              if (ctrl.addTrackMenuIsOpen) {
                placesOnMap.places[key].forEach(function(place) {
                  place.off('click', addExistingPointIntoNewTrack);
                });
              }
            }
            placesOnMap.removePlaces();
            places = [];
          } else {
            counter = typesLength;
            placesOnMap.removePlaces();
            places = [];
            angular.element('.placeFilter a span').addClass(constants.checkedClass);

            Place.getList().then(function(result) {
              places = result.concat(places);
              placesOnMap.showPlaces(places);
              for (key in placesOnMap.places) {
                if (ctrl.addTrackMenuIsOpen) {
                  placesOnMap.places[key].forEach(function(place) {
                    place.on('click', addExistingPointIntoNewTrack);
                  });
                }
              }
            });
          }
        };
        // ----END---- FilterCheckAll

        ctrl.places = places;

        // Don't hide dropdown if clicked
        angular.element('.dropdownFilter').on({
          'click': function(e) {
            e.stopPropagation();
          }
        });

        // *** START tracks controller ***
        var activeLiCounter = Object.keys(mapMarkingTypes.tracks).length;

        ctrl.tracksType = mapMarkingTypes.tracks;
        Track.getList().then(function(result) {
          tracks = result;
          placesOnMap.showTracks(tracks);
        });

        ctrl.showSpecificTracks = function(tracksType) {
          var element = angular.element('#' + tracksType);
          var checkedIcon = angular.element('#gi' + tracksType);
          var allGI = angular.element('#tracks-filter li span.glyphicon');
          var checkAllElement = angular.element('#all-tracks');

          if (element.hasClass('active')) {
            element.removeClass('active');
            checkedIcon.removeClass('glyphicon-ok');
            activeLiCounter -= 1;
            if (activeLiCounter === 0) {
              allGI.removeClass('glyphicon-ok');
              checkAllElement.removeClass('active');
            }
            placesOnMap.removeTracks(tracksType);
          } else {
            element.addClass('active');
            checkedIcon.addClass('glyphicon-ok');
            activeLiCounter++;
            if (activeLiCounter === 4) {
              allGI.addClass('glyphicon-ok');
              checkAllElement.addClass('active');
            }
            Track.getList({type: tracksType}).then(function(result) {
              tracks = result;
              placesOnMap.showTracks(tracks);
            });
          }
        };

        ctrl.checkAllTracks = function() {
          var checkAllElement = angular.element('#all-tracks');
          var allLiElements = angular.element(document).find('#tracks-filter li > a');
          var allGI = angular.element('#tracks-filter li span.glyphicon');
          if (checkAllElement.hasClass('active')) {
            allLiElements.removeClass('active');
            allGI.removeClass('glyphicon-ok');
            activeLiCounter = 0;
            placesOnMap.removeAllTracks();
          } else {
            allLiElements.addClass('active');
            allGI.addClass('glyphicon-ok');
            activeLiCounter = 4;
            Track.getList().then(function(result) {
              tracks = result;
              placesOnMap.showTracks(tracks);
            });
          }
        };
        // *** END tracks controller ***
      }]
  });
