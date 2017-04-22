(function () {
    angular
        .module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource', 'leaflet-directive'])
        .config(function($logProvider) {
            $logProvider.debugEnabled(false);
        });
})();

