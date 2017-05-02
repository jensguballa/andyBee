(function () {
    angular
        .module('andyBeeApp')
        .controller('PreferenceCtrl', PreferenceCtrl);

    PreferenceCtrl.$inject = ['$uibModalInstance', 'PreferenceService'];
    function PreferenceCtrl($uibModalInstance, PreferenceService) {
        var vm = this;
        vm.data = angular.copy(PreferenceService.data);
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            $uibModalInstance.close();
            PreferenceService.data = angular.copy(vm.data);
            PreferenceService.update();
        };
    }
})();

