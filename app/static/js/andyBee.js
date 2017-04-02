var app = angular.module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);


app.factory("appData", ['$uibModal', '$http', '$rootScope', function($uibModal, $http, $rootScope) {
    var app = this;
    var db = {};


    return db;
}]);


app.controller('andyBeeCtrl', ['$uibModal', '$http', '$log' , function ($uibModal, $http, $log) {
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
                    $app.db_file = selected_file;
                },
                function () {;}
        );

    };

}]);

