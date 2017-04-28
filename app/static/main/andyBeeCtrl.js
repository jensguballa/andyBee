(function () {
angular
    .module('andyBeeApp')
    .controller('andyBeeCtrl', andyBeeCtrl);
            
    andyBeeCtrl.$inject = ['$uibModal', '$http', '$log', '$timeout', 'Preferences', 'GeocacheService', 'GpxService', 'leafletData'];
    function andyBeeCtrl ($uibModal, $http, $log, $timeout, Preferences, GeocacheService, GpxService, leafletData) {


        var $app = this;
        $app.isNavCollapsed = true;
        $app.geocache = GeocacheService;
        $app.alerts = [];
        $app.close_alert = function (index) {
            $app.alerts.splice(index, 1);
        };

        $app.refreshMap = function () {
            leafletData.getMap().then(function(map) {
                $timeout(function() {
                  map.invalidateSize();
                }, 300);
            });
        }

        $app.open_db_dialog = open_db_dialog;
            
        $app.open_db = function(db_name) {
            $http.post('/opendb', {db_name:db_name}).then(
                    function (resp) {
                        $app.caches = resp.data;
                    },
                    function (resp) {
                        var msg = "Error. Server status: " + resp.status + " URL: " + resp.config.url + " at: " + new Date();
                        $log.error(msg);
                        $app.alerts.push({msg: msg, type: "danger"});
                    }
            );
        };

        $app.import_gpx_dialog = import_gpx_dialog;

        $app.pref_dialog = pref_dialog;
        function pref_dialog () {
            Preferences.get_request(open_modal);
            function open_modal (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'PrefCtrl',
                    controllerAs: "pref",
                    templateUrl: '/static/preferences/pref.html',
                    resolve: {
                        preference: Preferences.get_data()
                    }
                }).result.then(Preferences.update_data, function(){});
            }
        }

        function open_db_dialog () {
            GeocacheService.get_dblist(open_modal);
            function open_modal (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'OpenDbCtrl',
                    controllerAs: 'opendb',
                    templateUrl: '/static/geocaches/opendb.html',
                }).result.then(aaa, function(){});

                function aaa (db_name) {
                    GeocacheService.get_geocache_list(db_name);
                }

            }
        }

        function import_gpx_dialog () {
            $uibModal.open({
                animation: false,
                controller: 'ImportGpxCtrl',
//                controllerAs: "gpx",
                templateUrl: '/static/gpx/import.html',
//                resolve: {
//                    preference: Preferences.get_data()
//                }
            }).result.then(import_gpx_ok, function(){});

            function import_gpx_ok (data) {
                GpxService.import_gpx(data);
            }
        }


        ////////////////

    }

})();

