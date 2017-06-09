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
        'Other':      'static/images/size_other.svg',
        'Virtual':    'static/images/size_other.svg',
        'Not chosen': 'static/images/size_other.svg'
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

    var attr_trans = {
        'Abandoned Structure': 'Abandoned_Structure.svg',
        'Abandoned mines': 'Abandoned_mines.svg',
        'Access or parking fee': 'Access_or_parking_fee.svg',
        'Available at all times': 'Available_at_all_times.svg',
        'Available during winter': 'Available_during_winter.svg',
        'Bicycles': 'Bicycles.svg',
        'Boat': 'Boat.svg',
        'Campfires': 'Campfires.svg',
        'Camping available': 'Camping_available.svg',
        'Cliff / falling rocks': 'Cliff___falling_rocks.svg',
        'Climbing gear': 'Climbing_gear.svg',
        'Cross Country Skis': 'Cross_Country_Skis.svg',
        'Dangerous Animals': 'Dangerous_Animals.svg',
        'Dangerous area': 'Dangerous_area.svg',
        'Difficult climbing': 'Difficult_climbing.svg',
        'Dogs': 'Dogs.svg',
        'Drinking water nearby': 'Drinking_water_nearby.svg',
        'Field Puzzle': 'Field_Puzzle.svg',
        'Flashlight required': 'Flashlight_required.svg',
        'Food Nearby': 'Food_Nearby.svg',
        'Fuel Nearby': 'Fuel_Nearby.svg',
        'Horses': 'Horses.svg',
        'Hunting': 'Hunting.svg',
        'Long Hike (+10km)': 'Long_Hike_(+10km).svg',
        'May require swimming': 'May_require_swimming.svg',
        'May require wading': 'May_require_wading.svg',
        'Medium hike (1km-10km)': 'Medium_hike_(1km-10km).svg',
        'Motorcycles': 'Motorcycles.svg',
        'Needs maintenance': 'Needs_maintenance.svg',
        'Night Cache': 'Night_Cache.svg',
        'Off-road vehicles': 'Off-road_vehicles.svg',
        'Park and Grab': 'Park_and_Grab.svg',
        'Parking available': 'Parking_available.svg',
        'Picnic tables nearby': 'Picnic_tables_nearby.svg',
        'Poison plants': 'Poison_plants.svg',
        'Public restrooms nearby': 'Public_restrooms_nearby.svg',
        'Public transportation': 'Public_transportation.svg',
        'Quads': 'Quads.svg',
        'Recommended at night': 'Recommended_at_night.svg',
        'Recommended for kids': 'Recommended_for_kids.svg',
        'Scenic view': 'Scenic_view.svg',
        'Scuba gear': 'Scuba_gear.svg',
        'Short hike (less than 1km)': 'Short_hike_(less_than_1km).svg',
        'Significant Hike': 'Significant_Hike.svg',
        'Snowmobiles': 'Snowmobiles.svg',
        'Snowshoes': 'Snowshoes.svg',
        'Special Tool Required': 'Special_Tool_Required.svg',
        'Stealth required': 'Stealth_required.svg',
        'Stroller accessible': 'Stroller_accessible.svg',
        'Takes less than an hour': 'Takes_less_than_an_hour.svg',
        'Telephone nearby': 'Telephone_nearby.svg',
        'Thorns': 'Thorns.svg',
        'Ticks': 'Ticks.svg',
        'Truck Driver/RV': 'Truck_Driver_RV.svg',
        'UV Light Required': 'UV_Light_Required.svg',
        'Watch for livestock': 'Watch_for_livestock.svg',
        'Wheelchair accessible': 'Wheelchair_accessible.svg',
        'Wireless Beacon': 'Wireless_Beacon.svg',
    };

    function geocacheAttr() {
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
                scope.src = 'static/images/attributes/' + (attr.inc == "true" ? 'yes' : 'no') + '_' + attr_trans[attr.attr];
            });
        }
    }

    geocacheCoord.$inject = ['GeocacheService'];
    function geocacheCoord(GeocacheService) {
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
                var obj = GeocacheService.coord_to_obj(coord, str1, str2);
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

    var log_trans = {
        "Found it":                    'static/images/found.svg',
        "Didn't find it":              'static/images/dnf.svg',
        "Write note":                  'static/images/write_note.svg',
        "Needs Maintenance":           'static/images/needs_maintenance.svg',
        "Temporarily Disable Listing": 'static/images/disable_listing.svg',
        "Owner Maintenance":           'static/images/owner_maintenance.svg',
        "Enable Listing":              'static/images/enable_listing.svg',
        "Needs Archived":              'static/images/needs_archived2.svg',
        "Will Attend":                 'static/images/not_supported.svg',
        "Attended":                    'static/images/not_supported.svg',
        "Webcam Photo Taken":          'static/images/not_supported.svg',
        "Post Reviewer Note":          'static/images/not_supported.svg',
        "Submit for Review":           'static/images/not_supported.svg',
        "Publish Listing":             'static/images/not_supported.svg',
        "Archive":                     'static/images/not_supported.svg',
        "Announcement":                'static/images/not_supported.svg',
        "Update Coordinates":          'static/images/not_supported.svg',
        "Retract":                     'static/images/not_supported.svg',
        "Unarchive":                   'static/images/not_supported.svg',
        "Not Supported":               'static/images/not_supported.svg'
    };

    function translate_log_type(type) {
        var ret = log_trans[type];
        if (!ret) {
            ret = log_trans["Not Supported"];
        }
        return ret;
    }

    function geocacheLog() {
        return {
            restrict: 'E',
            template: '<img ng-src="{{src}}" title="{{title}}" />',
            link: link,
            scope: {}
        };

        function link(scope, elem, attr) {
            scope.title = attr.title;

            attr.$observe('type', function () {
                scope.src = translate_log_type(attr.type);
            });
        }
    }

})();
