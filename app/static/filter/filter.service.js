(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('FilterService', FilterService);

    FilterService.$inject = ['$resource', '$uibModal', 'LoggingService', 'ERROR'];
    function FilterService ($resource, $uibModal, LoggingService, ERROR) {
        var conditions = [];

        var rest = $resource('/andyBee/api/v1.0/config/:id/filter/:filter_id', null, {
            update: {method: 'PUT'},
            create: {method: 'POST'}
        });
        var serv = {
            read_list: read_list,
            apply_basic_filter: apply_basic_filter,
            create_filter: create_filter,
            delete_filter: delete_filter,
            edit_filter: edit_filter,
            reset_filter: reset_filter,

            filter: {
                name: "",
                id:-1,
                sequence: -1,
                filter_atom: []
            },
            resolve_filter: resolve_filter,
            filter_applied: false,
            filter_name: "",

            filter_list: [],
            nbr_filters: 0
                

        };

        var atom_to_condition_map = {
            difficulty: int_prop_to_condition,
            terrain: int_prop_to_condition,
            type: type_to_condition,
            container: container_to_condition
        };

        var op_to_func_map = {
            eq: check_prop_eq,
            ge: check_prop_ge,
            le: check_prop_le,
        };

        return serv;

        /// functions

        function resolve_filter () {
            return serv.filter;
        }

        function read_list(on_success, on_error) {
            on_error = on_error || on_get_error;
            rest.get({id: 1}, on_get_response, on_error);

            function on_get_response (result) {
                serv.filter_list = result.filter;
                serv.nbr_filters = serv.filter_list.length;
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
                filter_atom: serv.filter.filter_atom
            }, on_create_response, on_create_error);

            function on_create_response (result) {
                serv.filter_list.push({
                    name: filter_name,
                    id: result.id,
                    sequence: serv.nbr_filters + 1,
                    filter_atom: angular.copy(serv.filter)
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

        function apply_basic_filter (geocache_list) {
            var conditions = generate_conditions(serv.filter.filter_atom);
            if (conditions.length == 0) {
                // nothing to filter
                return geocache_list;
            }
            var filtered_list = [];
            for (var i = 0, len = geocache_list.length; i < len; i++) {
                var geocache = geocache_list[i];
                var filtered = false;
                for (var j = 0, len2 = conditions.length; j < len2; j++) {
                    if (!conditions[j].func(geocache, conditions[j])) {
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
            var conditions = [];
            for (var i = 0, len = filter_atoms.length; i < len; i++) {
                var filter_atom = filter_atoms[i];
                var func = atom_to_condition_map[filter_atoms[i].name];
                if (func) {
                    var condition = func(filter_atom);
                    if (condition) {
                        conditions.push(condition);
                    }
                }
                else {
                    LoggingService.log({
                        msg: "Unknown filter condition: '" + filter_atom.name + "'. The filter condition will be ignored.",
                        type: 'warning',
                    });
                }
            }
            return conditions;
        }

        function int_prop_to_condition (filter_atom) {
            var op_func = op_to_func_map[filter_atom.op];
            if (!op_func) {
                LoggingService.log({
                    msg: "Filter: Unknown or unsupported operation: '" + filter_atom.op + "'. The filter condition will be ignored.",
                    type: 'warning',
                });
                return undefined;
            }
            return {property: filter_atom.name, func: op_func, value: parseFloat(filter_atom.value)};
        }

        function type_to_condition (filter_atom) {
            var types = filter_atom.value.split(',');
            var hash = {};
            for (var i = 0, len = types.length; i < len; i++) {
                hash[types[i]] = true;
            }
            return {property: filter_atom.name, func: check_prop_in_array, hash: hash};
        }

        function container_to_condition (filter_atom) {
            var containers = filter_atom.value.split(',');
            var hash = {};
            for (var i = 0, len = containers.length; i < len; i++) {
                hash[containers[i]] = true;
            }
            return {property: filter_atom.name, func: check_prop_in_array, hash: hash};
        }

        function single_geocache_filter (geocache) {
            return a_sample_filter.every(check_filter_atom);

            function check_filter_atom(filter_atom) {
                return filter_atom.func(geocache, filter_atom);
            }
        }

        function check_prop_eq (geocache, condition) {
            return geocache[condition.property] == condition.value;
        }

        function check_prop_ge (geocache, condition) {
            return geocache[condition.property] >= condition.value;
        }

        function check_prop_le (geocache, condition) {
            return geocache[condition.property] <= condition.value;
        }

        function check_prop_in_array (geocache, condition) {
            return condition.hash[geocache[condition.property]];
        }

    }

})();
