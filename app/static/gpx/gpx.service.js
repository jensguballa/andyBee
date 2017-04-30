(function () {
    angular
        .module('andyBeeApp')
        .factory('GpxService', GpxService);

    GpxService.$inject = ['$resource', 'GeocacheService', 'LoggingService'];
    function GpxService ($resource, GeocacheService, LoggingService) {
        var rest = $resource('/andyBee/api/v1.0/db/:db_name/gpx_import', null, {
            import_gpx: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: {'Content-Type': undefined}
            }
        });
        var serv = {
            import_gpx: import_gpx
        };
        return serv;

        function import_gpx (data) {
            rest.import_gpx({db_name: GeocacheService.db_name}, data, function(){}, LoggingService.log_RESTful_error);
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
