(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('ErrorWindowCtrl', ErrorWindowCtrl);
    
    ErrorWindowCtrl.$inject = ['$uibModalInstance', 'msg'];
    function ErrorWindowCtrl($uibModalInstance, msg) {
        var vm = this;
        vm.msg = msg;
        vm.dismiss = dismiss;

        function dismiss () {
            $uibModalInstance.dismiss(); 
        }
    }


})();

