(function () {
    angular
        .module('andyBeeApp')
        .controller('PreferenceCtrl', PreferenceCtrl);

    PreferenceCtrl.$inject = ['$uibModalInstance', 'PreferenceService'];
    function PreferenceCtrl($uibModalInstance, PreferenceService) {
        var vm = this;
        vm.data = preference;
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

