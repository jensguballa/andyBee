(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('DeleteCtrl', DeleteCtrl);
    
    DeleteCtrl.$inject = ['$uibModalInstance', 'filter_name'];
    function DeleteCtrl ($uibModalInstance, filter_name) {
        var vm = this;
        if (filter_name == "") {
            vm.filter_active = false;
            vm.filter_name = "---";
            vm.selection = "all";
        }
        else {
            vm.filter_name = filter_name;
            vm.filter_active = true;
            vm.selection = "selected";
        }
        vm.ok = ok;
        vm.cancel = cancel;

        function ok () {
            $uibModalInstance.close(vm.selection); 
        }

        function cancel () {
            $uibModalInstance.dismiss(); 
        }
    }

})();

