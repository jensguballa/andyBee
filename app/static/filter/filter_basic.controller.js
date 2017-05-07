(function () {
    angular
        .module('andyBeeApp')
        .controller('BasicFilterCtrl', BasicFilterCtrl);

    BasicFilterCtrl.$inject = ['$uibModalInstance', 'filter_atoms', 'TYPE_TRANSLATION', 'TYPE_TO_PROP'];
    function BasicFilterCtrl($uibModalInstance, filter_atoms, TYPE_TRANSLATION, TYPE_TO_PROP) {
        var vm = this;

        // modal controls
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        // difficulty
        vm.diff_active = false;
        vm.diff_op = "ge";
        vm.diff_val = "1";

        // terrain
        vm.terr_active = false;
        vm.terr_op = "ge";
        vm.terr_val = "1";

        // geocache tyoe
        vm.type_active = false;
        vm.type = {};
        for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
            vm.type[TYPE_TRANSLATION[i].prop] = false;
        }

        // accordion[0] changed? (diff, terr, type)
        vm.changed_0 = false;
        vm.on_changed_0 = on_changed_0


        var atom_to_vm_map = {
            difficulty: map_diff_to_vm,
            terrain: map_terr_to_vm,
            type: map_type_to_vm,
        }

        // map the filter to the vm
        for (var i = 0, len = filter_atoms.length; i < len; i++) {
            var filter_atom = filter_atoms[i];
            var func = atom_to_vm_map[filter_atom.name];
            if (func) {
                func(filter_atom);
            }
            on_changed_0();
        }

        /////////// functions

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            filter_atoms = [];
            atom = {}
            if (is_diff_applicable()) {
                filter_atoms.push({name: "difficulty", op: vm.diff_op, val: vm.diff_val});
            }
            if (is_terr_applicable()) {
                filter_atoms.push({name: "terrain", op: vm.terr_op, val: vm.terr_val});
            }
            if (vm.type_active) {
                var vals = [];
                for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
                    if (vm.type[TYPE_TRANSLATION[i].prop]) {
                        vals.push(TYPE_TRANSLATION[i].text);
                    }
                }
                if (vals.length) {
                    filter_atoms.push({name: "type", op: "set", val: vals.join(',')});
                }
            }
            $uibModalInstance.close(filter_atoms);
        };

        function is_terr_applicable () {
            return vm.terr_active && ((vm.terr_op != "ge") || (vm.terr_val != "1"))
        }

        function is_diff_applicable () {
            return vm.diff_active && ((vm.diff_op != "ge") || (vm.diff_val != "1"))
        }

        function is_type_applicable () {
            if (vm.type_active) {
                for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
                    if (vm.type[TYPE_TRANSLATION[i].prop]) {
                        return true;
                    }
                }
            }
            return false;
        }

        function on_changed_0 () {
            vm.changed_0 = is_terr_applicable() || is_diff_applicable() || is_type_applicable();
        }

        function map_diff_to_vm (filter_atom) {
            vm.diff_active = true;
            vm.diff_op = filter_atom.op;
            vm.diff_val = filter_atom.val;
        }

        function map_terr_to_vm (filter_atom) {
            vm.terr_active = true;
            vm.terr_op = filter_atom.op;
            vm.terr_val = filter_atom.val;
        }

        function map_type_to_vm (filter_atom) {
            vm.type_active = true;
            var types = filter_atom.val.split(',');
            for (var i = 0, len = types.length; i < len; i++) {
                vm.type[TYPE_TO_PROP[types[i]]] = true;
            }
        }

    }
})();

