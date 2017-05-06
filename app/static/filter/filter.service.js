(function () {
    angular
        .module('andyBeeApp')
        .factory('FilterService', FilterService);

    FilterService.$inject = ['$resource'];
    function FilterService ($resource) {
        var rest = $resource('/andyBee/api/v1.0/config/:id', null, {update: {method: 'PUT'}});
        var serv = {
            apply_basic_filter: apply_basic_filter
        };

        var a_sample_filter = [{
            func: check_equal,
            property: "terrain",
            value: 2
        },
        {
            func: check_equal,
            property: "difficulty",
            value: 2
        },
        {
            func: check_in_array,
            property: "type",
            array: ["Traditional Cache"],
        }];

        return serv;

        function apply_basic_filter (geocache_list) {
            var filter = a_sample_filter;

            // to speed up the lookup into an array, the array
            // values are transformed into a hash.
            angular.forEach(filter, function(filter_atom) {
                if (filter_atom.array != undefined) {
                    filter_atom.hash = {};
                    angular.forEach(filter_atom.array, function (arr_val) {
                        this.hash[arr_val] = true;
                    }, filter_atom);
                }
            });


            // return geocache_list.filter(single_geocache_filter);
            return geocache_list;

            function array_to_hash (array_value) {
                this.hash[array_value] = true;
            }
        }

        function single_geocache_filter (geocache) {
            return a_sample_filter.every(check_filter_atom);

            function check_filter_atom(filter_atom) {
                return filter_atom.func(geocache, filter_atom);
            }
        }

        function check_equal (geocache, filter_atom) {
            return geocache[filter_atom.property] == filter_atom.value;
        }

        function check_gt_or_equal (geocache, filter_atom) {
            return geocache[filter_atom.property] >= filter_atom.value;
        }

        function check_lt_or_equal (geocache, filter_atom) {
            return geocache[filter_atom.property] <= filter_atom.value;
        }

        function check_in_array (geocache, filter_atom) {
            return filter_atom.hash[geocache[filter_atom.property]];
        }

    }

})();
