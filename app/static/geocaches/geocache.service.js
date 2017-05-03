(function () {
    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$rootScope', '$resource', 'PreferenceService', 'LoggingService', 'DbService'];
    function GeocacheService ($rootScope, $resource, PreferenceService, LoggingService, DbService) {
        var rest_geocache = $resource('/andyBee/api/v1.0/db/:db/geocaches/:geocache_id');
        var serv = {
            // which of the tabs (list, map, detail, console) is active
            selected_tab: 0,
            detail: {},
            show_details: show_details,

            // stuff related to the list of DBs
            db_name: '',
            resolve_db_name: resolve_db_name,

            // stuff related to geocaches within a db
            geocache_list: [],
            get_geocache_list: get_geocache_list,

        };

        return serv;

        function resolve_db_name () {
            return serv.db_name;
        }

        function get_geocache_list (db_name) {            
            if (DbService.is_in_dblist(db_name)) {
                rest_geocache.get({db: db_name}, geocache_list_response, LoggingService.log_RESTful_error);
            }
            else {
                // new DB to allocate.
                DbService.create(db_name, db_allocated);
                //rest_dblist.post({db: db_name}, db_allocated, LoggingService.log_RESTful_error);
            }

            function db_allocated (result) {
                serv.db_name = result.db_name;
                PreferenceService.update_used_db(result.db_name);
                serv.nbr_caches = 0;
                serv.geocache_list = [];
                $rootScope.$broadcast('geocaches_updated');
            }

            function geocache_list_response (result) {
                serv.db_name = result.db_name;
                PreferenceService.update_used_db(result.db_name);
                serv.nbr_caches = result.nbr_caches;
                serv.geocache_list = result.geocaches;
                $rootScope.$broadcast('geocaches_updated');
            }
        }

        function show_details (id) {
            serv.selected_tab = 2; // switch to the details tab
            rest_geocache.get({db: serv.db_name, geocache_id: id}, geocache_response, LoggingService.log_RESTful_error);

            function geocache_response (result) {
                serv.detail = result.geocache;
                $rootScope.$broadcast('geocache_details_updated');
            }
        }

    }

})();
