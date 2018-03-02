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
        var rest_delete_list = $resource('/andyBee/api/v1.0/db/:db/geocaches/delete_list', null, {
            post: {method: 'POST'}
        });
        var rest_upd_coord = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id/update_coords/', null, {
            post: {method: 'POST'}
        });
        var rest_upd_note = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id/update_note/', null, {
            post: {method: 'POST'}
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
            countries: [],
            states: [],
            add_country: add_country,
            add_state: add_state,
            read_list: read_list,
            update_coord_dialog: update_coord_dialog,

            refreshMap: refreshMap,
            get_geocache: get_geocache,
            save_note: save_note,
            delete_geocaches: delete_geocaches,
            check_user_supplied_info: check_user_supplied_info

        };
        return serv;

        function resolve_db_name () {
            return serv.db_name;
        }

        function check_user_supplied_info (selection) {
            var user_info = false;
            var nbr_entries = 0;
            var list = [];
            if ((selection == "all") || (selection == "selected")) {
                var geocaches = (selection == "all" ? geocache_list_unfiltered : serv.geocache_list);
                nbr_entries = geocaches.length;
                for (var i = 0; i < nbr_entries; i++) {
                    if (geocaches[i].note_present || geocaches[i].coords_updated) {
                        user_info = true;
                    }
                    list.push(geocaches[i].id);
                }
            }
            else if (selection == "unselected") {
                nbr_entries = geocache_list_unfiltered.length - serv.geocache_list.length;
                for (var i = 0, len = geocache_list_unfiltered.length; i < len; i++) {
                    var geocache = geocache_list_unfiltered[i];
                    if (geocache.filtered) {
                        if (geocache.note_present || geocache.coords_updated) {
                            user_info = true;
                        }
                        list.push(geocache.id);
                    }
                }
            }
            return {geocache_list: list, user_info: user_info};
        }

        function apply_filter(list) {
            return FilterService.apply_basic_filter(list);
        }

        function on_filter_changed() {
            serv.geocache_list = apply_filter(geocache_list_unfiltered);
            $rootScope.$broadcast('geocache_list_updated');
        }

        function on_filter_reset() {
            for (var i = 0, len = geocache_list_unfiltered.length; i < len; i++) {
                geocache_list_unfiltered[i].filtered = false;
            }
            serv.geocache_list = geocache_list_unfiltered;
            $rootScope.$broadcast('geocache_list_updated');
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
                serv.countries = [];
                serv.states = [];
                var now = Date.now() / 1000;
                for (var i = 0; i < geocache_list_unfiltered.length; i++) {
                    geocache_list_unfiltered[i].age = Math.floor((now - geocache_list_unfiltered[i].last_updated) / (24*3600));
                    geocache_list_unfiltered[i].filtered = false;
                    unfiltered_id_to_idx[geocache_list_unfiltered[i].id] = i;

                    var country = geocache_list_unfiltered[i].country;
                    if (serv.countries.indexOf(country) == -1) {
                        serv.countries.push(country);
                    }
                    var state = geocache_list_unfiltered[i].state;
                    if (serv.states.indexOf(state) == -1) {
                        serv.states.push(state);
                    }
                }
                serv.countries = serv.countries.sort();
                serv.countries.unshift("");
                serv.states = serv.states.sort();
                serv.states.unshift("");
                serv.detail = {};
                recalc_distance_all();
                serv.geocache_list = apply_filter(geocache_list_unfiltered);
                BusyService.close_busy_modal();
                $rootScope.$broadcast('geocache_list_updated');
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
                $rootScope.$broadcast('geocache_list_updated');
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
                result.geocache.age =  Math.floor((Date.now()/1000 - result.geocache.last_updated) / (24*3600));
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

        function delete_geocaches(list, success_cb, error_cb) {
            error_cb = error_cb || on_delete_error;
            rest_delete_list.post({db: serv.db_name}, {geocaches: list}, delete_response, error_cb);

            function delete_response (result) {
                read_list(serv.db_name, success_cb, error_cb);
            }

            function on_delete_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_DELETE_GEOCACHE_LIST, 
                    http_response: result, 
                    modal: true
                });
                read_list(serv.db_name, success_cb, error_cb);
            }
        }

        function add_country (country) {
            if (serv.countries.indexOf(country) == -1) {
                serv.countries.push(country);
                serv.countries = serv.countries.sort();
            }
        }

        function add_state (state) {
            if (serv.states.indexOf(state) == -1) {
                serv.states.push(state);
                serv.states = serv.states.sort();
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
                    geocache.age = 0;

                    recalc_distance_all();
                    serv.geocache_list = apply_filter(geocache_list_unfiltered);

                    serv.detail.lat = geocache.lat;
                    serv.detail.lon = geocache.lon;
                    serv.detail.orig_lat = geocache.orig_lat;
                    serv.detail.orig_lon = geocache.orig_lon;
                    serv.detail.distance = geocache.distance;
                    serv.detail.coords_updated = geocache.coords_updated;
                    serv.detail.age = 0;

                    $rootScope.$broadcast('coordinates_updated', {geocache: geocache});
                }

                function on_post_error (result) {
                    LoggingService.log({
                        msg: ERROR.FAILURE_GEOCACHE_UPDATE_COORD,
                        http_response: result, 
                        modal: true
                    });
                }
            }

        }

        function get_geocache (id) {
            return geocache_list_unfiltered[unfiltered_id_to_idx[id]]
        }

        function refreshMap () {
            leafletData.getMap().then(function(map) {
                $timeout(function() {
                  map.invalidateSize();
                }, 0);
            });
        }

        function save_note (id, note, cb_success) {
            rest_upd_note.post({db: serv.db_name, geocache_id: id}, {user_note: note}, on_post_response, on_post_error);

            function on_post_response (result) {
                serv.detail.user_note = note;
                serv.detail.note_present = (note != "");
                get_geocache(id).note_present = (note != "");
                cb_success();
            }

            function on_post_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GEOCACHE_UPDATE_NOTE,
                    http_response: result, 
                    modal: true
                });
            }
        }

    }

})();
