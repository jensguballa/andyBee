(function () {
    'use strict';

    angular
        .module('andyBeeApp')
    //    .filter('to_trusted', to_trusted); 
        .filter('to_trusted', to_trusted)
        .filter('km', km);

    function km() {
        return km_func;

        function km_func(meters) {
            return (meters/1000).toFixed(2);
            // return Math.round(meters/10)/100;
        }
    }
                
    to_trusted.$inject = ['$sce'];
    function to_trusted($sce){
        return function(text) {
            return $sce.trustAsHtml(text);
        };
    };

//    to_trusted.$inject = ['$sce'];
//    function to_trusted ($sce){
//        return function(text) {
//            return $sce.trustAsHtml(text);
//        };
//    }

})();

