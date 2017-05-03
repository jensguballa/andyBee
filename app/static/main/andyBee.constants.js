(function () {
    angular
        .module('andyBeeApp')
        .constant('ERROR', {
            
            // related to a DB
            FAILURE_DB_CREATE:                 'Cannot create a new database on the server.',
            FAILURE_DB_LIST_FROM_SERVER:       'Cannot retrieve the list of databases from the server.',  
            WARNING_DB_LIST_FROM_SERVER:       'Cannot retrieve the list of databases from the server, '  
                + 'continuing without opening the database autonomously.',
            WARNING_DB_NOT_FOUND:              'The database to open is not present on the server, '
                + 'continuing without opening the database autonomously.',

            // related to GPX import
            FAILURE_GPX_IMPORT:                'Failure occured when trying to import a GPX file.',    
                                                                                                       
            // related to preferences                                                                  
            FAILURE_PREFERENCES_FROM_SERVER:   'Cannot retrieve preferences from the server.',         
            FAILURE_PREFERENCES_UPDATE:        'Cannot update the preferences on the server.',         
            FAILURE_PREFERENCES_USED_DB:       'Cannot update the last used database on the server.',  

            // related to the list of geocaches
            FAILURE_GEOCACHE_LIST_FROM_SERVER: 'Cannot retrieve the list of geocaches from the server.',

            // related to a single geocache
            FAILURE_GEOCACHE_FROM_SERVER:      'Cannot retrieve the details for the selected geocache from the server.',
        });
})();



