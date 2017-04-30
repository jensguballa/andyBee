
(function () {
    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$rootScope', '$resource', 'PreferenceService', 'LoggingService'];
    function GeocacheService ($rootScope, $resource, PreferenceService, LoggingService) {
        var rest_dblist = $resource('/andyBee/api/v1.0/db/');
        var rest_geocache = $resource('/andyBee/api/v1.0/db/:db_name/geocaches/:geocache_id');
        var serv = {
            // stuff related to the list of DBs
            db_list: [],
            get_dblist: get_dblist,
            db_name: '',

            // stuff related to geocaches within a db
            geocache_list: [],
            get_geocache_list: get_geocache_list,

            // map related stuff
            markers: [],
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
            rest_geocache.get({db_name: db_name}, geocache_list_response, LoggingService.log_RESTful_error);

            function geocache_list_response (result) {
                serv.db_name = result.db_name;
                PreferenceService.set_used_db(result.db_name);
                serv.nbr_caches = result.nbr_caches;

                serv.geocache_list = result.geocaches;
//                serv.markers = [];
                var markers = [];
                var i, len;
                for (i = 0, len = result.geocaches.length; i < len; i++) {
                    markers.push({
                        lat: result.geocaches[i].lat,
                        lng: result.geocaches[i].lon,
                        message: result.geocaches[i].title
                    });
                }
                serv.markers = markers;
                $rootScope.$broadcast('geocaches_updated');
            }
        }


    }


})();
