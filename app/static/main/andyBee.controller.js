(function () {
angular
    .module('andyBeeApp')
    .controller('andyBeeCtrl', andyBeeCtrl);
            
    andyBeeCtrl.$inject = ['$uibModal', '$timeout', 'GeocacheService', 'GpxService', 'leafletData'];
    function andyBeeCtrl ($uibModal, $timeout, GeocacheService, GpxService, leafletData) {

        var vm = this;
        vm.geocache = GeocacheService;
        vm.isNavCollapsed = true;
        vm.refreshMap = function () {
            leafletData.getMap().then(function(map) {
                $timeout(function() {
                  map.invalidateSize();
                }, 300);
            });
        }
        vm.open_db_dialog = open_db_dialog;
        vm.import_gpx_dialog = import_gpx_dialog;
        vm.pref_dialog = pref_dialog;

        ////////////////

        function pref_dialog () {
            $uibModal.open({
                animation: false,
                controller: 'PreferenceCtrl',
                controllerAs: "pref",
                templateUrl: '/static/preferences/pref.html',
            }).result.then(function(){}, function(){});
        }

        function open_db_dialog () {
            GeocacheService.get_dblist(open_modal);
            function open_modal (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'GeocacheOpenDbCtrl',
                    controllerAs: 'opendb',
                    templateUrl: '/static/geocaches/opendb.html',
                }).result.then(db_selected, function(){});

                function db_selected (db_name) {
                    GeocacheService.get_geocache_list(db_name);
                }
            }
        }

        function import_gpx_dialog () {
            $uibModal.open({
                animation: false,
                controller: 'GpxImportCtrl',
                controllerAs: "import",
                templateUrl: '/static/gpx/import.html',
            }).result.then(import_gpx_ok, function(){});

            function import_gpx_ok (data) {
                GpxService.import_gpx(data);
            }
        }

        ////////////////

    }

})();

