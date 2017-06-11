(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GpxImportCtrl', GpxImportCtrl);

    GpxImportCtrl.$inject = ['$uibModalInstance', 'PreferenceService'];
    function GpxImportCtrl($uibModalInstance, PreferenceService) {
        var vm = this;
        vm.form = {}
        vm.form.max_logs = PreferenceService.data.max_import;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };
        
        function close_modal (data) {
            data.user_name = PreferenceService.data.owner;
            $uibModalInstance.close(data);
        };
    }
})();

