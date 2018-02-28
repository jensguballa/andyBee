(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('ConfirmService', ConfirmService);

    ConfirmService.$inject = ['$uibModal'];
    function ConfirmService($uibModal) {
        var modal;
        var serv = {
            confirm_dialog: confirm_dialog,
        }

        return serv;

        function confirm_dialog(headline, info, question, cb_ok, cb_cancel) {
            cb_cancel = cb_cancel || on_cancel;
            modal = $uibModal.open({
                animation: false,
                controller: 'ConfirmCtrl',
                controllerAs: 'confirm',
                templateUrl: '/static/main/confirm.html',
                resolve: {
                    data: resolve_dialog_texts
                }
            });
            modal.result.then(cb_ok, cb_cancel);

            function resolve_dialog_texts() {
                return {headline: headline, info: info, question: question};
            }

            function on_cancel () {
            }

        }

    }

})();
