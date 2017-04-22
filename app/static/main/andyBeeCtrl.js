(function () {
angular
    .module('andyBeeApp')
    .controller('andyBeeCtrl', andyBeeCtrl);
            
    andyBeeCtrl.$inject = ['$uibModal', '$http', '$log', '$timeout', 'Preferences', 'GeocacheService', 'leafletData'];
    function andyBeeCtrl ($uibModal, $http, $log, $timeout, Preferences, GeocacheService, leafletData) {


        var $app = this;
        $app.geocache = GeocacheService;
        $app.db_file = '';
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
            
        function open_db_dialog () {
            GeocacheService.get_dblist(open_modal);
            function open_modal (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'OpenDbCtrl',
                    controllerAs: 'opendb',
                    templateUrl: '/static/geocaches/opendb.html',
//                    resolve: {
//                        preference: Preferences.get_data()
//                    }
                }).result.then(aaa, function(){});

                function aaa (db_name) {
                    GeocacheService.get_geocache_list(db_name);
                }

            }
        }

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

        ////////////////

    }

})();

