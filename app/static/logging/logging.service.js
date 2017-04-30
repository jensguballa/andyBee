(function () {
    angular
        .module('andyBeeApp')
        .factory('LoggingService', LoggingService);

    LoggingService.$inject = ['$log'];
    function LoggingService ($log) {
        var serv = {
            logs: [],
            log_RESTful_error: log_RESTful_error,
            dummy_func: function(){},
            remove_log: remove_log
        };
        return serv;

        function log_RESTful_error (resp) {
            var msg = "Error. " + resp.config.method + " " + resp.config.url + " " + resp.status + " at: " + new Date();
            $log.error(msg);            
            serv.logs.push({type: 'danger', msg: msg});
        }

        function remove_log (index) {
            serv.logs.splice(index,1);
        }
    }

})();


