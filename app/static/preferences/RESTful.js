(function () {
    /// Section for factories
    angular
        .module('RESTful', ['ngResource'])
        .factory('Preferences', Preferences);

    Preferences.$inject = ['$resource'];
    function Preferences ($resource) {
        var rest = $resource('/andyBee/api/v1.0/config/:id', null, {update: {method: 'PUT'}});
        var pref = this;
        pref = {
            get_request: get_request,
            get_data: get_data,
            update_data: update_data,
            dialog: dialog
        };
        return pref;

        function dialog() {
        }

        function get_request (success_cb) {
            rest.get({id: 1}, get_response, log_RESTful_error);

            function get_response (result) {
                pref.preference = result.preference;
                success_cb();
            }
        }

        function get_data() {
            return pref.preference;
        }

        function update_data (data) {
            pref.preference = data;
            rest.update({id: 1}, {preference: pref.preference}, dummy_func, log_RESTful_error);
        }

    }

    function log_RESTful_error(resp) {
        var msg = "Error. " + resp.config.method + " " + resp.config.url + " " + resp.status + " at: " + new Date();
        $log.error(msg);
        $app.alerts.push({msg: msg, type: "danger"});
    }

    function dummy_func () {
        var jens = 0;
    }

})();
