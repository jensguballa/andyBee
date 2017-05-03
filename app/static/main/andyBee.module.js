(function () {
    angular
        .module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource', 'ngTable', 'leaflet-directive'])
        .config(function($logProvider) {
            $logProvider.debugEnabled(false);
        })
        .run(open_startup_db);

        open_startup_db.$inject = ['PreferenceService', 'GeocacheService', 'DbService', 'LoggingService', 'ERROR']
        function open_startup_db (PreferenceService, GeocacheService, DbService, LoggingService, ERROR) {
            var db_name;
            PreferenceService.read(on_read_result, on_read_error);

            function on_read_result() {
                var auto_load = PreferenceService.data.auto_load;
                if (auto_load == 0) { // don't open any DB at all
                }
                else if (auto_load == 1) { // open last db
                    db_name = PreferenceService.data.used_db;
                }
                else if (auto_load == 2) { // open predefined db
                    db_name = PreferenceService.data.default_db;
                }
                if (db_name) {
                    DbService.read(on_dblist_response, on_dblist_error);
                }
            }

            function on_read_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_PREFERENCES_FROM_SERVER, 
                    http_response: result,
                    modal: true,
                });
            }

            function on_dblist_response () {
                if (DbService.is_in_dblist(db_name)) {
                    GeocacheService.get_geocache_list(db_name);
                }
                else {
                    LoggingService.log({
                        msg: ERROR.WARNING_DB_NOT_FOUND, 
                        http_response: result,
                        type: 'warning'
                    });
                }
            }

            function on_dblist_error (result) {
                LoggingService.log({
                    msg: ERROR.WARNING_DB_LIST_FROM_SERVER, 
                    http_response: result,
                    type: 'warning'
                });
            }
        }

})();

