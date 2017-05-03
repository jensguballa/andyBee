(function () {
    angular
        .module('andyBeeApp')
        .factory('DbService', DbService);

    DbService.$inject = ['$resource', 'LoggingService'];
    function DbService ($resource, LoggingService) {
        var rest = $resource('/andyBee/api/v1.0/db/', null, {
            post: {
                method: 'POST'
            }
        });
        
        var serv = {
            db_list: [],
            read: read,
            create: create,
            is_in_dblist: is_in_dblist,
            resolve_db_list: resolve_db_list
        };

        return serv;


        function resolve_db_list () {
            return serv.db_list;
        }

        function read (success_cb, fail_cb) {
            fail_cb = fail_cb || LoggingService.log_RESTful_error;
            rest.get(on_get_response, fail_cb);

            function on_get_response (result) {
                serv.db_list = result.dbs;
                if (success_cb) {
                    success_cb();
                }
            }
        }

        function create (db_name, success_cb, fail_cb) {
            fail_cb = fail_cb || LoggingService.log_RESTful_error;
            rest.post({db: db_name}, on_post_response, fail_cb);

            function on_post_response (result) {
                if (success_cb) {
                    success_cb();
                }
            }
        }

        function is_in_dblist (db_name) {
            return inArray(db_name, serv.db_list);
        }
    }

    function inArray (needle, haystack) {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle)
                return true;
        }
        return false;
    }


})();

