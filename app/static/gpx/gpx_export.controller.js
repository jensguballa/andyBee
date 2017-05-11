(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GpxExportCtrl', GpxExportCtrl);

    GpxExportCtrl.$inject = ['$uibModalInstance'];
    function GpxExportCtrl($uibModalInstance) {
        var vm = this;

        vm.data = {
            file_name: "",
            max_logs: 5,
            waypoints: true
        };

        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };
        
        function close_modal () {
            $uibModalInstance.close(vm.data);
        };
    }
})();

