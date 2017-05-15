(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .directive('convertToNumber', convertToNumber)
        .directive('fileModel', fileModel)
        .directive('geocacheIcon', geocacheIcon)
        .directive('geocacheRating', geocacheRating)
        .directive('geocacheSize', geocacheSize);
            
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

    var type_trans = {
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
        'Webcam Cache':             'static/images/webcam.svg',
        'Project APE Cache':        'static/images/other.svg',
        'Locationless Cache':       'static/images/other.svg',
    };

    function geocacheIcon() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.class = attr.class;

            attr.$observe('type', function () {
                scope.src = type_trans[attr.type];
            });
        }
    }

    var size_trans = {
        'Micro':      'static/images/size_micro.svg',
        'Small':      'static/images/size_small.svg',
        'Regular':    'static/images/size_regular.svg',
        'Large':      'static/images/size_large.svg',
        'Other':      'static/images/other.svg',
        'Virtual':    'static/images/other.svg',
        'Not chosen': 'static/images/other.svg'
    };

    function geocacheSize() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.class = attr.class;

            attr.$observe('size', function () {
                scope.src = size_trans[attr.size];
            });
        }
    }
    function geocacheRating() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src[0]}}" class="{{class}}" />' +
                      '<img ng-src="{{src[1]}}" class="{{class}}" />' +
                      '<img ng-src="{{src[2]}}" class="{{class}}" />' +
                      '<img ng-src="{{src[3]}}" class="{{class}}" />' +
                      '<img ng-src="{{src[4]}}" class="{{class}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.class = attr.class;

            attr.$observe('value', function () {
                scope.src = [];
                var rating = attr.value;
                for (var i = 0; i < 5; i++) {
                    if (rating >= 1) {
                        scope.src[i] = 'static/images/star.svg';
                    }
                    else if (rating > 0) {
                        scope.src[i] = 'static/images/halfstar.svg';
                    }
                    else {
                        scope.src[i] = 'static/images/star_empty.svg';
                    }
                    rating--;
                }
            });
        }
    }

})();
