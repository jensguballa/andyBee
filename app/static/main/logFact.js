(function () {
    angular
        .module('andyBeeApp')
        .factory('func', func);

    func.$inject = ['$log', 'andyBeeCtrl'];
    function func ($log, andyBeeCtrl) {
        var fact = this;
        fact = {
            log_RESTful_error: log_RESTful_error,
            dummy_func: dummy_func,
        };
        return fact;

        function log_RESTful_error (resp) {
            var msg = "Error. " + resp.config.method + " " + resp.config.url + " " + resp.status + " at: " + new Date();
            $log.error(msg);
            andyBeeCtrl.alerts.push({msg: msg, type: "danger"});
        }

        function dummy_func() {
        }

    }

})();
