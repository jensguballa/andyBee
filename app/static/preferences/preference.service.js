(function () {
    angular
        .module('andyBeeApp')
        .factory('PreferenceService', PreferenceService);

    PreferenceService.$inject = ['$resource', 'LoggingService'];
    function PreferenceService ($resource, LoggingService) {
        var rest = $resource('/andyBee/api/v1.0/config/:id', null, {update: {method: 'PUT'}});
        var serv = {
            get_request: get_request,
            get_data: get_data,
            update_data: update_data,
            set_used_db: set_used_db,
            preference: {}
        };
        return serv;

        function get_request (success_cb) {
            rest.get({id: 1}, get_response, LoggingService.log_RESTful_error);

            function get_response (result) {
                serv.preference = result.preference;
                success_cb();
            }
        }

        function get_data() {
            return serv.preference;
        }

        function update_data (data) {
            serv.preference = data;
            rest.update({id: 1}, {preference: serv.preference}, LoggingService.dummy_func, LoggingService.log_RESTful_error);
        }

        function set_used_db (db_name) {
            serv.preference.used_db = db_name;
            rest.update({id: 1}, {preference: {used_db: db_name}}, LoggingService.dummy_func, LoggingService.log_RESTful_error);
        }

    }

})();
