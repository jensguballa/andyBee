(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$rootScope', '$resource', '$timeout', '$uibModal', 'PreferenceService', 'LoggingService', 'DbService', 'FilterService', 'Functions', 'BusyService', 'ERROR', 'leafletData'];
    function GeocacheService ($rootScope, $resource, $timeout, $uibModal, PreferenceService, LoggingService, DbService, FilterService, Functions, BusyService, ERROR, leafletData) {
        L.LatLng.MAX_MARGIN = 1e-6;
        var modal;
        var rest = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id');
        var rest_upd_coord = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id/update_coords/', null, {
            post: {
                method: 'POST'
            }
        });


        var geocache_list_unfiltered = [];
        var unfiltered_id_to_idx = {};

        var serv = {
            // which of the tabs (list, map, detail, console) is active
            selected_tab: 0,
            selected_detailed_tab: 0,
            center_point: L.latLng(0,0),
            detail: {},
            read: read,

            // stuff related to the list of DBs
            db_name: '',
            resolve_db_name: resolve_db_name,
            on_filter_changed: on_filter_changed,
            on_filter_reset: on_filter_reset,
            trigger_center_update: trigger_center_update,

            // stuff related to geocaches within a db

            geocache_list: [],
            read_list: read_list,
            update_coord_dialog: update_coord_dialog,

            refreshMap: refreshMap,
            get_geocache: get_geocache

        };

        return serv;

        function resolve_db_name () {
            return serv.db_name;
        }

        function apply_filter(list) {
            return FilterService.apply_basic_filter(list);
        }

        function on_filter_changed() {
            serv.geocache_list = apply_filter(geocache_list_unfiltered);
            $rootScope.$broadcast('geocaches_updated');
        }

        function on_filter_reset() {
            serv.geocache_list = geocache_list_unfiltered;
            $rootScope.$broadcast('geocaches_updated');
        }

        function recalc_distance_all() {
            for (var i = 0, len = geocache_list_unfiltered.length; i < len; i++) {
                var geocache = geocache_list_unfiltered[i];
                geocache.latlng = L.latLng(geocache.lat, geocache.lon);
                geocache.distance = geocache.latlng.distanceTo(serv.center_point);
            }
        }

        function trigger_center_update(lat, lon) {
            var latlng = L.latLng(lat, lon);
            if (!Functions.latlng_equal(latlng, serv.center_point)) {
                serv.center_point = latlng;
                recalc_distance_all();
                $rootScope.$broadcast('center_updated');
            }
        }


        function read_list (db_name, success_cb, error_cb) {            
            if (DbService.is_in_dblist(db_name)) {
                BusyService.open_busy_modal('Please Wait.', 'Loading Geocaches from DB ' + db_name + '...');
                rest.get({db: db_name}, get_response, error_cb);
            }
            else {
                // new DB to allocate.
                error_cb = error_cb || on_db_create_error;
                DbService.create(db_name, on_db_create_response, error_cb);
            }

            function get_response (result) {
                serv.db_name = db_name;
                PreferenceService.update_used_db(db_name);
                serv.nbr_caches = result.nbr_caches;
                geocache_list_unfiltered = result.geocaches;
                unfiltered_id_to_idx = {};
                for (var i = 0; i < geocache_list_unfiltered.length; i++) {
                    unfiltered_id_to_idx[geocache_list_unfiltered[i].id] = i;
                }
                serv.detail = {};
                recalc_distance_all();
                serv.geocache_list = apply_filter(geocache_list_unfiltered);
                BusyService.close_busy_modal();
                $rootScope.$broadcast('geocaches_updated');
                if (success_cb) {
                    success_cb();
                }
            }

            function on_get_error (result) {
                BusyService.close_busy_modal();
                if (error_cb) {
                    error_cb();
                }
                else {
                    LoggingService.log({
                        msg: ERROR.FAILURE_GEOCACHE_LIST_FROM_SERVER, 
                        http_response: result,
                        modal: true
                    });
                }
            }

            function on_db_create_response (result) {
                serv.db_name = db_name;
                PreferenceService.update_used_db(db_name);
                serv.nbr_caches = 0;
                geocache_list_unfiltered = [];
                serv.geocache_list = [];
                $rootScope.$broadcast('geocaches_updated');
                if (success_cb) {
                    success_cb();
                }
            }

            function on_db_create_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_DB_CREATE, 
                    http_response: result,
                    modal: true
                });
            }

        }

        function read (id, success_cb, error_cb) {
            error_cb = error_cb || on_get_error;
            serv.selected_tab = 2; // switch to the details tab
            serv.selected_detailed_tab = 0; // switch to overview tab
            rest.get({db: serv.db_name, geocache_id: id}, get_response, error_cb);

            function get_response (result) {
                // check if at least one non-blank character is present
                if (result.geocache.encoded_hints.search(/\S/) == -1) {
                    result.geocache.encoded_hints = '';
                }
                result.geocache.show_hint = false;
                serv.detail = result.geocache;
                $rootScope.$broadcast('geocache_details_updated');
                if (success_cb) {
                    success_cb();
                }
            }

            function on_get_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GEOCACHE_FROM_SERVER, 
                    http_response: result, 
                    modal: true
                });

            }
        }

        function update_coord_dialog(id) {
            var geocache = get_geocache(id);
            $uibModal.open({
                animation: false,
                controller: 'GeocacheUpdateCtrl',
                controllerAs: 'coord',
                templateUrl: '/static/geocaches/update_coords.html',
                resolve: {
                    geocache: geocache
                }
            }).result.then(on_dialog_ok, function(){});

            function on_dialog_ok (coords) {
                var geocache_orig = L.latLng(geocache.orig_lat, geocache.orig_lon);
                var action = "update";
                if (!Functions.latlng_equal(coords, geocache.latlng)) {
                    if (Functions.latlng_equal(coords, geocache_orig)) {
                        action = "reset";
                    }
                    rest_upd_coord.post({db: serv.db_name, geocache_id: geocache.id}, {
                        action: action, 
                        lat: coords.lat, 
                        lon: coords.lng}, on_post_response, on_post_error);
                }

                function on_post_response(result) {
                    if (!geocache.coords_updated) {
                        geocache.coords_updated = true;
                        geocache.orig_lat = geocache.lat;
                        geocache.orig_lon = geocache.lon;
                    }
                    else if (Functions.latlng_equal(coords, geocache_orig)) {
                        geocache.coords_updated = false;
                    }

                    geocache.lat = coords.lat;
                    geocache.lon = coords.lng;
                    geocache.latlng = coords;

                    recalc_distance_all();
                    serv.geocache_list = apply_filter(geocache_list_unfiltered);

                    serv.detail.lat = geocache.lat;
                    serv.detail.lon = geocache.lon;
                    serv.detail.orig_lat = geocache.orig_lat;
                    serv.detail.orig_lon = geocache.orig_lon;
                    serv.detail.distance = geocache.distance;
                    serv.detail.coords_updated = geocache.coords_updated;

                    $rootScope.$broadcast('coordinates_updated', {geocache: geocache});
                }

                function on_post_error(result) {
                    LoggingService.log({
                        msg: ERROR.FAILURE_GEOCACHE_UPDATE_COORD,
                        http_response: result, 
                        modal: true
                    });
                }
            }

        }

        function get_geocache(id) {
            return geocache_list_unfiltered[unfiltered_id_to_idx[id]]
        }

        function refreshMap() {
            leafletData.getMap().then(function(map) {
                $timeout(function() {
                  map.invalidateSize();
                }, 0);
            });
        }
    }

})();
