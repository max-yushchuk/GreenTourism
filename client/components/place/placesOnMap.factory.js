angular.module('mapModule')
  .factory('placesOnMap', ['mapFactory', 'mapMarkingTypes', function(mapFactory, mapMarkingTypes) {
    var placesOnMap = {};
    var mainGroup = L.markerClusterGroup
      .layerSupport({showCoverageOnHover: false});
    var groups = [];
    var types = [];
    var places = [];
    var groupeE = [];
    var map;

    var marker = function(lon, lat, icon) {
      return L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: icon,
          shadowUrl: 'assets/img/places/marker/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        })
      });
    };

    placesOnMap.showMap = function() {
      map = mapFactory.showMap();
    };

    placesOnMap.initGroupsOfPlaces = function(inpTypes) {
      types = inpTypes;
      for (var key in types) {
        if ({}.hasOwnProperty.call(types, key)) {
          groups[key] = L.layerGroup();
        }
      }
    };

    placesOnMap.showPlaces = function(places, input) {
      mainGroup.addTo(map);
      if (input) {
        places.forEach(function(place) {
          marker(place.location.coordinates[0], place.location.coordinates[1], types[input].icon)
            .addTo(groups[input])
            .bindPopup('<div class=\'popup  center-block\'><h3>' + place.name + '</h3><a><img class=\'marker-image\' src=\'assets/' + place.photos[0] + '\' \/></a>' +
              '<br /><br /><button type=\'button\' class=\'btn btn-default btn-md center-block\'> <a href=\'#!/places/' + place._id + '\'>Details >></a> </button></div>', {autoPan: false});
        });
        mainGroup.checkIn(groups[input]);
        groups[input].addTo(map);
      } else {
        places.forEach(function(place) {
          marker(place.location.coordinates[0], place.location.coordinates[1], types[place.type].icon)
            .addTo(groups[place.type])
            .bindPopup('<div class=\'popup  center-block\'><h3>' + place.name + '</h3><a><img class=\'marker-image\' src=\'assets/' + place.photos[0] + '\' \/></a>' +
              '<br /><br /><button type=\'button\' class=\'btn btn-default btn-md center-block\'> <a href=\'#!/places/' + place._id + '\'>Details >></a> </button></div>', {autoPan: false});
        });
        for (var key in types) {
          mainGroup.checkIn(groups[key]);
          groups[key].addTo(map);
        }
      }

      map.on('click move', function() {
        map.closePopup();
      });
    };

    placesOnMap.removePlaces = function(input) {
      if (input) {
        mainGroup.checkOut(groups[input]);
        groups[input].clearLayers();
      } else {
        for (var key in types) {
          mainGroup.checkOut(groups[key]);
          groups[key].clearLayers();
        }
      }
    };

    /* ** START tracks factory ** */
    var tracks = [];
    var trackForAdding;
    var polyline = function(trackPoints, color) {
      return L.polyline(trackPoints, {
        color: color,
        opacity: 1
      });
    };

    var addTrack = function(track) {
      var color = mapMarkingTypes.tracks[track.type].color;
      var coordsArray = [];
      track.places.forEach(function(place, index) {
        var coords = [];
        coords[0] = place.location.coordinates[1];
        coords[1] = place.location.coordinates[0];
        coordsArray[index] = coords;
      });
      trackForAdding = polyline(coordsArray, color).addTo(map);
      tracks.push([trackForAdding, track.type]);
    };

    var removeTrack = function(track) {
      if (this == 'all') {
        map.removeLayer(track[0]);
      } else {
        if (track[1] == this) {
          map.removeLayer(track[0]);
        }
      }
    };

    placesOnMap.showTracks = function(tracksArray) {
      tracksArray.forEach(addTrack);
    };

    placesOnMap.removeTracks = function(tracksType) {
      tracks.forEach(removeTrack, tracksType);
    };

    placesOnMap.removeAllTracks = function() {
      tracks.forEach(removeTrack, 'all');
    };

    /* ** START add place factory ** */
    var newMarker;
    placesOnMap.openAddPlaceMenu = function() {
      map.on('click', addNewPlaceOnMap);
    };

    placesOnMap.closeAddPlaceMenu = function() {
      map.off('click', addNewPlaceOnMap);
    };

    placesOnMap.initGroupsOfEvents = function(inpTypes) {
        var type = inpTypes;
        for (var key in type) {
          if ({}.hasOwnProperty.call(type, key)) {
            groupeE[key] = L.layerGroup();
          }
        }
      };

/*    $scope.marker_click = function(id) {
      location.href = '#!/events/' + id;
    };*/

    placesOnMap.showEvents = function(events, input) {
      var pix = mapMarkingTypes.events[input].icon;
          //console.log(events);
          //console.log(input);
      events.forEach(function(event) {
        console.log(event.location.coordinates[0]+' - '+ event.location.coordinates[1] + ' ' + pix+ ' event.photos[0]=' +event.photos[0]);

        marker(event.location.coordinates[1], event.location.coordinates[0], pix)
        .addTo(groupeE[input])
        .bindPopup('<div class=\'popup  center-block\'><h3>' + event.name + '</h3><a><img class=\'marker-image\' src=\'assets/' + event.photo[0] + '\' \/></a>' +
                '<br /><br /><button type=\'button\' class=\'btn btn-default btn-md center-block\'> <a href=\'#!/events/' + event._id + '\'>Details >></a> </button></div>', {autoPan: false});


/*          .on('click', function onClick(e) {

          $scope.marker_click(this._id);
        });*/
        ;
       }) ;

      /*


      */


       console.log('On map: ') ;
       console.log(groupeE[input]) ;
      groupeE[input].addTo(map);
     } ;

      placesOnMap.removeEvents = function(input) {
        if (input) {
          console.log('Del from map: ') ;
          console.log(groupeE) ;
          //mainGroup.checkOut(groups[input]);
          groupeE[input].clearLayers();
          //map.removeLayer(newMarker);
        } else {
          for (var key in types) {
           // mainGroup.checkOut(groups[key]);
           groupeE[input].clearLayers();
          }
        }
      };

    function addNewPlaceOnMap(e) {
      var latitudeContainer = angular.element('#latitude');
      var longitudeContainer = angular.element('#longitude');
      placesOnMap.coords = [e.latlng.lng, e.latlng.lat];
      placesOnMap.coordsIsDefined = true;
      if (newMarker) {
        map.removeLayer(newMarker);
      }
      newMarker = L.marker([placesOnMap.coords[1], placesOnMap.coords[0]]).addTo(map);
      latitudeContainer.text('Latitude: ' + newMarker._latlng.lat);
      longitudeContainer.text('Longitude: ' + newMarker._latlng.lng);
    }

    placesOnMap.removeNewMarker = function() {
      if (newMarker) {
        map.removeLayer(newMarker);
      }
    };

    return placesOnMap;
  }]);
