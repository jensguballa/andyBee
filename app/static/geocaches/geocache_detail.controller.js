(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheDetailCtrl', GeocacheDetailCtrl);


    GeocacheDetailCtrl.$inject = ['$scope', 'GeocacheService',];
    function GeocacheDetailCtrl($scope, GeocacheService) {
        var vm = this;
        vm.serv = GeocacheService;
        vm.update_coords = update_coords;

        function update_coords(geocache_id) {
            GeocacheService.update_coord_dialog(geocache_id);
        }
    }

})();
