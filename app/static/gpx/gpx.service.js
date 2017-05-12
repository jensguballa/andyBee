(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .factory('GpxService', GpxService);

    GpxService.$inject = ['$resource', '$filter', 'GeocacheService', 'LoggingService', 'ERROR'];
    function GpxService ($resource, $filter, GeocacheService, LoggingService, ERROR) {
        var rest_import = $resource('/andyBee/api/v1.0/db/:db_name/gpx_import', null, {
            import_gpx: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: {'Content-Type': undefined}
            }
        });
        var rest_export = $resource('/andyBee/api/v1.0/db/:db_name/gpx_export', null, {
            export_gpx: {
                method: 'POST',
                responseType: 'arraybuffer',
                transformResponse: function(data, headersGetter) {
                    // Stores the ArrayBuffer object in a property called "data"
                    return { data : data };
                }
            }
        });

        var serv = {
            import_gpx: import_gpx,
            export_gpx: export_gpx
        };
        return serv;

        function import_gpx (data, on_success, on_error) {
            on_error = on_error || on_import_error;
            rest_import.import_gpx({db_name: GeocacheService.db_name}, data, 
                    on_import_result, on_error);

            function on_import_result(result) {
                if (on_success) {
                    on_success();
                }
            }

            function on_import_error(result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GPX_IMPORT, 
                    http_response: result,
                    modal: true,
                });
            }
        }

        function export_gpx(data, on_success, on_error) {
            on_error = on_error || on_export_error;
            // let's start with no more than 1000 geocaches
            // sort order: always by distance
            var sorted = $filter('orderBy')(GeocacheService.geocache_list, "distance");
            var export_list = [];
            for (var i = 0, len = Math.min(GeocacheService.geocache_list.length, 1000); i < len; i++) {
                export_list.push(GeocacheService.geocache_list[i].id);
            }
            data.list = export_list;
            rest_export.export_gpx({db_name: GeocacheService.db_name}, data,
                    on_export_result, on_error);

            function on_export_result(result) {
                var blob = new Blob([result.data], {type: "application/gpx"});
                saveAs(blob, data.file_name);
                if (on_success) {
                    on_success();
                }
            }

            function on_export_error(result) {
                LoggingService.log({
                    msg: ERROR.FAILURE_GPX_EXPORT, 
                    http_response: result,
                    modal: true,
                });
            }

        }
    }

    function formDataObject (data) {
        var fd = new FormData();
        angular.forEach(data, function(value, key) {
            fd.append(key, value);
        });
        return fd;
    }

})();
