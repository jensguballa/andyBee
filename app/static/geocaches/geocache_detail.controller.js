(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheDetailCtrl', GeocacheDetailCtrl);


    GeocacheDetailCtrl.$inject = ['$scope', 'GeocacheService',];
    function GeocacheDetailCtrl($scope, GeocacheService) {
        var vm = this;
        vm.serv = GeocacheService;
        vm.note = "";
        vm.note_changed = false;

        vm.update_coords = update_coords;
        vm.save_note = save_note;

        $scope.$on('geocache_details_updated', function (event, args) {
            vm.note = GeocacheService.detail.user_note;
            vm.note_changed = false;
        });

        function update_coords(geocache_id) {
            GeocacheService.update_coord_dialog(geocache_id);
        }

        function save_note () {
            GeocacheService.save_note(GeocacheService.detail.id, vm.note, save_success);

            function save_success () {
                vm.note_changed = false;
            }
        }
    }

})();
