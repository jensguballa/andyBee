(function () {
    angular
        .module('andyBeeApp')
        .controller('GeocacheListCtrl', GeocacheListCtrl);


    GeocacheListCtrl.$inject = ['$scope', 'GeocacheService', 'NgTableParams'];
    function GeocacheListCtrl($scope, GeocacheService, NgTableParams) {
        var vm = this;
        vm.cols = [];
        vm.tableParams = new NgTableParams();
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
            {field: "gc_id",      title: "Cache",     filter: {gc_id: "text"}},
            {field: "difficulty", title: "D",         filter: {difficulty: "select"}, filterData: rating},
            {field: "terrain",    title: "T",         filter: {terrain: "select"},    filterData: rating},
            {field: "title",      title: "Title",     filter: {title: "text"}},
            {field: "placed_by",  title: "Placed by", filter: {placed_by: "text"}}
        ];

        $scope.$on('geocaches_updated', function (event, args) {
            vm.tableParams.settings({dataset: GeocacheService.geocache_list});
        });

        function show_details (id) {
            GeocacheService.show_details(id); // cache detail tab
        }

        function show_map (id) {
            GeocacheService.selected_tab = 1; // cache detail tab
        }
    }


})();
