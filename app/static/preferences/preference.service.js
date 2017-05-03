(function () {
    angular
        .module('andyBeeApp')
        .factory('PreferenceService', PreferenceService);

    PreferenceService.$inject = ['$resource', 'LoggingService'];
    function PreferenceService ($resource, LoggingService) {
        var rest = $resource('/andyBee/api/v1.0/config/:id', null, {update: {method: 'PUT'}});
        var serv = {
            data: {},
            read: read,
            update: update,
            update_used_db: update_used_db,
            resolve_data_copy: resolve_data_copy
        };
        return serv;

        function read (success_cb) {
            rest.get({id: 1}, get_response, LoggingService.log_RESTful_error);

            function get_response (result) {
                serv.data = result.preference;
                if (typeof success_cb !== 'undefined') {
                    success_cb();
                }
            }
        }

        function update (data) {
            rest.update({id: 1}, {preference: serv.data}, on_update_response, LoggingService.log_RESTful_error);
            
            function on_update_response () {
                serv.data = data;
            }
        }

        function update_used_db (db_name) {
            serv.data.used_db = db_name;
            rest.update({id: 1}, {preference: {used_db: db_name}}, LoggingService.dummy_func, LoggingService.log_RESTful_error);
        }

        function resolve_data_copy () {
            return angular.copy(serv.data);
        }

    }

})();
