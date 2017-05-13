(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .directive('convertToNumber', convertToNumber)
        .directive('fileModel', fileModel)
        .directive('geocacheIcon', geocacheIcon);
            
    function convertToNumber() {
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$parsers.push(function(val) {
                    return val != null ? parseInt(val, 10) : null;
                });
                ngModel.$formatters.push(function(val) {
                    return val != null ? '' + val : null;
                });
            }
        };
    }

    fileModel.$inject = ['$parse'];
    function fileModel($parse) {
        return {
           restrict: 'A',
           link: function(scope, element, attrs) {
              var model = $parse(attrs.fileModel);
              var modelSetter = model.assign;
              element.bind('change', function(){
                 scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                 });
              });
           }
        };
    }

    var img_trans = {
        'Traditional Cache':        'static/images/OCMLogoSmall.svg',
        'Letterbox Hybrid':         'static/images/letterbox.svg',
        'Event Cache':              'static/images/event.svg',                  
        'Multi-cache':              'static/images/multi.svg',                  
        'Wherigo Cache':            'static/images/wherigo.svg',                  
        'Mega-Event Cache':         'static/images/mega.svg',                  
        'Unknown Cache':            'static/images/unknown.svg',                  
        'Earthcache':               'static/images/earth.svg',                  
        'Cache In Trash Out Event': 'static/images/cito.svg',                  
        'Virtual Cache':            'static/images/virtual.svg',                  
        'GPS Adventures Exhibit':   'static/images/other.svg',                  
        'Webcam cache':             'static/images/webcam.svg',                  
        'Project APE Cache':        'static/images/other.svg',                  
        'Locationless Cache':       'static/images/other.svg',                  
    };

    function geocacheIcon() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" height="{{height}}" />',
            link: link,
        };

        function link(scope, elem, attr) {
            scope.src = img_trans[attr.type];
            scope.class = attr.class;
            scope.height = attr.height || "20px";
        }
    }

})();
