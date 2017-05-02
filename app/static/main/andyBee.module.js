(function () {
    angular
        .module('andyBeeApp', ['ngAnimate', 'ngSanitize', 'ui.bootstrap', 'ngResource', 'ngTable', 'leaflet-directive'])
        .config(function($logProvider) {
            $logProvider.debugEnabled(false);
        })
        .run(get_preferences);

        get_preferences.$inject = ['PreferenceService']
        function get_preferences (PreferenceService) {
            PreferenceService.read(function(){});
        }

})();

