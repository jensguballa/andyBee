(function () {
    angular
        .module('logging', []).
        .factory('loglist', loglist);

    loglist.$inject = ['$log'];
    function loglist ($log) {
        var fact = this;
        fact = {
            log_RESTful_error: log_RESTful_error,
        }
        return fact;

        function log_RESTful_error (resp) {
            var msg = "Error. " + resp.config.method + " " + resp.config.url + " " + resp.status + " at: " + new Date();
            $log.error(msg);            
        }
    }
})();

