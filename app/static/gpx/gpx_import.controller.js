(function () {
    angular
        .module('andyBeeApp')
        .controller('GpxImportCtrl', GpxImportCtrl);

    GpxImportCtrl.$inject = ['$uibModalInstance'];
    function GpxImportCtrl($uibModalInstance) {
        var vm = this;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };
        
        function close_modal (data) {
            $uibModalInstance.close(data);
        };
    }
})();

