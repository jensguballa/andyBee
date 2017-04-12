var app = angular.module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource']);


app.factory("prefService", ['$http', function($http) {
    var obj = {};

    obj.get_pref = function () {
        return $http.get('/andyBee/api/v1.0/config').then(function (response) {
            return response.data;
        });
    };
    return obj;
}]);


app.controller('andyBeeCtrl', ['$uibModal', '$http', '$log', 'Preferences', function ($uibModal, $http, $log, Preferences) {
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

        Preferences.get({id: 1}, open_modal, log_RESTful_error);

        ////////// 

        function open_modal (resp) {
            var modalInstance = $uibModal.open({
                animation: false,
                controller: PrefCtrl,
                controllerAs: "pref",
                templateUrl: '/static/html/pref.html',
                resolve: {
                    preference: resp.preference
                }
            });
            modalInstance.result.then(update_preferences, dummy_func);
        }

        function update_preferences (preference) {
            Preferences.update({id: 1}, {preference: preference}, dummy_func, log_RESTful_error);
        }

    };

    ////////////////


    function log_RESTful_error(resp) {
        var msg = "Error. " + resp.config.method + " " + resp.config.url + " " + resp.status + " at: " + new Date();
        $log.error(msg);
        $app.alerts.push({msg: msg, type: "danger"});
    }

    function dummy_func () {
    }

}]);

PrefCtrl.$inject = ['$uibModalInstance', 'preference'];
function PrefCtrl($uibModalInstance, preference) {
    var pref = this;
    pref.data = preference;
    pref.dismiss = function () {
        $uibModalInstance.dismiss(); 
    };
    pref.close = function() {
        $uibModalInstance.close(pref.data);
    };
}


/// Section for factories
//angular
//    .module('andyBeeApp', ['ngResource'])
app.factory('Preferences', Preferences);

Preferences.$inject = ['$resource'];
function Preferences ($resource) {
    return $resource('/andyBee/api/v1.0/config/:id', null, {update: {method: 'PUT'}});
}

/////
app.directive('convertToNumber', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$parsers.push(function(val) {
                return val != null ? parseInt(val, 10) : null;
            });
            ngModel.$formatters.push(function(val) {
                return val != null ? '' + val : null;
            });
        }
    };
});

