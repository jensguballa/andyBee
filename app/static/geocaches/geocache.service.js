
(function () {
    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$rootScope', '$resource', 'PreferenceService', 'LoggingService'];
    function GeocacheService ($rootScope, $resource, PreferenceService, LoggingService) {
        var rest_dblist = $resource('/andyBee/api/v1.0/db/', null, {
            post: {
                method: 'POST'
            }
        });
        var rest_geocache = $resource('/andyBee/api/v1.0/db/:db_name/geocaches/:geocache_id');
        var serv = {
            // which of the tabs (list, map, detail, console) is active
            detail: {},
            selected_tab: 0,
            show_details: show_details,

            // stuff related to the list of DBs
            db_list: [],
            get_dblist: get_dblist,
            db_name: '',

            // stuff related to geocaches within a db
            geocache_list: [],
            get_geocache_list: get_geocache_list,

        };

        return serv;

        function get_dblist (success_cb) {
            rest_dblist.get(dblist_response, LoggingService.log_RESTful_error);

            function dblist_response (result) {
                serv.db_list = result.dbs;
                success_cb();
            }
        }

        function get_geocache_list (db_name) {            
            if (inArray(db_name, serv.db_list)) {
                rest_geocache.get({db_name: db_name}, geocache_list_response, LoggingService.log_RESTful_error);
            }
            else {
                // new DB to allocate.
                rest_dblist.post({db_name: db_name}, db_allocated, LoggingService.log_RESTful_error);
            }

            function db_allocated (result) {
                serv.db_name = result.db_name;
                PreferenceService.set_used_db(result.db_name);
                serv.nbr_caches = 0;
                serv.geocache_list = [];
                $rootScope.$broadcast('geocaches_updated');
            }

            function geocache_list_response (result) {
                serv.db_name = result.db_name;
                PreferenceService.set_used_db(result.db_name);
                serv.nbr_caches = result.nbr_caches;
                serv.geocache_list = result.geocaches;
                $rootScope.$broadcast('geocaches_updated');
            }
        }

        function show_details (id) {
            serv.selected_tab = 2; // switch to the details tab
            rest_geocache.get({db_name: serv.db_name, geocache_id: id}, geocache_response, LoggingService.log_RESTful_error);

            function geocache_response (result) {
                serv.detail = result.geocache;
                $rootScope.$broadcast('geocache_details_updated');
            }
        }


        function inArray(needle, haystack) {
            var length = haystack.length;
            for (var i = 0; i < length; i++) {
                if (haystack[i] == needle)
                    return true;
            }
            return false;
        }
    }

})();
