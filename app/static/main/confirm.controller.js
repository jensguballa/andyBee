(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('ConfirmCtrl', ConfirmCtrl);
    
    ConfirmCtrl.$inject = ['$uibModalInstance', 'data'];
    function ConfirmCtrl ($uibModalInstance, data) {
        var vm = this;
        vm.ok = ok;
        vm.cancel = cancel;
        vm.headline = data.headline;
        vm.info = data.info;
        vm.question = data.question;

        function ok () {
            $uibModalInstance.close(); 
        }

        function cancel () {
            $uibModalInstance.dismiss(); 
        }
    }

})();

