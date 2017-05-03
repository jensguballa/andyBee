(function () {
    angular
        .module('andyBeeApp')
        .controller('GeocacheOpenDbCtrl', GeocacheOpenDbCtrl);

    GeocacheOpenDbCtrl.$inject = ['$uibModalInstance', 'dbs', 'selected'];
    function GeocacheOpenDbCtrl($uibModalInstance, dbs, selected) {
        var vm = this;
        vm.files = dbs;
        vm.selected = selected;
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
