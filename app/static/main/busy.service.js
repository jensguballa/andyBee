(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('BusyService', BusyService);

    BusyService.$inject = ['$uibModal'];
    function BusyService($uibModal) {
        var modal;
        var serv = {
            open_busy_modal: open_busy_modal,
            close_busy_modal: close_busy_modal
        }

        return serv;

        function open_busy_modal(headline, bar_text) {
            modal = $uibModal.open({
                animation: false,
                controller: 'BusyCtrl',
                controllerAs: 'busy',
                templateUrl: '/static/main/busy.html',
                resolve: {
                    data: busy_dialog_texts
                }
            });
            modal.result.then(function(){}, function(){});

            function busy_dialog_texts() {
                return {headline: headline, bar_text};
            }
        }

        function close_busy_modal() {
            modal.dismiss();
        }
    }

})();
