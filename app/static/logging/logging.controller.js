(function () {
    angular
        .module('andyBeeApp')
        .controller('LoggingCtrl', LoggingCtrl);
    
    LoggingCtrl.$inject = ['LoggingService'];
    function LoggingCtrl(LoggingService) {
        var vm = this;
        vm.serv = LoggingService; 
    }

})();

