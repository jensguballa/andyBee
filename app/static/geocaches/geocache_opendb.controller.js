(function () {
    angular
        .module('andyBeeApp')
        .controller('GeocacheOpenDbCtrl', GeocacheOpenDbCtrl);

    GeocacheOpenDbCtrl.$inject = ['$uibModalInstance', 'GeocacheService'];
    function GeocacheOpenDbCtrl($uibModalInstance, GeocacheService) {
        var vm = this;
        vm.files = GeocacheService.db_list;
        vm.selected = GeocacheService.db_name;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal() {
            $uibModalInstance.dismiss(); 
        };

        function close_modal() {
            $uibModalInstance.close(vm.selected);
        };
    }
})();
