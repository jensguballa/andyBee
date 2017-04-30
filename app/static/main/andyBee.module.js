(function () {
    angular
        .module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource', 'ngTable', 'leaflet-directive'])
        .config(function($logProvider) {
            $logProvider.debugEnabled(false);
        });
})();

