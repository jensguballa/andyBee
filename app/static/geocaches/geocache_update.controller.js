(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheUpdateCtrl', GeocacheUpdateCtrl);

    GeocacheUpdateCtrl.$inject = ['$uibModalInstance', 'Functions', 'geocache'];
    function GeocacheUpdateCtrl($uibModalInstance, Functions, geocache) {
        var vm = this;
        vm.geocache = geocache;
        vm.lat = Functions.coord_to_obj(geocache.lat, 'N', 'S');
        vm.lon = Functions.coord_to_obj(geocache.lon, 'E', 'W');
        vm.reset_to_original = reset_to_original;
        vm.dismiss = dismiss_modal;
        vm.close = close_modal;

        function reset_to_original() {
            vm.lat = Functions.coord_to_obj(geocache.orig_lat, 'N', 'S');
            vm.lon = Functions.coord_to_obj(geocache.orig_lon, 'E', 'W');
        }

        function dismiss_modal() {
            $uibModalInstance.dismiss(); 
        };

        function close_modal() {
            var lat = Functions.obj_to_coord(vm.lat);
            var lon = Functions.obj_to_coord(vm.lon);
            $uibModalInstance.close(L.latLng(lat, lon));
        };
    }
})();

