(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheMapCtrl', GeocacheMapCtrl);

    GeocacheMapCtrl.$inject = ['$scope', '$timeout', 'GeocacheService'];
    function GeocacheMapCtrl($scope, $timeout, GeocacheService) {
        var vm = this;
        vm.markers = [];

        $scope.$on('geocaches_updated', function (event, args) {
            vm.markers = [];
            for (var i = 0, len = GeocacheService.geocache_list.length; i < len; i++) {
                var geocache = GeocacheService.geocache_list[i];
                vm.markers.push({
                    lat: geocache.lat,
                    lng: geocache.lon,
                    message: geocache.title
                });
            }
        });

    }

})();
