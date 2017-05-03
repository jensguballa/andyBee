(function () {
angular
    .module('andyBeeApp')
    .controller('andyBeeCtrl', andyBeeCtrl);
            
    andyBeeCtrl.$inject = ['$uibModal', '$timeout', 'ERROR', 'GeocacheService', 'GpxService', 'PreferenceService', 'DbService', 'LoggingService', 'leafletData'];
    function andyBeeCtrl ($uibModal, $timeout, ERROR, GeocacheService, GpxService, PreferenceService, DbService, LoggingService, leafletData) {

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
            DbService.read(on_read_response, on_read_error);

            function on_read_response () {
                $uibModal.open({
                    animation: false,
                    controller: 'PreferenceCtrl',
                    controllerAs: "pref",
                    templateUrl: '/static/preferences/pref.html',
                    resolve: {
                        data: PreferenceService.resolve_data_copy,
                        dbs:  DbService.resolve_db_list
                    }
                }).result.then(on_dialog_ok, function(){});
            }

            function on_dialog_ok (data) {
                PreferenceService.update(data);
            }

            function on_read_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_DB_LIST_FROM_SERVER, 
                    http_response: result,
                    modal: true,
                });
            }
        }

        function open_db_dialog () {
            DbService.read(on_read_response, on_read_error);

            function on_read_response (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'GeocacheOpenDbCtrl',
                    controllerAs: 'opendb',
                    templateUrl: '/static/geocaches/opendb.html',
                    resolve: {
                        dbs: DbService.resolve_db_list,
                        selected: GeocacheService.resolve_db_name
                    }
                }).result.then(on_dialog_ok, function(){});

                function on_dialog_ok (db_name) {
                    GeocacheService.get_geocache_list(db_name);
                }
            }

            function on_read_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_DB_LIST_FROM_SERVER, 
                    http_response: result,
                    modal: true,
                });
            }
        }

        function import_gpx_dialog () {
            $uibModal.open({
                animation: false,
                controller: 'GpxImportCtrl',
                controllerAs: "import",
                templateUrl: '/static/gpx/import.html',
            }).result.then(on_import_gpx_ok, on_gpx_import_error);

            function on_import_gpx_ok (data) {
                GpxService.import_gpx(data);
            }

            function on_gpx_import_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GPX_IMPORT, 
                    http_response: result,
                    modal: true,
                });
            }
        }

        ////////////////

    }

})();

