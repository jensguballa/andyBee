(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('BasicFilterCtrl', BasicFilterCtrl);

    BasicFilterCtrl.$inject = ['$uibModalInstance', 'FilterService', 'PreferenceService', 'GeocacheService', 'Functions', 'filter', 'TYPE_TRANSLATION', 'TYPE_TO_PROP', 'CONTAINER_TRANSLATION', 'CONTAINER_TO_PROP'];
    function BasicFilterCtrl($uibModalInstance, FilterService, PreferenceService, GeocacheService, Functions, filter, TYPE_TRANSLATION, TYPE_TO_PROP, CONTAINER_TRANSLATION, CONTAINER_TO_PROP) {
        var vm = this;

        // modal controls
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;
        vm.reset = reset_filter;
        vm.load_filter = load_filter;
        vm.attribute_clicked = attribute_clicked;

        vm.validate_distance = validate_distance;
        vm.validate_age = validate_age;
        vm.on_changed_0 = on_changed_0;
        vm.on_changed_1 = on_changed_1;
        vm.on_changed_2 = on_changed_2;
        vm.on_changed_3 = on_changed_3;
        vm.on_changed_4 = on_changed_4;
        vm.on_changed_5 = on_changed_5;

        vm.filter_list = [];
        vm.select = -1;
        vm.countries = GeocacheService.countries;
        vm.states = GeocacheService.states;

        var atom_to_vm_map = {
            difficulty: map_diff_to_vm,
            terrain: map_terr_to_vm,
            type: map_type_to_vm,
            container: map_container_to_vm,
            description: map_description_to_vm,
            title: map_title_to_vm,
            available: map_available_to_vm,
            archived: map_archived_to_vm,
            found: map_found_to_vm,
            owned: map_owned_to_vm,
            country: map_country_to_vm,
            state: map_state_to_vm,
            owner: map_owner_to_vm,
            hidden: map_placed_to_vm,
            distance: map_distance_to_vm,
            coords_updated: map_coords_updated_to_vm,
            age: map_age_to_vm,
            attributes: map_attributes_to_vm
        }

        vm.scratch_name = FilterService.scratch_filter.name;
        vm.name = filter.name;
        vm.show_name = (vm.name != "");
        filter_to_vm(filter.filter_atoms);

        if (filter.name != FilterService.scratch_filter.name) {
            vm.filter_list.push({id: -1, name: FilterService.scratch_filter.name});
        }
        for (var i = 0, len = FilterService.filter_list.length; i < len; i++) {
            var filt = FilterService.filter_list[i];
            if (filt.name != filter.name) {
                vm.filter_list.push({id: i, name: filt.name});
            }
        }
        
        /////////// functions

        function pad_zero (value, length) {
            // good enough for our purpose. 
            return ("0".repeat(length) + value).slice(-length);
        }

        function validate_distance () {
            vm.distance_invalid = isNaN(vm.distance);
        }

        function validate_age () {
            vm.age_invalid = isNaN(vm.age) || (Math.floor(vm.age) != vm.age);
        }

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        }

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
            if (is_title_applicable()) {
                ret_filter.filter_atoms.push({name: "title", op: vm.title_case ? "search_case" : "search", value: vm.title});
            }
            if (is_description_applicable()) {
                ret_filter.filter_atoms.push({name: "description", op: vm.description_case ? "search_case" : "search", value: vm.description});
            }
            if (is_available_applicable()) {
                ret_filter.filter_atoms.push({name: "available", op: "eq", value: vm.available.toString()});
            }
            if (is_archived_applicable()) {
                ret_filter.filter_atoms.push({name: "archived", op: "eq", value: vm.archived.toString()});
            }
            if (is_found_applicable()) {
                ret_filter.filter_atoms.push({name: "found", op: "eq", value: vm.found.toString()});
            }
            if (is_owned_applicable()) {
                ret_filter.filter_atoms.push({name: "owned", op: vm.owned ? "eq" : "ne", value: PreferenceService.data.owner});
            }
            if (is_country_applicable()) {
                ret_filter.filter_atoms.push({name: "country", op: "eq", value: vm.country});
            }
            if (is_state_applicable()) {
                ret_filter.filter_atoms.push({name: "state", op: "eq", value: vm.state});
            }
            if (is_owner_applicable()) {
                ret_filter.filter_atoms.push({name: "owner", op: "search", value: vm.owner});
            }
            if (is_placed_applicable()) {
                var date = new Date(vm.placed);
                ret_filter.filter_atoms.push({name: "hidden", op: vm.placed_cond, value: (date / 1000).toString()});
            }
            if (is_distance_applicable()) {
                ret_filter.filter_atoms.push({name: "distance", op: vm.distance_cond, value: (vm.distance * 1000).toString()});
            }
            if (is_corrected_applicable()) {
                ret_filter.filter_atoms.push({name: "coords_updated", op: "eq", value: vm.corrected.toString()});
            }
            if (is_age_applicable()) {
                ret_filter.filter_atoms.push({name: "age", op: vm.age_cond, value: vm.age.toString()});
            }
            if (vm.attributes_active) {
                var arr = [];
                for (var i = 0, len = vm.attributes.length; i < len; i++) {
                    var attr = vm.attributes[i];
                    if (attr.state != 'dis') {
                        arr.push((attr.state == 'yes' ? '+' : '-') + attr.string);
                    }
                }
                if (arr.length > 0) {
                    ret_filter.filter_atoms.push({name: "attributes", op: "set", value: arr.join(',')});
                }
            }
            $uibModalInstance.close(ret_filter);
        }

        function load_filter (id) {
            if (id == -1) {
                filter_to_vm(FilterService.scratch_filter.filter_atoms);
            }
            else {
                filter_to_vm(FilterService.filter_list[id].filter_atoms);
            }
        }

        function reset_filter () {
            filter_to_vm([]);    
        }

        function attribute_clicked (idx) {
            if (!vm.attributes_active) {
                return;
            }
            var attr = vm.attributes[idx];
            if (attr.state == "dis") {
                attr.state = "yes";
            }
            else if (attr.state == "yes") {
                attr.state = "no";
            }
            else {
                attr.state = "dis";
            }
            attr.src = Functions.attr_to_img(attr.string, attr.state);
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

            // title
            vm.title_active = false;
            vm.title = "";

            // description
            vm.description_active = false;
            vm.description = "";
            vm.description_case = false;

            // status
            vm.available = true;
            vm.available_active = false;
            vm.archived = true;
            vm.archived_active = false;
            vm.found = true;
            vm.found_active = false;
            vm.owned = true;
            vm.owned_active = false;
            vm.country = "";
//            vm.country_active = false;
            vm.state = "";
//            vm.state_active = false;
            vm.owner_active = false;
            vm.owner = "";
            vm.placed_active = false;
            vm.placed_cond = "le";
            vm.placed = "";
            var date = new Date();
            vm.placed_max = pad_zero(date.getFullYear(), 4) + "-" + pad_zero(date.getMonth() + 1, 2) + "-" + pad_zero(date.getDate(), 2);
            vm.distance_active = false;
            vm.distance = "";
            vm.distance_cond = "lt";
            vm.distance_invalid = false;
            vm.corrected_active = false;
            vm.corrected = true;
            vm.age_active = false;
            vm.age_cond = "gt";
            vm.age = "0";
            vm.age_invalid = false;

            vm.attributes_active = false;
            vm.attributes = [];
            var attr_str = Functions.get_attributes();
            for (var i = 0, len = attr_str.length; i < len; i++) {
                var string = attr_str[i];
                vm.attributes[i] = {
                    string: string,
                    state: "dis",
                    src: Functions.attr_to_img(string, "dis")
                };
            }


            // accordion[0] changed? (diff, terr, type)
            vm.changed_0 = false;
            // accordion[1] changed? (container)
            vm.changed_1 = false;
            // accordion[2] changed? (country, state)
            vm.changed_2 = false;
            // accordion[3] changed? (coords_updated)
            vm.changed_3 = false;
            // accordion[4] changed? (attributes)
            vm.changed_4 = false;
            // accordion[5] changed? (age)
            vm.changed_5 = false;
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
            on_changed_2();
            on_changed_3();
            on_changed_4();
            on_changed_5();

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
            return (vm.description_active && (vm.description != ""));
        }

        function is_title_applicable () {
            return vm.title_active && (vm.title != "");
        }

        function is_available_applicable () {
            return vm.available_active;
        }

        function is_archived_applicable () {
            return vm.archived_active;
        }

        function is_found_applicable () {
            return vm.found_active;
        }

        function is_owned_applicable () {
            return vm.owned_active;
        }

        function is_country_applicable () {
            return (vm.country != "");
        }

        function is_owner_applicable () {
            return (vm.owner_active && (vm.owner != ""));
        }

        function is_placed_applicable () {
            return (vm.placed_active && (vm.placed != ""));
        }

        function is_state_applicable () {
            return (vm.state != "");
        }

        function is_distance_applicable () {
            return vm.distance_active && !vm.distance_invalid && vm.distance != "";
        }

        function is_corrected_applicable () {
            return vm.corrected_active;
        }

        function is_age_applicable () {
            return vm.age_active && !vm.age_invalid && vm.age != "";
        }

        function is_attribute_applicable () {
            if (!vm.attributes_active) {
                return false;
            }
            for (var i = 0, len = vm.attributes.length; i < len; i++) {
                if (vm.attributes[i].state != "dis") {
                    return true;
                }
            }
            return false;
        }

        function on_changed_0 () {
            vm.changed_0 = is_terr_applicable() || is_diff_applicable() || is_type_applicable();
        }

        function on_changed_1 () {
            vm.changed_1 = 
                is_container_applicable() || 
                is_title_applicable() || 
                is_description_applicable() || 
                is_available_applicable() || 
                is_archived_applicable() || 
                is_found_applicable() || 
                is_owned_applicable();
        }

        function on_changed_2 () {
            vm.changed_2 = is_country_applicable() || is_state_applicable() || is_owner_applicable() || is_placed_applicable() || is_distance_applicable();
        }

        function on_changed_3 () {
            vm.changed_3 = is_corrected_applicable();
        }

        function on_changed_4 () {
            vm.changed_4 = is_attribute_applicable();
        }

        function on_changed_5 () {
            vm.changed_5 = is_age_applicable();
        }

        function map_diff_to_vm (filter_atom) {
            vm.diff_active = true;
            vm.diff_op = filter_atom.op;
            vm.diff_val = filter_atom.value;
        }

        function map_terr_to_vm (filter_atom) {
            vm.terr_active = true;
            vm.terr_op = filter_atom.op;
            vm.terr_val = filter_atom.value;
        }

        function map_type_to_vm (filter_atom) {
            vm.type_active = true;
            var types = filter_atom.value.split(',');
            for (var i = 0, len = types.length; i < len; i++) {
                vm.type[TYPE_TO_PROP[types[i]]] = true;
            }
        }

        function map_container_to_vm (filter_atom) {
            vm.container_active = true;
            var containers = filter_atom.value.split(',');
            for (var i = 0, len = containers.length; i < len; i++) {
                vm.container[CONTAINER_TO_PROP[containers[i]]] = true;
            }
        }

        function map_description_to_vm (filter_atom) {
            vm.description_active = true;
            vm.description = filter_atom.value;
            vm.description_case = (filter_atom.op == "search_case");
        }

        function map_title_to_vm (filter_atom) {
            vm.title_active = true;
            vm.title = filter_atom.value;
        }

        function map_available_to_vm (filter_atom) {
            vm.available_active = true;
            vm.available = filter_atom.value;
        }

        function map_archived_to_vm (filter_atom) {
            vm.archived_active = true;
            vm.archived = filter_atom.value;
        }

        function map_found_to_vm (filter_atom) {
            vm.found_active = true;
            vm.found = filter_atom.value;
        }

        function map_owned_to_vm (filter_atom) {
            vm.owned_active = true;
            vm.owned = (filter_atom.op == "eq");
        }

        function map_country_to_vm (filter_atom) {
//            vm.country_active = true;
            GeocacheService.add_country(filter_atom.value);
            vm.country = filter_atom.value;
        }

        function map_state_to_vm (filter_atom) {
//            vm.state_active = true;
            GeocacheService.add_state(filter_atom.value);
            vm.state = filter_atom.value;
        }

        function map_owner_to_vm (filter_atom) {
            vm.owner_active = true;
            vm.owner = filter_atom.value;
        }

        function map_placed_to_vm (filter_atom) {
            vm.placed_active = true;
            vm.placed_cond = filter_atom.op;
            var date = new Date(filter_atom.value * 1000);
            vm.placed = pad_zero(date.getFullYear(), 4) + "-" + pad_zero(date.getMonth() + 1, 2) + "-" + pad_zero(date.getDate(), 2);
        }

        function map_owner_to_vm (filter_atom) {
            vm.owner_active = true;
            vm.owner = filter_atom.value;
        }

        function map_distance_to_vm (filter_atom) {
            vm.distance_active = true;
            vm.distance_cond = filter_atom.op;
            vm.distance = filter_atom.value / 1000;
            vm.distance_invalid = false;
        }

        function map_coords_updated_to_vm (filter_atom) {
            vm.corrected_active = true;
            vm.corrected = (filter_atom.value == "true");
        }

        function map_age_to_vm (filter_atom) {
            vm.age_active = true;
            vm.age_cond = filter_atom.op;
            vm.age = filter_atom.value;
            vm.age_invalid = false;
        }

        function map_attributes_to_vm (filter_atom) {
            var attributes = filter_atom.value.split(',');
            for (var i = 0, len = attributes.length; i < len; i++) {
                var plus_min = attributes[i].substr(0,1);
                var attr_name = attributes[i].substr(1);
                for (var j = 0, len2 = vm.attributes.length; j < len2; j++) {
                    if (vm.attributes[j].string == attr_name) {
                        var state = (plus_min == '+' ? 'yes' : 'no');
                        vm.attributes[j].state = state;
                        vm.attributes[j].src = Functions.attr_to_img(vm.attributes[j].string, state);
                        vm.attributes_active = true;
                        break;
                    }
                }
            }
        }

    }
})();

