(function () {
    angular
        .module('andyBeeApp')
        .controller('BasicFilterCtrl', BasicFilterCtrl);

    BasicFilterCtrl.$inject = ['$uibModalInstance'];
    function BasicFilterCtrl($uibModalInstance) {
        var vm = this;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            $uibModalInstance.close();
        };
    }
})();

