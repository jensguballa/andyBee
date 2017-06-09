(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('PreferenceService', PreferenceService);

    PreferenceService.$inject = ['$resource', '$injector', 'LoggingService', 'ERROR'];
    function PreferenceService ($resource, $injector, LoggingService, ERROR) {
        var rest = $resource('/andyBee/api/v1.0/config/:id/preference', null, {update: {method: 'PUT'}});
        var serv = {
            data: {},
            read: read,
            update: update,
            update_used_db: update_used_db,
            resolve_data_copy: resolve_data_copy
        };
        return serv;

        function read (success_cb, error_cb) {
            error_cb = error_cb || on_get_error;
            rest.get({id: 1}, on_get_response, error_cb);

            function on_get_response (result) {
                serv.data = result.preference;
                if (success_cb) {
                    success_cb();
                }
            }

            function on_get_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_PREFERENCES_FROM_SERVER, 
                    http_response: result,
                    modal: true
                });
            }
        }

        function update (data, success_cb, error_cb) {
            error_cb = error_cb || on_update_error;
            rest.update({id: 1}, {preference: data}, on_update_response, error_cb);
            
            function on_update_response () {
                var home_changed = false;
                serv.data = data;
                $injector.get('GeocacheService').on_reference_changed(data.home_lat, data.home_lon);
                if (success_cb) {
                    success_cb();
                }
            }

            function on_update_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_PREFERENCES_UPDATE, 
                    http_response: result,
                    modal: true
                });
            }
        }

        function update_used_db (db_name, success_cb, error_cb) {
            error_cb = error_cb || on_update_error;
            if (db_name != serv.data.used_db) {
                rest.update({id: 1}, {preference: {id:1, used_db: db_name}}, on_update_response, error_cb);
            }
            else if (success_cb) {
                success_cb();
            }

            function on_update_response () {
                serv.data.used_db = db_name;
                if (success_cb) {
                    success_cb();
                }
            }

            function on_update_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_PREFERENCES_USED_DB, 
                    http_response: result,
                    type: 'warning'
                });
            }
        }

        function resolve_data_copy () {
            return angular.copy(serv.data);
        }

    }

})();
