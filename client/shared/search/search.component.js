angular.module('searchPlace',['ui.bootstrap'])
  .component('searchPlace', {
    templateUrl: 'shared/search/search.template.html',
    controller: ['Search', 'Track', '$scope', 'placesOnMap', '$timeout', 'mapFactory', '$compile', 'Place', '$rootScope',
      function SearchCtrl(Search, Track, $scope, placesOnMap, $timeout, mapFactory, $compile, Place, $rootScope) {
      var ctrl=this;
      markers=[];
      //$rootScope.stopFlag=true;
      $scope.loading = false;
      $scope.noResults = false;
      $scope.minchars = false;
      var searchBy = 'place';
      var noname = 'http://homyachok.com.ua/images/noimage.png';
      $scope.showMarker=function(lat,lon, obj){

          var newIcon = L.icon({
          iconUrl: "assets/img/places/marker/search.png",
          iconSize: [55, 70],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [51, 51],
          shadowUrl: "assets/img/places/marker/marker-shadow_search.png",
          shadowAnchor: [-10, 13]
        });
        angular.element(document.querySelector('.activeSearchResult')).removeClass('activeSearchResult');
        obj.target.className="activeSearchResult";

        ctrl.markernew= _.filter(ctrl.markers, function(marker) {
          return marker._latlng.lat==lat&&marker._latlng.lng==lon;


        });

        if(ctrl.markernew){
            if(ctrl.markerOld){
              var oldIcon = ctrl.markernew[0].options.icon;
              ctrl.markerOld[0].setIcon(oldIcon);
              ctrl.markerOld[0].setZIndexOffset(5000);
            }
            ctrl.markernew[0].setZIndexOffset(10000);
            ctrl.markerOld=ctrl.markernew;
            ctrl.markernew[0].setIcon(newIcon);

          $timeout(function(){
            mapFactory.map.panTo(new L.LatLng(lat, lon), animate=true);}, 100);
        }
};
      angular.element(document.querySelector("body")),angular.element(document.querySelector("#map")).on('mousedown', function(){
        if(ctrl.markersarr){
          $timeout( function(){
            ctrl.markersarr[0].setIcon(oldIcon);
          }, 200);

        }
      });
      this.searchPlace = function(searchname) {
        if(ctrl.markers&&ctrl.markers.length!=0){
          for(i=0;i<ctrl.markers.length;i++) {
            mapFactory.map.removeLayer(ctrl.markers[i]);
          }

        }
        angular.element( document.querySelector( '#searchPlaces' ) ).empty();
        if(searchname.length>=3)
        {
        $scope.loading = true;
        Search.getList({name: [searchname], searchBy: [searchBy]}).then(function(resultPlaces) {
          ctrl.resultPlaces=resultPlaces;
          $scope.loading = true;
          searchBy = 'track';
          Search.getList({name: [searchname], searchBy: [searchBy]}).then(function(resultTracks) {
            ctrl.resultTracks = resultTracks;
            placesOnMap.removeAllTracks();
            placesOnMap.showTracks(resultTracks);
            $scope.loading = false;
            searchBy = 'place';
            if (ctrl.resultPlaces.length == 0 && ctrl.resultTracks.length == 0) {
            $scope.noResults = true;
            showSearchResault();
          }
            else{
              placesOnMap.removePlaces();
              ctrl.markers=showPlaces(ctrl.resultPlaces);
              showSearchResault(ctrl.resultPlaces);
            }
          });
        });
      }
        else{
        $scope.minchars = true;
        return [];
        }
    };
      function showSearchResault(resultPlaces){
        var strResult="";
        if(!resultPlaces)
          strResult+="<h2>Search resault: </h2><h3>There are no such places and tracks, try else please</h3>";
       else {
          strResult += "<h2>Search resault:</h2>";
          strResult += "<ul class='list-unstyled'>";
          resultPlaces.forEach(function(place) {
            var lat = place.location.coordinates[1];
            var lon = place.location.coordinates[0];
            strResult += "<li><a ng-mouseover='showMarker(" + lat + "," + lon + ",$event" + ")'" +
              "ng-href='#!/places/" + place.id + "' id='" + place.id + "'>" + place.name + "</a></li>";
          });
          strResult += "</ul>";
        }
        angular.element( document.querySelector( '#searchPlaces' ) ).append($compile(strResult)($scope));
      }

        function showPlaces (places) {
          places.forEach(function(place) {
            photo=place.photos[0];
            if(!place.photos[0])
             photo=noname;

              var iconmarker= "assets/img/places/marker/search.png";
              marker(place.location.coordinates[0], place.location.coordinates[1], iconmarker)
                .addTo(mapFactory.map)
                .bindPopup('<div class=\'popup  center-block\'><h3>' + place.name + '</h3><a>' +
                  '<img class=\'marker-image  center-block\' src=\''+ photo + '\' /></a>' +
                  '<br /><br /><button type=\'button\' class=\'btn btn-default btn-md center-block\'> ' +
                  '<a href=\'#!/places/' + place._id + '\'>Details >></a> ' +
                  '</button></div>', {autoPan: false});
            });
            mapFactory.map.closePopup();
            mapFactory.map.on('click move', function() {
            });

          return  markers;
        }

        var marker = function(lon, lat, iconmarker) {

          var newIcon = L.icon({
            iconUrl: "assets/img/places/marker/search.png",
            shadowUrl: 'assets/img/places/marker/marker-shadow.png',
            iconSize: [30, 46],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],

          });
          markerobj=L.marker([lat, lon], newIcon, zIndexOffset=50);
          markerobj.setIcon(newIcon);
          markerobj.setZIndexOffset(5000);
          markers.push(markerobj);
          return markerobj;

        };
      angular.element(document).ready(function () {
        angular.element(document).on('click', function () {

          $timeout(function(){
            $scope.noResults = false;
            $scope.minchars = false;
          },5000);
         $scope.$apply();
        });

      });
    }]
  });