(function () {
    angular
        .module('andyBeeApp', ['ngSanitize', 'ui.bootstrap', 'ngResource', 'ngTable', 'leaflet-directive'])
        .config(function($logProvider) {
            $logProvider.debugEnabled(false);
        })
        .run(init_geocache_type)
        .run(open_startup_db)
        .run(get_filter_list);

        init_geocache_type.$inject = ['TYPE_TRANSLATION', 'TYPE_TO_PROP', 'TYPE_TO_STRING'];
        function init_geocache_type (TYPE_TRANSLATION, TYPE_TO_PROP, TYPE_TO_STRING) {
            for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
                TYPE_TO_PROP[TYPE_TRANSLATION[i].text] = TYPE_TRANSLATION[i].prop;
                TYPE_TO_STRING[TYPE_TRANSLATION[i].prop] = TYPE_TRANSLATION[i].text;
            }
        }

        open_startup_db.$inject = ['PreferenceService', 'GeocacheService', 'DbService', 'LoggingService', 'ERROR']
        function open_startup_db (PreferenceService, GeocacheService, DbService, LoggingService, ERROR) {
            var db_name;
            PreferenceService.read(on_read_result);

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

            function on_dblist_response () {
                if (DbService.is_in_dblist(db_name)) {
                    GeocacheService.read_list(db_name);
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

        get_filter_list.$inject = ['FilterService']
        function get_filter_list(FilterService) {
            FilterService.read_list();
        }

})();

