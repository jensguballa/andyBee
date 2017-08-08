(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheMapCtrl', GeocacheMapCtrl);

    GeocacheMapCtrl.$inject = ['$scope', '$timeout', 'GeocacheService'];
    function GeocacheMapCtrl($scope, $timeout, GeocacheService) {

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
        vm.markers = [];
        vm.circles = [];
        vm.circles_hidden = [];
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

        $scope.$on('geocaches_updated', function (event, args) {
            vm.markers = [];
            vm.circles_hidden = [centroid_marker];
            for (var i = 0, len = GeocacheService.geocache_list.length; i < len; i++) {
                var geocache = GeocacheService.geocache_list[i];
                vm.markers.push({
                    lat: geocache.lat,
                    lng: geocache.lon,
                    message: geocache.title,
                    layer: "geocaches",
                    icon: {
                        iconUrl: marker_trans[geocache.type],
                        iconSize:     [36, 36], // size of the icon
                        iconAnchor:   [18, 36], // point of the icon which will correspond to marker's location
//                        shadowUrl:    'static/images/marker/shadow.svg',
//                        shadowSize:   [20, 20], // size of the shadow
//                        shadowAnchor: [10, 10],  // the same for the shadow
                        popupAnchor:  [0, -36] // point from which the popup should open relative to the iconAnchor
                    }
                });
                vm.circles_hidden.push({
                    latlngs: [geocache.lat, geocache.lon],
                    color: '#ff0000',
                    radius: 161,
                    weight: 1,
                    opacity: 1,
                    type: 'circle',
                    layer: 'circles'
                });
            }
            vm.circles = vm.circles_hidden;

        });

        $scope.$on('center_updated', function (event, args) {
            center_map()
        });

        $scope.$watch("map.centroid.zoom", function (zoom) {
            if (zoom >= 14) {
                vm.circles = vm.circles_hidden;
            }
            else {
                vm.circles = [centroid_marker];
            }
        });

        function center_map() {
            vm.centroid.lat = GeocacheService.home_lat;
            vm.centroid.lng = GeocacheService.home_lon;
            vm.centroid.zoom = 14;
            centroid_marker.latlngs = [GeocacheService.home_lat, GeocacheService.home_lon];
        }

    }

})();
