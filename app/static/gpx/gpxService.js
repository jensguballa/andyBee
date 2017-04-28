(function () {
    angular
        .module('andyBeeApp')
        .factory('GpxService', GpxService);

    GpxService.$inject = ['$resource', 'GeocacheService'];
    function GpxService ($resource, GeocacheService) {
        var rest = $resource('/andyBee/api/v1.0/db/:db_name/gpx_import', null, {
            import_gpx: {
                method: 'POST',
                transformRequest: formDataObject,
                headers: {'Content-Type': undefined}
            }
        });
        var gpx = {
            import_gpx: import_gpx
        };
        return gpx;

        function import_gpx (data) {
            rest.import_gpx({db_name: GeocacheService.db_name}, data, function(){}, function(){});
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
