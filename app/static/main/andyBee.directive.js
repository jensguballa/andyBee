(function () {
    'use strict';

    angular
        .module('andyBeeApp')
        .directive('convertToNumber', convertToNumber)
        .directive('fileModel', fileModel)
        .directive('geocacheIcon', geocacheIcon)
        .directive('geocacheRating', geocacheRating)
        .directive('geocacheSize', geocacheSize)
        .directive('geocacheAttr', geocacheAttr)
        .directive('geocacheCoord', geocacheCoord)
        .directive('geocacheDescr', geocacheDescr)
        .directive('geocacheLog', geocacheLog);
            
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

    geocacheIcon.$inject = ['Functions']
    function geocacheIcon(Functions) {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.class = attr.class;

            attr.$observe('type', function () {
                scope.src = Functions.type_to_img(attr.type);
            });
        }
    }


    geocacheSize.$inject = ['Functions'];
    function geocacheSize(Functions) {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.class = attr.class;

            attr.$observe('size', function () {
                scope.src = Functions.size_to_img(attr.size);
            });
        }
    }

    geocacheRating.$inject = ['Functions'];
    function geocacheRating(Functions) {
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
                var rating = attr.value;
                scope.src = Functions.rating_to_imgs(rating);
            });
        }
    }

    geocacheAttr.$inject = ['Functions'];
    function geocacheAttr(Functions) {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" class="{{class}}" title="{{title}}" />',
            link: link,
            scope: {}
        }

        function link(scope, elem, attr) {
            scope.class = attr.class;
            scope.title = attr.attr;

            attr.$observe('attr', function () {
                scope.src = Functions.attr_to_img(attr.attr, attr.inc);
            });
        }
    }

    geocacheCoord.$inject = ['Functions'];
    function geocacheCoord(Functions) {
        return {
            restrict: 'E',
            template: '<span>{{txt}}</span>',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            attr.$observe('lat', function () {
                scope.txt = coord(attr.lat, 'N', 'S');
            });
            attr.$observe('lon', function () {
                scope.txt = coord(attr.lon, 'E', 'W');
            });

            function coord(coord, str1, str2) {
                var obj = Functions.coord_to_obj(coord, str1, str2);
                return obj.type + ' ' + obj.degrees + ' ' + obj.minutes;
//                var str = str1;
//                if (coord < 0) {
//                    coord = -coord;
//                    str = str2;
//                }
//                var degrees = parseInt(coord);
//                return str + ' ' + degrees + ' ' + ((coord - degrees) * 60).toFixed(3);
            }
        }
    }

    geocacheDescr.$inject = ['$sce'];
    function geocacheDescr($sce) {
        return {
            restrict: 'E',
            template: '<div ng-bind-html="text"></div>',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            var text;
            var html;

            attr.$observe('text', function () {
                text = attr.text;
                update();
            });

            attr.$observe('html', function () {
                html = attr.html;
                update();
            });

            function update() {
                var txt;
                if (html == 'true') {
                    // enforce that links are opened in another tab/window
                    txt = text.replace(/\<a\s/g, '<a target="_blank" ');
                }
                else {
                    // replace plain text line breaks by <br />
                    txt = text.replace(/\n/g, '<br />');
                }
                scope.text = $sce.trustAsHtml(txt);
            }

        }
    }


    geocacheLog.$inject = ['Functions'];
    function geocacheLog(Functions) {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" title="{{title}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.title = attr.title;

            attr.$observe('type', function () {
                scope.src = Functions.log_to_img(attr.type);
            });
        }
    }

})();
