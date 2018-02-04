(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheListCtrl', GeocacheListCtrl);


    GeocacheListCtrl.$inject = ['$scope', '$rootScope', '$filter', 'GeocacheService', 'NgTableParams'];
    function GeocacheListCtrl($scope, $rootScope, $filter, GeocacheService, NgTableParams) {
        var vm = this;
        vm.cols = [];
        vm.tableParams = new NgTableParams({}, {
            filterOptions: {filterFn: geocache_filter}
        });
        vm.show_details = show_details;
        vm.show_map = show_map;
        vm.update_coordinates = update_coordinates;
        vm.set_center = set_center;
        vm.reset_filter = reset_filter;

        var rating = [
            {id: 1.0, title: '1', },
            {id: 1.5, title: '1.5'},
            {id: 2.0, title: '2'},
            {id: 2.5, title: '2.5'},
            {id: 3.0, title: '3'},
            {id: 3.5, title: '3.5'},
            {id: 4.0, title: '4'},
            {id: 4.5, title: '4.5'},
            {id: 5.0, title: '5'}
        ];
        vm.cols = [
            {field: "gc_code",    title: "Cache",     sortable: "gc_code"   , filter: {gc_code: "text"}},
            {field: "distance",   title: "Distance (km)",  sortable: "distance"  },
            {field: "last_logs",  title: "Last Logs"},
            {field: "difficulty", title: "D",         sortable: "difficulty", filter: {difficulty: "select"}, filterData: rating},
            {field: "terrain",    title: "T",         sortable: "terrain"   , filter: {terrain: "select"},    filterData: rating},
            {field: "title",      title: "Title",     sortable: "title"     , filter: {title: "text"}},
            {field: "owner",      title: "Owner",     sortable: "owner"     , filter: {owner: "text"}}
        ];

        $scope.$on('geocache_list_updated', function (event, args) {
            vm.tableParams.settings({dataset: GeocacheService.geocache_list});
        });

        $scope.$on('center_updated', function (event, args) {
            var order_array = vm.tableParams.orderBy();
            if (order_array.length) {
                if (order_array[0].slice(1) == "distance") {
                    vm.tableParams.reload();
                    vm.tableParams.page(1);
                }
            }
        });

        $scope.$on('coordinates_updated', function (event, args) {
            vm.tableParams.reload();
        });


        function reset_filter() {
            vm.tableParams.reload();
            vm.tableParams.page(1);
            vm.tableParams.filter({});
            vm.tableParams.sorting({});
        }

        function show_details(id) {
            GeocacheService.read(id); // cache detail tab
        }

        function show_map(gc_code) {
            GeocacheService.selected_tab = 1; // map tab
            GeocacheService.refreshMap();
            $rootScope.$broadcast('map_pane_updated', {
                marker_gc_code: gc_code
            });
        }

        function update_coordinates(geocache_id) {
            GeocacheService.update_coord_dialog(geocache_id);
        }

        function set_center(lat, lon) {
            GeocacheService.trigger_center_update(lat, lon);
        }

        function geocache_filter(data, filter_values) {
            var exact_filter = {};
            if (filter_values.difficulty) {
                exact_filter.difficulty = filter_values.difficulty;
                delete filter_values.difficulty;
            }
            if (filter_values.terrain) {
                exact_filter.terrain = filter_values.terrain;
                delete filter_values.terrain;
            }
            if (exact_filter != undefined) {
                data = $filter('filter')(data, exact_filter, true);
            }
            return $filter('filter')(data, filter_values);
        }
    }


})();
