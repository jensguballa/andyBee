(function () {
    angular
        .module('andyBeeApp')
        .factory('LoggingService', LoggingService);

    LoggingService.$inject = ['$uibModal', '$log'];
    function LoggingService ($uibModal, $log) {
        var serv = {
            logs: [],
            log_RESTful_error: log_RESTful_error,
            dummy_func: function(){},
            remove_log: remove_log,
            log: log
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

        function log (args) {
            var type = args.type || 'danger'; 
            var str = new Date() + '; Error: "' + args.msg + '";';
            if (args.http_response) {
                str += ' HTTP Status Code: ' + args.http_response.status + '; Request: ' 
                    + args.http_response.config.method + " " + args.http_response.config.url + ';';
                if (args.http_response.data.msg) {
                    str += ' Server replied: "' + args.http_response.data.msg + '";';
                }
            }

            $log.error(str);
            serv.logs.push({type: type, msg: str});
            if (args.modal) {
                $uibModal.open({
                    animation: false,
                    controller: 'ErrorWindowCtrl',
                    controllerAs: "error",
                    templateUrl: '/static/logging/error.html',
                    resolve: {
                        msg: function() {return args.msg;}
                    }
                }).result.then(function(){}, function(){});
            }
        }
    }

})();


