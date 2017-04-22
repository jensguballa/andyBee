(function () {
    angular
//        .module('Preferences')
        .module('andyBeeApp')
        .controller('PrefCtrl', PrefCtrl);

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
})();

