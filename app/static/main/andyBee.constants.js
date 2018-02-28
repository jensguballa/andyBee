(function () {
    'use strict';

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
            FAILURE_GPX_EXPORT:                'Failure occured when trying to export to a GPX file.', 
                                                                                                       
            // related to preferences                                                                  
            FAILURE_PREFERENCES_FROM_SERVER:   'Cannot retrieve preferences from the server.',         
            FAILURE_PREFERENCES_UPDATE:        'Cannot update the preferences on the server.',         
            FAILURE_PREFERENCES_USED_DB:       'Cannot update the last used database on the server.',  
           
            // related to the list of geocaches
            FAILURE_GEOCACHE_LIST_FROM_SERVER: 'Cannot retrieve the list of geocaches from the server.',
            FAILURE_DELETE_GEOCACHE_LIST:      'Failing to delete geocaches on the server.',
           
            // related to a single geocache
            FAILURE_GEOCACHE_FROM_SERVER:      'Cannot retrieve the details for the selected geocache from the server.',
            FAILURE_GEOCACHE_UPDATE_COORD:     'Cannot update coordinates on the server',
            FAILURE_GEOCACHE_UPDATE_NOTE:      'Cannot update user note on the server',

            // related to filter
            FAILURE_FILTER_FROM_SERVER:        'Cannot retrieve the list of filter from the server.',
            FAILURE_DELETE_FILTER_FROM_SERVER: 'Cannot delete the filter on the server.',
            FAILURE_UPDATE_FILTER_ON_SERVER:   'Cannot update the filter on the server.',
            FAILURE_CREATE_FILTER_ON_SERVER:   'Cannot create the filter on the server.',
            FAILURE_FILTER_ON_SERVER:          'Cannot retrieve filtered list from the server.',
        }) 
        .constant('TYPE_TRANSLATION', [
            {prop: 'tradi',     text: 'Traditional Cache'},                      
            {prop: 'letter',    text: 'Letterbox Hybrid'},                       
            {prop: 'event',     text: 'Event Cache'},              
            {prop: 'multi',     text: 'Multi-cache'},              
            {prop: 'wherigo',   text: 'Wherigo Cache'},            
            {prop: 'mega',      text: 'Mega-Event Cache'},         
            {prop: 'unknown',   text: 'Unknown Cache'},            
            {prop: 'earth',     text: 'Earthcache'},               
            {prop: 'cito',      text: 'Cache In Trash Out Event'}, 
            {prop: 'virtual',   text: 'Virtual Cache'},            
            {prop: 'adventure', text: 'GPS Adventures Exhibit'},   
            {prop: 'webcam',    text: 'Webcam cache'},             
            {prop: 'ape',       text: 'Project APE Cache'},        
            {prop: 'less',      text: 'Locationless Cache'},       
        ]) 
        .constant('TYPE_TO_PROP',{
            // will be filled on startup based on TYPE_TRANSLATION
        }) 
        .constant('TYPE_TO_STRING', {
            // will be filled on startup based on TYPE_TRANSLATION
        })
        .constant('CONTAINER_TRANSLATION', [
            {prop: 'micro',      text: 'Micro'},
            {prop: 'small',      text: 'Small'},
            {prop: 'regular',    text: 'Regular'},
            {prop: 'large',      text: 'Large'},
            {prop: 'other',      text: 'Other'},
            {prop: 'not_chosen', text: 'Not chosen'}
        ])
        .constant('CONTAINER_TO_PROP', {
            // will be filled on startup based on CONTAINER_TRANSLATION
        })
        .constant('CONTAINER_TO_STRING', {
            // will be filled on startup based on CONTAINER_TRANSLATION
        });
  
})();           
                         
