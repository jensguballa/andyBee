(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('GeocacheDetailCtrl', GeocacheDetailCtrl);


    GeocacheDetailCtrl.$inject = ['$scope', 'GeocacheService',];
    function GeocacheDetailCtrl($scope, GeocacheService) {
        var vm = this;
        vm.serv = GeocacheService;

    }

})();
