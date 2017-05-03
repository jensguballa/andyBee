(function () {
    angular
        .module('andyBeeApp')
        .constant('ERROR', {
            FAILURE_DB_LIST_FROM_SERVER:     'Cannot retrieve the list of databases from the server.',
            FAILURE_GPX_IMPORT:              'Failure occured when trying to import a GPX file.',
            FAILURE_PREFERENCES_FROM_SERVER: 'Cannot retrieve preferences from the server.',
            WARNING_DB_LIST_FROM_SERVER:     'Cannot retrieve the list of databases from the server, '
                + 'continuing without opening the database autonomously.',
            WARNING_DB_NOT_FOUND:            'The database to open is not present on the server, '
                + 'continuing without opening the database autonomously.',
        });
})();



