(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GpxExportCtrl', GpxExportCtrl);

    GpxExportCtrl.$inject = ['$uibModalInstance'];
    function GpxExportCtrl($uibModalInstance) {
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

