(function () {
    angular
        .module('andyBeeApp')
        .controller('OpenDbCtrl', OpenDbCtrl);

    OpenDbCtrl.$inject = ['$uibModalInstance', 'GeocacheService'];
    function OpenDbCtrl($uibModalInstance, GeocacheService) {
        var pref = this;
        pref.files = GeocacheService.db_list;
        pref.selected = GeocacheService.db_name;

        pref.dismiss = function () {
            $uibModalInstance.dismiss(); 
        };
        pref.close = function() {
            $uibModalInstance.close(pref.selected);
        };
    }
})();
