(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('FilterService', FilterService);

    FilterService.$inject = ['$resource', '$uibModal', '$injector', '$q', 'LoggingService', 'ERROR'];
    function FilterService ($resource, $uibModal, $injector, $q, LoggingService, ERROR) {

        var rest = $resource('/andyBee/api/v1.0/config/:id/filter/:filter_id', null, {
            update: {method: 'PUT'},
            create: {method: 'POST'}
        });

        var rest_filter_on_descr = $resource('/andyBee/api/v1.0/db/:db/filter_on_descr', null, {
            post: {method: 'POST'}
        });

        var serv = {
            read_list: read_list,
            apply_basic_filter: apply_basic_filter,
            create_filter: create_filter,
            delete_filter: delete_filter,
            edit_filter: edit_filter,
            reset_filter: reset_filter,
            filter_settings_updated: filter_settings_updated,
            scratch_filter_updated: scratch_filter_updated,
            resolve_scratch_filter: resolve_scratch_filter,

            scratch_filter: {
                name: "*Scratch*",
                id:-1,
                sequence: -1,
                filter_atoms: []
            },
            conditions: [],

            filter_applied: false,
            filter_name: "",
            applied_filter_idx: -1,

            filter_list: [],
            nbr_filters: 0
                

        };

        var atom_to_condition_map = {
            difficulty: int_prop_to_condition,
            terrain: int_prop_to_condition,
            type: type_to_condition,
            container: container_to_condition,
            description: description_to_condition,
            title: search_prop_to_condition,
            available: bool_prop_to_condition,
            archived: bool_prop_to_condition,
            found: bool_prop_to_condition,
            owned: owned_to_condition,
            country: check_equal_to_condition,
            state: check_equal_to_condition,
            hidden: int_prop_to_condition,
            owner: search_prop_to_condition,
            distance: int_prop_to_condition,
            coords_updated: bool_prop_to_condition,
            age: int_prop_to_condition
        };

        var op_to_func_map = {
            eq: check_prop_eq,
            ne: check_prop_ne,
            ge: check_prop_ge,
            le: check_prop_le,
            gt: check_prop_gt,
            lt: check_prop_lt,
            search: check_prop_search
        };

        return serv;

        /// functions

        function resolve_scratch_filter () {
            return serv.scratch_filter;
        }

        function read_list(on_success, on_error) {
            on_error = on_error || on_get_error;
            rest.get({id: 1}, on_get_response, on_error);

            function on_get_response (result) {
                serv.filter_list = result.filter;
                serv.nbr_filters = 0;
                for (var i = 0, len = serv.filter_list.length; i < len; i++) {
                    if (serv.filter_list[i].sequence > serv.nbr_filters) {
                        serv.nbr_filters = serv.filter_list[i].sequence;
                    }
                }
                if (on_success) {
                    on_success();
                }
            }

            function on_get_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_FILTER_FROM_SERVER, 
                    http_response: result,
                    modal: true
                });
            }
        }

        function create_filter (filter_name, on_success, on_error) {
            on_error = on_error || on_create_error;
            rest.create({id: 1}, {
                name: filter_name,
                sequence: serv.nbr_filters + 1,
                filter_atoms: serv.scratch_filter.filter_atoms
            }, on_create_response, on_create_error);

            function on_create_response (result) {
                serv.filter_list.push({
                    name: filter_name,
                    id: result.id,
                    sequence: serv.nbr_filters + 1,
                    filter_atoms: angular.copy(serv.scratch_filter)
                });
                serv.nbr_filters++;
                if (on_success) {
                    on_success();
                }
            }

            function on_create_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_CREATE_FILTER_ON_SERVER, 
                    http_response: result,
                    modal: true
                });
            }
        }

        function delete_filter(idx, on_success, on_error) {
            on_error = on_error || on_delete_error;
            rest.delete({id: 1, filter_id: serv.filter_list[idx].id}, on_delete_response, on_error);

            function on_delete_response (result) {
                serv.filter_list.splice(idx,1);
                if (on_success) {
                    on_success();
                }
            }

            function on_delete_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_DELETE_FILTER_FROM_SERVER, 
                    http_response: result,
                    modal: true
                });
            }
        }

        function edit_filter (idx) {
            $uibModal.open({
                animation: false,
                controller: 'BasicFilterCtrl',
                controllerAs: "basic",
                templateUrl: '/static/filter/basic.html',
                resolve: {
                    filter: resolve_filter_idx
                }
            }).result.then(on_dialog_ok, function(){});

            function resolve_filter_idx () {
                return serv.filter_list[idx];
            }

            function on_dialog_ok (filter) {
                rest.update({id:1, filter_id: filter.id}, {filter: filter}, on_update_result, on_update_error);

                function on_update_result (result) {
                    serv.filter_list[idx] = filter;
                    if (serv.filter_applied && (idx == serv.applied_filter_idx)) {
                        filter_settings_updated(serv.applied_filter_idx);
                    }
                }

                function on_update_error (result) {
                    LoggingService.log({
                        msg: ERROR.FAILURE_UPDATE_FILTER_ON_SERVER, 
                        http_response: result,
                        modal: true
                    });
                }
            }
        }

        function reset_filter() {
            serv.filter_applied = false;
            serv.filter_name = "";
        }

        function scratch_filter_updated (filter) {
            serv.scratch_filter.filter_atoms = filter.filter_atoms;
        }

        function filter_settings_updated (idx) {
            serv.applied_filter_idx = idx;
            var filter = (idx == -1) ? serv.scratch_filter : serv.filter_list[idx];
            var promise = generate_conditions(filter.filter_atoms);
            if (promise) {
                promise.then(filter_settings_complete);
            }
            else {
                filter_settings_complete();
            }

            function filter_settings_complete () {
                serv.filter_name = filter.name;
                $injector.get('GeocacheService').on_filter_changed();
            }
        }

        function apply_basic_filter (geocache_list) {
            if (serv.conditions.length == 0) {
                // nothing to filter
                return geocache_list;
            }

            var filtered_list = [];
            for (var i = 0, len = geocache_list.length; i < len; i++) {
                var geocache = geocache_list[i];
                var filtered = false;
                for (var j = 0, len2 = serv.conditions.length; j < len2; j++) {
                    if (!serv.conditions[j].func(geocache, serv.conditions[j])) {
                        filtered = true;
                        break;
                    }
                }
                if (!filtered) {
                    filtered_list.push(geocache);
                }
            }
            serv.filter_applied = true;
            return filtered_list;
        }

        function generate_conditions (filter_atoms) {
            serv.conditions = [];
            var promises = [];
            for (var i = 0, len = filter_atoms.length; i < len; i++) {
                var filter_atom = filter_atoms[i];
                var func = atom_to_condition_map[filter_atom.name];
                if (func) {
                    var promise = func(filter_atom);
                    if (promise) {
                        promises.push(promise);
                    }
                }
                else {
                    LoggingService.log({
                        msg: "Unknown filter condition: '" + filter_atom.name + "'. The filter condition will be ignored.",
                        type: 'warning',
                    });
                }
            }
            return $q.all(promises);
        }

        function int_prop_to_condition (filter_atom) {
            var op_func = op_to_func_map[filter_atom.op];
            if (op_func) {
                serv.conditions.push({property: filter_atom.name, func: op_func, value: parseFloat(filter_atom.value)});
            }
            else {
                LoggingService.log({
                    msg: "Filter: Unknown or unsupported operation: '" + filter_atom.op + "'. The filter condition will be ignored.",
                    type: 'warning',
                });
            }
            return undefined; // no promise
        }

        function bool_prop_to_condition (filter_atom) {
            serv.conditions.push({property: filter_atom.name, func: check_prop_eq, value: (filter_atom.value == "true")});
            return undefined; // no promise
        }

        function check_equal_to_condition (filter_atom) {
            serv.conditions.push({property: filter_atom.name, func: check_prop_eq, value: filter_atom.value});
            return undefined; // no promise
        }

        function search_prop_to_condition (filter_atom) {
            var regex;
            if (filter_atom.op == "search_case") {
                regex = new RegExp(filter_atom.value);
            }
            else {
                regex = new RegExp(filter_atom.value, "i");
            }
            serv.conditions.push({property: filter_atom.name, func: check_prop_search, value: regex});
        }

        function type_to_condition (filter_atom) {
            var types = filter_atom.value.split(',');
            var hash = {};
            for (var i = 0, len = types.length; i < len; i++) {
                hash[types[i]] = true;
            }
            serv.conditions.push({property: filter_atom.name, func: check_prop_in_array, hash: hash});
            return undefined; // no promise
        }

        function container_to_condition (filter_atom) {
            var containers = filter_atom.value.split(',');
            var hash = {};
            for (var i = 0, len = containers.length; i < len; i++) {
                hash[containers[i]] = true;
            }
            serv.conditions.push({property: filter_atom.name, func: check_prop_in_array, hash: hash});
            return undefined; // no promise
        }

        function description_to_condition (filter_atom) {
            var hash = {};
            var db_name =  $injector.get('GeocacheService').db_name;

            var resource = rest_filter_on_descr.post(
                {db: db_name}, 
                {search_for: filter_atom.value, case_sensitive: filter_atom.op == "search_case"}, 
                on_post_response, 
                on_post_error
            );
            serv.conditions.push({property: "id", func: check_prop_in_array, hash: hash});
            return resource.$promise;

            function on_post_response (result) {
                for (var i = 0, len = result.filtered_list.length; i < len; i++) {
                    hash[result.filtered_list[i]] = true;
                }
            }

            function on_post_error(result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_FILTER_ON_DESCRIPTION,
                    http_response: result,
                    modal: true
                });
            }
        }

        function owned_to_condition (filter_atom) {
            serv.conditions.push({property: "owner", func: op_to_func_map[filter_atom.op], value: filter_atom.value});
            return undefined; // no promise
        }

        function check_prop_eq (geocache, condition) {
            return geocache[condition.property] == condition.value;
        }

        function check_prop_ne (geocache, condition) {
            return geocache[condition.property] != condition.value;
        }

        function check_prop_ge (geocache, condition) {
            return geocache[condition.property] >= condition.value;
        }

        function check_prop_le (geocache, condition) {
            return geocache[condition.property] <= condition.value;
        }

        function check_prop_gt (geocache, condition) {
            return geocache[condition.property] > condition.value;
        }

        function check_prop_lt (geocache, condition) {
            return geocache[condition.property] < condition.value;
        }

        function check_prop_in_array (geocache, condition) {
            return condition.hash[geocache[condition.property]];
        }

        function check_prop_search (geocache, condition) {
            return geocache[condition.property].search(condition.value) != -1;
        }

    }

})();
