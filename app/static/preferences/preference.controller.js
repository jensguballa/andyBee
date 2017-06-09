(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('PreferenceCtrl', PreferenceCtrl);

    PreferenceCtrl.$inject = ['$uibModalInstance', 'GeocacheService', 'data', 'dbs'];
    function PreferenceCtrl($uibModalInstance, GeocacheService, data, dbs) {
        var vm = this;
        vm.data = data;
        vm.lat = GeocacheService.coord_to_obj(data.home_lat, 'N', 'S');
        vm.lon = GeocacheService.coord_to_obj(data.home_lon, 'E', 'W');
        vm.dbs = dbs;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function close_modal () {
            vm.data.home_lat = GeocacheService.obj_to_coord(vm.lat);
            vm.data.home_lon = GeocacheService.obj_to_coord(vm.lon);
            $uibModalInstance.close(vm.data);
        };
    }
})();

