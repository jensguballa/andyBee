(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$rootScope', '$resource', 'PreferenceService', 'LoggingService', 'DbService', 'FilterService', 'BusyService', 'ERROR'];
    function GeocacheService ($rootScope, $resource, PreferenceService, LoggingService, DbService, FilterService, BusyService, ERROR) {
        var modal;
        var rest = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id');
        var geocache_list_unfiltered = [];
        var serv = {
            // which of the tabs (list, map, detail, console) is active
            selected_tab: 0,
            home_lat: 30.7,
            home_lon: 9.9,
            detail: {},
            read: read,

            // stuff related to the list of DBs
            db_name: '',
            resolve_db_name: resolve_db_name,
            on_filter_changed: on_filter_changed,
            on_filter_reset: on_filter_reset,
            on_reference_changed: on_reference_changed,

            // stuff related to geocaches within a db

            geocache_list: [],
            read_list: read_list,

            coord_to_obj: coord_to_obj,
            obj_to_coord: obj_to_coord

        };

        return serv;

        function resolve_db_name () {
            return serv.db_name;
        }

        function on_filter_changed() {
            serv.geocache_list = FilterService.apply_basic_filter(geocache_list_unfiltered);
            $rootScope.$broadcast('geocaches_updated');
        }

        function on_filter_reset() {
            serv.geocache_list = geocache_list_unfiltered;
            $rootScope.$broadcast('geocaches_updated');
        }

        function change_reference(lat, lon) {
            var reference_point = L.latLng(lat, lon);
            for (var i = 0, len = geocache_list_unfiltered.length; i < len; i++) {
                var geocache = geocache_list_unfiltered[i];
                geocache.point = L.latLng(geocache.lat, geocache.lon);
                geocache.distance = geocache.point.distanceTo(reference_point);
            }
        }

        function on_reference_changed(lat, lon) {
            if ((lat != serv.home_lat) || (lon != serv.home_lon)) {
                serv.home_lat = lat;
                serv.home_lon = lon;
                change_reference(lat, lon);
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
                serv.detail = {};
                change_reference(serv.home_lat, serv.home_lon);
                //var reference_point = L.latLng(49.0, 9.0);
                //for (var i = 0, len = geocache_list_unfiltered.length; i < len; i++) {
                //    var geocache = geocache_list_unfiltered[i];
                //    geocache.point = L.latLng(geocache.lat, geocache.lon);
                //    geocache.distance = geocache.point.distanceTo(reference_point);
                //}
                serv.geocache_list = FilterService.apply_basic_filter(result.geocaches);
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

        function coord_to_obj(coord, str1, str2) {
            var str = str1;
            if (coord < 0) {
                coord = -coord;
                str = str2;
            }
            var degrees = parseInt(coord);
            //return str + ' ' + degrees + ' ' + ((coord - degrees) * 60).toFixed(3);
            return {
                type: str,
                degrees: degrees,
                minutes: ((coord - degrees) * 60).toFixed(3)
            };
        }

        function obj_to_coord(obj) {
            var coord = obj.degrees + obj.minutes / 60;
            if ((obj.type == 'W') || (obj.type == 'S')) {
                coord = -coord;
            }
            return coord;
        }
    }

})();
