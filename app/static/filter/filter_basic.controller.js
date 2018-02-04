(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('BasicFilterCtrl', BasicFilterCtrl);

    BasicFilterCtrl.$inject = ['$uibModalInstance', 'FilterService', 'filter', 'TYPE_TRANSLATION', 'TYPE_TO_PROP', 'CONTAINER_TRANSLATION', 'CONTAINER_TO_PROP'];
    function BasicFilterCtrl($uibModalInstance, FilterService, filter, TYPE_TRANSLATION, TYPE_TO_PROP, CONTAINER_TRANSLATION, CONTAINER_TO_PROP) {
        var vm = this;

        // modal controls
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;
        vm.load_filter = load_filter;

        vm.on_changed_0 = on_changed_0;
        vm.on_changed_1 = on_changed_1;

        vm.filter_list = [];
        vm.select = -1;

        var atom_to_vm_map = {
            difficulty: map_diff_to_vm,
            terrain: map_terr_to_vm,
            type: map_type_to_vm,
            container: map_container_to_vm,
            description: map_description_to_vm
        }

        vm.name = filter.name;
        vm.show_name = (vm.name != "");
        filter_to_vm(filter.filter_atoms);

        for (var i = 0, len = FilterService.filter_list.length; i < len; i++) {
            var filt = FilterService.filter_list[i];
            if (filt.name != filter.name) {
                vm.filter_list.push({id: i, name: filt.name});
            }
        }
        
        /////////// functions

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            var ret_filter = {
                name: vm.name,
                id: filter.id,
                sequence: filter.sequence,
                filter_atoms: []
            };
            if (is_diff_applicable()) {
                ret_filter.filter_atoms.push({name: "difficulty", op: vm.diff_op, value: vm.diff_val});
            }
            if (is_terr_applicable()) {
                ret_filter.filter_atoms.push({name: "terrain", op: vm.terr_op, value: vm.terr_val});
            }
            if (vm.type_active) {
                var vals = [];
                for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
                    if (vm.type[TYPE_TRANSLATION[i].prop]) {
                        vals.push(TYPE_TRANSLATION[i].text);
                    }
                }
                if (vals.length) {
                    ret_filter.filter_atoms.push({name: "type", op: "set", value: vals.join(',')});
                }
            }
            if (vm.container_active) {
                var vals = [];
                for (var i = 0, len = CONTAINER_TRANSLATION.length; i < len; i++) {
                    if (vm.container[CONTAINER_TRANSLATION[i].prop]) {
                        vals.push(CONTAINER_TRANSLATION[i].text);
                    }
                }
                if (vals.length) {
                    ret_filter.filter_atoms.push({name: "container", op: "set", value: vals.join(',')});
                }
            }
            if (vm.description_active && (vm.description != '')) {
                ret_filter.filter_atoms.push({name: "description", op: "search", value: vm.description});
            }
            $uibModalInstance.close(ret_filter);
        };

        function load_filter (id) {
            filter_to_vm(FilterService.filter_list[id].filter_atoms);
        }

        function init_vm () {

            // difficulty
            vm.diff_active = false;
            vm.diff_op = "ge";
            vm.diff_val = "1";

            // terrain
            vm.terr_active = false;
            vm.terr_op = "ge";
            vm.terr_val = "1";

            // geocache type
            vm.type_active = false;
            vm.type = {};
            for (var i = 0, len = TYPE_TRANSLATION.length; i < len; i++) {
                vm.type[TYPE_TRANSLATION[i].prop] = false;
            }

            // container
            vm.container_active = false;
            vm.container = {};
            for (var i = 0, len = CONTAINER_TRANSLATION.length; i < len; i++) {
                vm.container[CONTAINER_TRANSLATION[i].prop] = false;
            }

            // description
            vm.description_active = false;
            vm.description = "";

            // accordion[0] changed? (diff, terr, type)
            vm.changed_0 = false;
            // accordion[1] changed? (container)
            vm.changed_1 = false;
        }

        // map the filter to the vm
        function filter_to_vm (filter_atoms) {
            init_vm();

            for (var i = 0, len = filter_atoms.length; i < len; i++) {
                var atom = filter_atoms[i];
                var func = atom_to_vm_map[atom.name];
                if (func) {
                    func(atom);
                }
            }
            on_changed_0();
            on_changed_1();
        }

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

        function is_container_applicable () {
            if (vm.container_active) {
                for (var i = 0, len = CONTAINER_TRANSLATION.length; i < len; i++) {
                    if (vm.container[CONTAINER_TRANSLATION[i].prop]) {
                        return true;
                    }
                }
            }
            return false;
        }

        function is_description_applicable () {
            return vm.description_active && vm.description != "";
        }


        function on_changed_0 () {
            vm.changed_0 = is_terr_applicable() || is_diff_applicable() || is_type_applicable();
        }

        function on_changed_1 () {
            vm.changed_1 = is_container_applicable() || is_description_applicable();
        }

        function map_diff_to_vm (filter_atoms) {
            vm.diff_active = true;
            vm.diff_op = filter_atoms.op;
            vm.diff_val = filter_atoms.value;
        }

        function map_terr_to_vm (filter_atoms) {
            vm.terr_active = true;
            vm.terr_op = filter_atoms.op;
            vm.terr_val = filter_atoms.value;
        }

        function map_type_to_vm (filter_atoms) {
            vm.type_active = true;
            var types = filter_atoms.value.split(',');
            for (var i = 0, len = types.length; i < len; i++) {
                vm.type[TYPE_TO_PROP[types[i]]] = true;
            }
        }

        function map_container_to_vm (filter_atoms) {
            vm.container_active = true;
            var containers = filter_atoms.value.split(',');
            for (var i = 0, len = containers.length; i < len; i++) {
                vm.container[CONTAINER_TO_PROP[containers[i]]] = true;
            }
        }

        function map_description_to_vm (filter_atoms) {
            vm.description_active = true;
            vm.description = filter_atoms.value;
        }

    }
})();

