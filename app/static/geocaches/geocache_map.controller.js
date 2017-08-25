(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheMapCtrl', GeocacheMapCtrl);

    GeocacheMapCtrl.$inject = ['$scope', '$timeout', 'GeocacheService'];
    function GeocacheMapCtrl($scope, $timeout, GeocacheService) {
        var icon_size = 36;

        var marker_trans = {
            'Traditional Cache':        'static/images/marker/traditional.svg',
            'Letterbox Hybrid':         'static/images/marker/letterbox.svg',
            'Event Cache':              'static/images/marker/event.svg',
            'Multi-cache':              'static/images/marker/multi.svg',
            'Wherigo Cache':            'static/images/marker/wherigo.svg',
            'Mega-Event Cache':         'static/images/marker/mega.svg',
            'Unknown Cache':            'static/images/marker/unknown.svg',
            'Earthcache':               'static/images/marker/earth.svg',
            'Cache In Trash Out Event': 'static/images/marker/cito.svg',
            'Virtual Cache':            'static/images/marker/virtual.svg',
            'GPS Adventures Exhibit':   'static/images/marker/adventures.svg',
            'Webcam Cache':             'static/images/marker/webcam.svg',
            'Project APE Cache':        'static/images/marker/ape.svg',
            'Locationless Cache':       'static/images/marker/locationless.svg',
            'Giga-Event Cache':         'static/images/marker/giga.svg',
        };

        var vm = this;
        vm.centroid = {
            lat: 0,
            lng: 0,
            zoom: 1
        };
        var centroid_marker = {
            latlngs: [vm.centroid.lat, vm.centroid.lng],
            color: '#0000ff',
            radius: 30,
            weight: 1,
            opacity: 1,
            type: 'circleMarker',
            layer: 'centroid'
        }
        vm.markers = {};
        vm.pathes = {};
        var pathes = {};
        vm.layers = {
            baselayers: {
                osm: {
                    name: "OpenStreetMap",
                    type: "xyz",
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    layerOptions: {
                        continuousWorld: false,
                    }
                }
            },
            overlays: {
                geocaches: {
                    name: "Geocaches",
                    type: "markercluster",
                    visible: true,
                    layerOptions: {
                        disableClusteringAtZoom: 14,
                        spiderfyOnMaxZoom: false
                    }
                },
                centroid: {
                    name: "Show Map Center",
                    type: "group",
                    visible: true
                },
                circles: {
                    name: "Minimum Geocache Clearance",
                    type: "group",
                    visible: false
                }
            }
        };

        vm.center_map = center_map;
        vm.show_geocache_details = show_geocache_details;
        vm.set_center = set_center;

        $scope.$on('geocaches_updated', function (event, args) {
            vm.markers = {};
            pathes = {centroid_marker: centroid_marker};
            for (var i = 0, len = GeocacheService.geocache_list.length; i < len; i++) {
                var geocache = GeocacheService.geocache_list[i];
                vm.markers[geocache.gc_code] = {
                    lat: geocache.lat,
                    lng: geocache.lon,
                    message: 
                        '<div class="popup">' +
                        '  <div><a href ng-click="map.show_geocache_details(' + geocache.id + ')" class="popup-title">' + geocache.title + '</a></div>' +
                        '  <div class="gc_code">' + geocache.gc_code + '</div>' +
                        '  <div class="table">' +
                        '      <dl class="table-row">' +
                        '          <dt>Difficulty: </dt>' +
                        '          <dd><geocache-rating value="' + geocache.difficulty + '" class="rating_popup"></geocache-rating> (' + geocache.difficulty + ')</dd>' +
                        '          <dt>Cache Size: </dt>' +
                        '          <dd class="last-column"><geocache-size size="' + geocache.container + '" class="size_popup"></geocache-size> (' + geocache.container + ')</dd>' +
                        '      </dl>' +
                        '      <dl class="table-row paragraph">' +
                        '          <dt>Terrain: </dt>' +
                        '          <dd><geocache-rating value="' + geocache.terrain + '" class="rating_popup"></geocache-rating> (' + geocache.terrain + ')</dd>' +
                        '          <dt>Last Logs: </dt>' +
                        '          <dd class="last-column"><geocache-log ng-repeat="log in \'' + geocache.last_logs.replace(/'/g, "\\\'") + '\'.split(\';\') track by $index" type="{{log}}" title="{{log}}" class="last_log_popup"></geocache-log></dd>' +
                        '      </dl>' +
                        '  </div>' +
                        '  <div><button class="btn btn-primary btn-sm" ng-click="map.set_center(' + geocache.lat + ', ' + geocache.lon + ')"> <span class="glyphicon glyphicon-map-marker"></span> Set as Map Center </button></div>' +
                        '</div>',
                    compileMessage: true,
                    getMessageScope : function() { return $scope; },
                    layer: "geocaches",
                    icon: {
                        iconUrl: marker_trans[geocache.type],
                        iconSize:     [icon_size, icon_size], // size of the icon
                        iconAnchor:   [icon_size / 2, icon_size], // point of the icon which will correspond to marker's location
//                        shadowUrl:    'static/images/marker/shadow.svg',
//                        shadowSize:   [36, 36], // size of the shadow
//                        shadowAnchor: [18, 36],  // the same for the shadow
                        popupAnchor:  [0, -icon_size] // point from which the popup should open relative to the iconAnchor
                    }
                };
                pathes[geocache.gc_code] = {
                    latlngs: [geocache.lat, geocache.lon],
                    color: '#ff0000',
                    radius: 161,
                    weight: 1,
                    opacity: 1,
                    type: 'circle',
                    layer: 'circles'
                };
            }
            vm.pathes = pathes;
        });

        $scope.$on('center_updated', function (event, args) {
            center_map()
        });

        $scope.$watch("map.centroid.zoom", function (zoom) {
            if (zoom >= 14) {
                vm.pathes = pathes;
            }
            else {
                vm.pathes = {centroid_marker: centroid_marker};
            }
        });

        $scope.$on('map_pane_updated', function (event, args) {
            var gc_code = args.marker_gc_code;
            vm.centroid.zoom = 14;
            vm.centroid.lat = vm.markers[args.marker_gc_code].lat;
            vm.centroid.lng = vm.markers[args.marker_gc_code].lng;

            // Found by reverse engineering: simply setting marker.focus to true
            // does not do the job as expected, the popup occurs on with an offset,
            // and the size is rather strange.
            // Using a timeout of 0 milliseconds does the trick. :-(
            $timeout(function () {
                vm.markers[gc_code].focus = true;
            }, 100);
        });

        // Another odd: the framework does not update marker.focus when a
        // popup is closed. :-(
        $scope.$on('leafletDirectiveMarker.popupclose', function(event, args){
            vm.markers[args.modelName].focus = false;
        });

        function center_map() {
            vm.centroid.lat = GeocacheService.home_lat;
            vm.centroid.lng = GeocacheService.home_lon;
            vm.centroid.zoom = 14;
            centroid_marker.latlngs = [GeocacheService.home_lat, GeocacheService.home_lon];
        }

        function show_geocache_details(id) {
            GeocacheService.read(id); // cache detail tab
        }

        function set_center(lat, lon) {
            GeocacheService.on_reference_changed(lat, lon);
        }
    }

})();
