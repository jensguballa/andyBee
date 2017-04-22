
(function () {
    angular
        .module('andyBeeApp')
        .factory('GeocacheService', GeocacheService);

    GeocacheService.$inject = ['$resource'];
    function GeocacheService ($resource) {
        var rest_dblist = $resource('/andyBee/api/v1.0/db/');
        var rest_geocache = $resource('/andyBee/api/v1.0/db/:db_name/geocaches/:geocache_id');
        var fact = {
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

        return fact;

        function get_dblist (success_cb) {
            rest_dblist.get(dblist_response, function(){});

            function dblist_response (result) {
                fact.db_list = result.dbs;
                success_cb();
            }
        }

        function get_geocache_list (db_name) {            
            rest_geocache.get({db_name: db_name}, geocache_list_response, function(){});

            function geocache_list_response (result) {
                fact.geocache_list = result.geocaches;
                fact.markers = [];
                var i, len;
                for (i = 0, len = result.geocaches.length; i < len; i++) {
                    fact.markers.push({
                        lat: result.geocaches[i].lat,
                        lng: result.geocaches[i].lon,
                        message: result.geocaches[i].title
                    });
                }
            }
        }


    }


})();
