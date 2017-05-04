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
        }];

        return serv;

        function apply_basic_filter (geocache_list) {
            // return geocache_list.filter(single_geocache_filter);
            return geocache_list;
        }

        function single_geocache_filter (geocache) {
            return a_sample_filter.every(check_filter_atom);

            function check_filter_atom(filter_atom) {
                return filter_atom.func(geocache, filter_atom.property, filter_atom.value);
            }
        }

        function check_equal (geocache, property, value) {
            return geocache[property] == value;
        }

    }

})();
