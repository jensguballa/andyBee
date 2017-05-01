(function () {
angular
    .module('andyBeeApp')
//    .filter('to_trusted', to_trusted); 
    .filter('to_trusted', ['$sce', function($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    }]);
//    to_trusted.$inject = ['$sce'];
//    function to_trusted ($sce){
//        return function(text) {
//            return $sce.trustAsHtml(text);
//        };
//    }

})();

