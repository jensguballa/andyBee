(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheListCtrl', GeocacheListCtrl);


    GeocacheListCtrl.$inject = ['$scope', '$filter', 'GeocacheService', 'NgTableParams'];
    function GeocacheListCtrl($scope, $filter, GeocacheService, NgTableParams) {
        var vm = this;
        vm.cols = [];
        vm.tableParams = new NgTableParams({}, {
            filterOptions: {filterFn: geocache_filter}
        });
        vm.show_details = show_details;
        vm.show_map = show_map;

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
            {field: "gc_id",      title: "Cache",     sortable: "gc_id"     , filter: {gc_id: "text"}},
            {field: "distance",   title: "Distance (km)",  sortable: "distance"  },
            {field: "difficulty", title: "D",         sortable: "difficulty", filter: {difficulty: "select"}, filterData: rating},
            {field: "terrain",    title: "T",         sortable: "terrain"   , filter: {terrain: "select"},    filterData: rating},
            {field: "title",      title: "Title",     sortable: "title"     , filter: {title: "text"}},
            {field: "placed_by",  title: "Placed by", sortable: "placed_by" , filter: {placed_by: "text"}}
        ];

        $scope.$on('geocaches_updated', function (event, args) {
            vm.tableParams.settings({dataset: GeocacheService.geocache_list});
        });

        function show_details(id) {
            GeocacheService.read(id); // cache detail tab
        }

        function show_map(id) {
            GeocacheService.selected_tab = 1; // cache detail tab
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
