(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('BusyCtrl', BusyCtrl);
    
    BusyCtrl.$inject = ['data'];
    function BusyCtrl (data) {
        var vm = this;
        vm.headline = data.headline;
        vm.bar_text = data.bar_text;
    }

})();

