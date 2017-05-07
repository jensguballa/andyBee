(function () {
    angular
        .module('andyBeeApp')
        .controller('ManageFilterCtrl', ManageFilterCtrl);

    ManageFilterCtrl.$inject = ['$uibModalInstance', 'FilterService'];
    function ManageFilterCtrl($uibModalInstance, FilterService) {
        var vm = this;
        vm.serv = FilterService;
        vm.dismiss = dismiss_modal;
        vm.create = create_filter;

        vm.filter_name = "";


        /// functions

        function dismiss_modal () {
            $uibModalInstance.dismiss(); 
        };

        function create_filter() {
            FilterService.create_filter(vm.filter_name);
        }

    }
})();

