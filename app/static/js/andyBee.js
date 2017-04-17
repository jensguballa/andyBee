(function () {
angular
    .module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource', 'RESTful'])
    .controller('andyBeeCtrl', andyBeeCtrl)
    .controller('PrefCtrl', PrefCtrl);

//    function andyBeeCtrl ($scope, Preferences) {
//    }
//    andyBeeCtrl.$inject = ['$scope', 'Preferences'];

/////
//.directive('convertToNumber', function() {
//    return {
//        require: 'ngModel',
//        link: function(scope, element, attrs, ngModel) {
//            ngModel.$parsers.push(function(val) {
//                return val != null ? parseInt(val, 10) : null;
//            });
//            ngModel.$formatters.push(function(val) {
//                return val != null ? '' + val : null;
//            });
//        }
//    };
//});
            
    andyBeeCtrl.$inject = ['$uibModal', '$http', '$log', 'Preferences'];
    function andyBeeCtrl ($uibModal, $http, $log, Preferences) {

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

            Preferences.get_request(open_modal);

            ////////// 

            function open_modal (resp) {
                $uibModal.open({
                    animation: false,
                    controller: PrefCtrl,
                    controllerAs: "pref",
                    templateUrl: '/static/html/pref.html',
                }).result.then(function(){}, function(){});
            }

        };

        ////////////////



    }


    PrefCtrl.$inject = ['$uibModalInstance', 'Preferences'];
    function PrefCtrl($uibModalInstance, Preferences) {
        var pref = this;
        pref.data = Preferences.get_data();
        pref.dismiss = function () {
            $uibModalInstance.dismiss(); 
        };
        pref.close = function() {
            Preferences.update_data(pref.data);
            $uibModalInstance.close();
        };
    }


})();

