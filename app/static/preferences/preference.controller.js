(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('PreferenceCtrl', PreferenceCtrl);

    PreferenceCtrl.$inject = ['$uibModalInstance', 'data', 'dbs'];
    function PreferenceCtrl($uibModalInstance, data, dbs) {
        var vm = this;
        vm.data = data;
        vm.dbs = dbs;
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

