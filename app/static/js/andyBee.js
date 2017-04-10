var app = angular.module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);


app.factory("prefService", ['$http', function($http) {
    var obj = {};

    obj.get_pref = function () {
        return $http.get('/andyBee/api/v1.0/config').then(function (response) {
            return response.data;
        });
    };
    return obj;
}]);


app.controller('andyBeeCtrl', ['$uibModal', '$http', '$log', 'prefService', function ($uibModal, $http, $log, prefService) {
    var $app = this;
    $app.db_file = '';
    $app.alerts = [];
    $app.close_alert = function (index) {
        $app.alerts.splice(index, 1);
    };

    $app.open_db_dialog = function() {

        var modalInstance = $uibModal.open({
            animation: false,
            controller: function () {
                var $opendb = this;
                $opendb.selected = "";
                $http.get('/getdblist').then(
                        function (resp) {
                            $opendb.files = resp.data;
                        },
                        function (resp) {
                            var msg = "Error. Server status: " + resp.status + " URL: " + resp.config.url + " at: " + new Date();
                            $log.error(msg);
                            $app.alerts.push({msg: msg, type: "danger"});
                        }
                );
            },
            controllerAs: "opendb",
            templateUrl: '/static/html/opendb.html'
        });
        modalInstance.result.then(
                function (selected_file) {
                    $app.open_db(selected_file);
//                    $app.db_file = selected_file;
//                    $http.get('/opendb', {params: {db: selected_file}});
                },
                function () {;}
        );

    };

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

    $app.pref_dialog = function() {

        var modalInstance = $uibModal.open({
            animation: false,
            controller: function () {
                var $pref = this;
                $http.get('/andyBee/api/v1.0/config').then(
                        function (resp) {
                            $pref.data = resp.data;
                        },
                        function (resp) {
                            var msg = "Error. Server status: " + resp.status + " URL: " + resp.config.url + " at: " + new Date();
                            $log.error(msg);
                            $app.alerts.push({msg: msg, type: "danger"});
                        }
                );
            },
            controllerAs: "pref",
            templateUrl: '/static/html/pref.html',
            resolve: {
                pref: function (prefService) {
                    return prefService.get_pref();
                }
            }
        });
        modalInstance.result.then(
                function () {
                    ;
                },
                function () {;}
        );

    };
}]);

app.controller('PrefCtrl', ['$uibModal', 'prefService', function ($uibModal, prefService) {
    var pref = this;

}]);


