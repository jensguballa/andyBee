(function () {
    angular
        .module('andyBeeApp')
        .controller('BasicFilterCtrl', BasicFilterCtrl);

    BasicFilterCtrl.$inject = ['$uibModalInstance'];
    function BasicFilterCtrl($uibModalInstance) {
        var vm = this;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        vm.on_changed_0 = on_changed_0
        vm.changed_0 = false;

        vm.diff_active = false;
        vm.diff_op = 0;
        vm.diff_val = 1;
        vm.terr_active = false;
        vm.terr_op = 0;
        vm.terr_val = 1;


        vm.type_active = false;
        vm.type = {
            tradi:     false,
            letter:    false,
            event:     false,
            multi:     false,
            wherigo:   false,
            mega:      false,
            unknown:   false,
            earth:     false,
            cito:      false,
            virtual:   false,
            adventure: false,
            webcam:    false,
            ape:       false,
            less:      false
        };

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            $uibModalInstance.close();
        };

        function on_changed_0 () {
            if (vm.diff_active && ((vm.diff_op != 0) || (vm.diff_val != 1))) {
                vm.changed_0 = true;
                return;
            }
            if (vm.terr_active && ((vm.terr_op != 0) || (vm.terr_val != 1))) {
                vm.changed_0 = true;
                return;
            }
            if (vm.type_active) {
                for (var type in vm.type) {
                    if (vm.type.hasOwnProperty(type)) {
                        if (vm.type[type]) {
                            vm.changed_0 = true;
                            return;
                        }
                    }
                }
            }
            vm.changed_0 = false;
        }
    }
})();

