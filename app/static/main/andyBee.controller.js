(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .controller('andyBeeCtrl', andyBeeCtrl);
            
    andyBeeCtrl.$inject = ['$uibModal', '$timeout', 'ERROR', 'GeocacheService', 'GpxService', 'PreferenceService', 'DbService', 'LoggingService', 'FilterService'];
    function andyBeeCtrl ($uibModal, $timeout, ERROR, GeocacheService, GpxService, PreferenceService, DbService, LoggingService, FilterService) {

        var vm = this;
        vm.geocache = GeocacheService;
        vm.pref = PreferenceService;
        vm.isNavCollapsed = true;
        vm.refreshMap = GeocacheService.refreshMap;
        vm.filter = FilterService;

        vm.open_db_dialog = open_db_dialog;
        vm.import_gpx_dialog = import_gpx_dialog;
        vm.export_gpx_dialog = export_gpx_dialog;
        vm.pref_dialog = pref_dialog;
        vm.basic_filter_dialog = basic_filter_dialog;
        vm.manage_filter_dialog = manage_filter_dialog;
        vm.apply_filter = apply_filter;
        vm.reset_filter = reset_filter;

        ////////////////

        function pref_dialog () {
            DbService.read(on_read_response);

            function on_read_response () {
                $uibModal.open({
                    animation: false,
                    controller: 'PreferenceCtrl',
                    controllerAs: "pref",
                    templateUrl: '/static/preferences/pref.html',
                    resolve: {
                        data: PreferenceService.resolve_data_copy,
                        dbs:  DbService.resolve_db_list
                    }
                }).result.then(on_dialog_ok, function(){});
            }

            function on_dialog_ok (data) {
                PreferenceService.update(data);
            }

        }

        function open_db_dialog () {
            DbService.read(on_read_response);

            function on_read_response (resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'GeocacheOpenDbCtrl',
                    controllerAs: 'opendb',
                    templateUrl: '/static/geocaches/opendb.html',
                    resolve: {
                        dbs: DbService.resolve_db_list,
                        selected: GeocacheService.resolve_db_name
                    }
                }).result.then(on_dialog_close, on_dialog_close);

                function on_dialog_close (db_name) {
                    if (db_name != "") {
                        GeocacheService.read_list(db_name);
                    }
                }
            }
        }

        function import_gpx_dialog () {
            if (!vm.geocache.db_name) {
                return;
            }
            $uibModal.open({
                animation: false,
                controller: 'GpxImportCtrl',
                controllerAs: "import",
                templateUrl: '/static/gpx/import.html',
            }).result.then(on_dialog_ok, function(){});

            function on_dialog_ok (data) {
                GpxService.import_gpx(data, read_list);

                function read_list() {
                    GeocacheService.read_list(vm.geocache.db_name);
                }

            }
        }

        function export_gpx_dialog () {
            if (!vm.geocache.db_name) {
                return;
            }
            $uibModal.open({
                animation: false,
                controller: 'GpxExportCtrl',
                controllerAs: "export",
                templateUrl: '/static/gpx/export.html',
            }).result.then(on_export_gpx_ok, on_gpx_export_error);

            function on_export_gpx_ok (data) {
                GpxService.export_gpx(data);
            }

            function on_gpx_export_error (result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GPX_EXPORT, 
                    http_response: result,
                    modal: true,
                });
            }
        }


        function basic_filter_dialog () {
            if (vm.geocache.db_name) {
                FilterService.read_list(on_read_response);
            }

            function on_read_response(resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'BasicFilterCtrl',
                    controllerAs: "basic",
                    templateUrl: '/static/filter/basic.html',
                    resolve: {
                        filter: FilterService.resolve_scratch_filter
                    }
                }).result.then(on_dialog_ok, function(){});
            }

            function on_dialog_ok (filter) {
                FilterService.scratch_filter_updated(filter);
                FilterService.filter_settings_updated(-1);
            }

        }

        function manage_filter_dialog () {
            FilterService.read_list(on_read_response);

            function on_read_response(resp) {
                $uibModal.open({
                    animation: false,
                    controller: 'ManageFilterCtrl',
                    controllerAs: "manage",
                    templateUrl: '/static/filter/manage.html',
                }).result.then(on_dialog_ok, function(){});
            }

            function on_dialog_ok () {
            }

        }

        function apply_filter (idx) {
            if (vm.geocache.db_name) {
                FilterService.filter_settings_updated(idx);
            }
        }

        function reset_filter() {
            if (FilterService.filter_applied) {
                FilterService.reset_filter();
                GeocacheService.on_filter_reset();
            }
        }

        ////////////////

    }

})();

