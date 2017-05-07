(function () {
    angular
        .module('andyBeeApp')
        .factory('FilterService', FilterService);

    FilterService.$inject = ['$resource', 'LoggingService'];
    function FilterService ($resource, LoggingService) {
        var conditions = [];

        var rest = $resource('/andyBee/api/v1.0/config/:id/filter', null, {update: {method: 'PUT'}});
        var serv = {
            read_list: read_list,
            apply_basic_filter: apply_basic_filter,

            filter: [],
            resolve_filter: resolve_filter

        };

        var atom_to_condition_map = {
            difficulty: int_prop_to_condition,
            terrain: int_prop_to_condition,
            type: type_to_condition,
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


        function apply_basic_filter (geocache_list) {
            var conditions = generate_conditions(serv.filter);
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
            return filtered_list;

        }


        function generate_conditions (filter_atoms) {
            var conditions = [];
            for (var i = 0, len = filter_atoms.length; i < len; i++) {
                var filter_atom = filter_atoms[i];
                func = atom_to_condition_map[filter_atoms[i].name];
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
            return {property: filter_atom.name, func: op_func, value: parseFloat(filter_atom.val)};
        }

        function type_to_condition (filter_atom) {
            var types = filter_atom.val.split(',');
            var hash = {};
            for (var i = 0, len = types.length; i < len; i++) {
                hash[types[i]] = true;
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
