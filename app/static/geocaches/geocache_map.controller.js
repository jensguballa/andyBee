(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheMapCtrl', GeocacheMapCtrl);

    GeocacheMapCtrl.$inject = ['$scope', '$timeout', 'GeocacheService', 'PreferenceService', 'Functions'];
    function GeocacheMapCtrl($scope, $timeout, GeocacheService, PreferenceService, Functions) {
        var icon_size = 36;
        var disable_clustering_zoom = 10;

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
//                geocaches: {
//                    name: "Geocaches",
//                    type: "markercluster",
//                    visible: true,
//                    layerOptions: {
//                        disableClusteringAtZoom: disable_clustering_zoom,
//                        spiderfyOnMaxZoom: false
//                    }
//                },
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
        vm.controls = {
            scale: true
        }

        vm.center_map = center_map;
        vm.show_geocache_details = show_geocache_details;
        vm.set_center = set_center;
        vm.update_coordinates = update_coordinates;

        $scope.$on('preferences_available', function (event, args) {
            icon_size = PreferenceService.data.marker_size;
            disable_clustering_zoom = PreferenceService.data.cluster_zoom
            vm.layers.overlays['geocaches'] = {
                name: "Geocaches",
                type: "markercluster",
                visible: true,
                layerOptions: {
                    disableClusteringAtZoom: disable_clustering_zoom,
                    spiderfyOnMaxZoom: false
                }
            };
        });

        $scope.$on('geocaches_updated', function (event, args) {
            vm.markers = {};
            pathes = {centroid_marker: centroid_marker};
            for (var i = 0, len = GeocacheService.geocache_list.length; i < len; i++) {
                var geocache = GeocacheService.geocache_list[i];

                var difficulty_stars = Functions.rating_to_imgs(geocache.difficulty);
                var difficulty_html = '';
                var terrain_stars = Functions.rating_to_imgs(geocache.difficulty);
                var terrain_html = '';
                for (var j = 0; j < 5; j++) {
                    difficulty_html += '<img src="' + difficulty_stars[j] + '" class="rating_popup" />';
                    terrain_html += '<img src="' + terrain_stars[j] + '" class="rating_popup" />';
                }

                var last_logs = geocache.last_logs.split(';');
                var last_logs_html = ''
                for (var j = 0; j < last_logs.length; j++) {
                    last_logs_html += '<img src="' + Functions.log_to_img(last_logs[j]) + '" title="' + last_logs[j] + '" class="last_log_popup" />';
                }

                vm.markers[geocache.gc_code] = {
                    id: geocache.id,
                    lat: geocache.lat,
                    lng: geocache.lon,
                    message: 
                        '<div class="popup">' +
                        '  <div><a href ng-click="map.show_geocache_details(' + geocache.id + ')" class="popup-title">' + geocache.title + '</a></div>' +
                        '  <div class="gc_code">' + geocache.gc_code + '</div>' +
                        '  <div class="table">' +
                        '      <dl class="table-row">' +
                        '          <dt>Difficulty: </dt>' +
                        '          <dd>' + difficulty_html + ' (' + geocache.difficulty + ')</dd>' +
                        '          <dt>Cache Size: </dt>' +
                        '          <dd class="last-column"><img src="' + Functions.size_to_img(geocache.container) + '" class="size_popup"> (' + geocache.container + ')</dd>' +
                        '      </dl>' +
                        '      <dl class="table-row paragraph">' +
                        '          <dt>Terrain: </dt>' +
                        '          <dd>' + terrain_html + ' (' + geocache.terrain + ')</dd>' +
                        '          <dt>Last Logs: </dt>' +
                        '          <dd class="last-column">' + last_logs_html + '</dd>' +
                        '      </dl>' +
                        '  </div>' +
                        '  <div><button class="btn btn-primary btn-sm" ng-click="map.set_center(' + geocache.id + ')"> <span class="glyphicon glyphicon-map-marker"></span> Set as Map Center </button></div>' +
                        '  <div><button class="btn btn-primary btn-sm tiny-gap-top" ng-click="map.update_coordinates(' + geocache.id + ')"> <span class="glyphicon glyphicon-map-marker"></span> Update Coordinates </button></div>' +
                        '</div>',
                    compileMessage: true,
                    getMessageScope : function() { return $scope; },
                    layer: "geocaches",
                    icon: {
                        iconUrl: Functions.type_to_marker_img(geocache.type),
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
            center_map();
        });

        $scope.$on('preferences_updated', function (event, preferences) {
            if (icon_size != preferences.marker_size) {
                icon_size = preferences.marker_size;
                for (var marker in vm.markers) {
                    if(!vm.markers.hasOwnProperty(marker)) continue;
                    vm.markers[marker].icon.iconSize = [icon_size, icon_size];
                    vm.markers[marker].icon.iconAnchor = [icon_size / 2, icon_size];
                    vm.markers[marker].icon.popupAnchor = [0, -icon_size];
                }
            }
        });

        $scope.$watch("map.centroid.zoom", function (zoom) {
            if (zoom >= disable_clustering_zoom) {
                vm.pathes = pathes;
            }
            else {
                vm.pathes = {centroid_marker: centroid_marker};
            }
        });

        $scope.$on('map_pane_updated', function (event, args) {
            var gc_code = args.marker_gc_code;
            vm.centroid.zoom = disable_clustering_zoom;
            vm.centroid.lat = vm.markers[args.marker_gc_code].lat;
            vm.centroid.lng = vm.markers[args.marker_gc_code].lng;

            // Found by reverse engineering: simply setting marker.focus to true
            // does not do the job as expected, the popup occurs with an offset,
            // and the size is rather strange.
            // Using a timeout of 0 milliseconds does the trick. :-(
            $timeout(function () {
                vm.markers[gc_code].focus = true;
            }, 100);
        });

        // Another odd: the framework does not update marker.focus when a
        // popup is closed. :-(
        $scope.$on('leafletDirectiveMarker.popupclose', function(event, args) {
            vm.markers[args.modelName].focus = false;
        });

        $scope.$on('coordinates_updated', function(event, args) {
            if (vm.markers.hasOwnProperty(args.geocache.gc_code)) {
                vm.markers[args.geocache.gc_code].lat = args.geocache.lat;
                vm.markers[args.geocache.gc_code].lng = args.geocache.lon;
                vm.markers[args.geocache.gc_code].focus = false;
                vm.pathes[args.geocache.gc_code].latlngs = [args.geocache.lat, args.geocache.lon];
                vm.centroid.lat = args.geocache.lat;
                vm.centroid.lng = args.geocache.lon;
                $timeout(function () {
                    vm.markers[args.geocache.gc_code].focus = true;
                }, 100);
            }
        });

        function center_map() {
            vm.centroid.lat = GeocacheService.center_point.lat;
            vm.centroid.lng = GeocacheService.center_point.lng;
            vm.centroid.zoom = disable_clustering_zoom;
            centroid_marker.latlngs = [GeocacheService.center_point.lat, GeocacheService.center_point.lng];
        }

        function show_geocache_details(id) {
            GeocacheService.read(id); // cache detail tab
        }

        function update_coordinates(id) {
            var geocache = GeocacheService.get_geocache(id);
            GeocacheService.update_coord_dialog(id);
            vm.markers[geocache.gc_code].focus = false;
            $timeout(function () {
                vm.markers[geocache.gc_code].focus = true;
            }, 100);
        }

        function set_center(id) {
            var geocache = GeocacheService.get_geocache(id);
            GeocacheService.trigger_center_update(geocache.lat, geocache.lon);
        }
    }

})();
