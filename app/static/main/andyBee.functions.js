(function () {
    'use strict';

    var marker_trans = {
        'Traditional Cache':        'static/images/marker/traditional.svg',
        'Letterbox Hybrid':         'static/images/marker/letterbox.svg',
        'Event Cache':              'static/images/marker/event.svg',
        'Multi-cache':              'static/images/marker/multi.svg',
        'Wherigo Cache':            'static/images/marker/wherigo.svg',
        'Mega-Event Cache':         'static/images/marker/mega.svg',
        'Unknown Cache':            'static/images/marker/unknown.svg',
        'Earthcache':               'static/images/marker/earth.svg',
        'Cache In Trash Out Event': 'static/images/marker/cito.svg',
        'Virtual Cache':            'static/images/marker/virtual.svg',
        'GPS Adventures Exhibit':   'static/images/marker/adventures.svg',
        'Webcam Cache':             'static/images/marker/webcam.svg',
        'Project APE Cache':        'static/images/marker/ape.svg',
        'Locationless Cache':       'static/images/marker/locationless.svg',
        'Giga-Event Cache':         'static/images/marker/giga.svg',
    };

    var type_trans = {
        'Traditional Cache':        'static/images/types/traditional.svg',
        'Letterbox Hybrid':         'static/images/types/letterbox.svg',
        'Event Cache':              'static/images/types/event.svg',
        'Multi-cache':              'static/images/types/multi.svg',
        'Wherigo Cache':            'static/images/types/wherigo.svg',
        'Mega-Event Cache':         'static/images/types/mega.svg',
        'Unknown Cache':            'static/images/types/unknown.svg',
        'Earthcache':               'static/images/types/earth.svg',
        'Cache In Trash Out Event': 'static/images/types/cito.svg',
        'Virtual Cache':            'static/images/types/virtual.svg',
        'GPS Adventures Exhibit':   'static/images/types/adventures.svg',
        'Webcam Cache':             'static/images/types/webcam.svg',
        'Project APE Cache':        'static/images/types/ape.svg',
        'Locationless Cache':       'static/images/types/locationless.svg',
        'Giga-Event Cache':         'static/images/types/giga.svg',
    };

    var size_trans = {
        'Micro':      'static/images/sizes/size_micro.svg',
        'Small':      'static/images/sizes/size_small.svg',
        'Regular':    'static/images/sizes/size_regular.svg',
        'Large':      'static/images/sizes/size_large.svg',
        'Other':      'static/images/sizes/size_other.svg',
        'Virtual':    'static/images/sizes/size_other.svg',
        'Not chosen': 'static/images/sizes/size_other.svg'
    };

    var attr_trans = {
        'Abandoned Structure': {img: 'Abandoned_Structure.svg', invertable: true},
        'Abandoned mines': {img: 'Abandoned_mines.svg', invertable: false},
        'Access or parking fee': {img: 'Access_or_parking_fee.svg', invertable: false},
        'Available at all times': {img: 'Available_at_all_times.svg', invertable: true},
        'Available during winter': {img: 'Available_during_winter.svg', invertable: true},
        'Bicycles': {img: 'Bicycles.svg', invertable: true},
        'Boat': {img: 'Boat.svg', invertable: false},
        'Campfires': {img: 'Campfires.svg', invertable: true},
        'Camping available': {img: 'Camping_available.svg', invertable: true},
        'Cliff / falling rocks': {img: 'Cliff___falling_rocks.svg', invertable: false},
        'Climbing gear': {img: 'Climbing_gear.svg', invertable: false},
        'Cross Country Skis': {img: 'Cross_Country_Skis.svg', invertable: false},
        'Dangerous Animals': {img: 'Dangerous_Animals.svg', invertable: false},
        'Dangerous area': {img: 'Dangerous_area.svg', invertable: false},
        'Difficult climbing': {img: 'Difficult_climbing.svg', invertable: true},
        'Dogs': {img: 'Dogs.svg', invertable: true},
        'Drinking water nearby': {img: 'Drinking_water_nearby.svg', invertable: true},
        'Field Puzzle': {img: 'Field_Puzzle.svg', invertable: true},
        'Flashlight required': {img: 'Flashlight_required.svg', invertable: false},
        'Food Nearby': {img: 'Food_Nearby.svg', invertable: true},
        'Front Yard (Private Residence)': {img: 'Frontyard.svg', invertable: true},
        'Fuel Nearby': {img: 'Fuel_Nearby.svg', invertable: true},
        'Horses': {img: 'Horses.svg', invertable: true},
        'Hunting': {img: 'Hunting.svg', invertable: false},
        'Long Hike (+10km)': {img: 'Long_Hike_(+10km).svg', invertable: true},
        'May require swimming': {img: 'May_require_swimming.svg', invertable: false},
        'May require wading': {img: 'May_require_wading.svg', invertable: false},
        'Medium hike (1km-10km)': {img: 'Medium_hike_(1km-10km).svg', invertable: true},
        'Motorcycles': {img: 'Motorcycles.svg', invertable: true},
        'Needs maintenance': {img: 'Needs_maintenance.svg', invertable: false},
        'Night Cache': {img: 'Night_Cache.svg', invertable: true},
        'Off-road vehicles': {img: 'Off-road_vehicles.svg', invertable: true},
        'Park and Grab': {img: 'Park_and_Grab.svg', invertable: true},
        'Parking available': {img: 'Parking_available.svg', invertable: true},
        'Picnic tables nearby': {img: 'Picnic_tables_nearby.svg', invertable: true},
        'Poison plants': {img: 'Poison_plants.svg', invertable: true},
        'Public restrooms nearby': {img: 'Public_restrooms_nearby.svg', invertable: true},
        'Public transportation': {img: 'Public_transportation.svg', invertable: false},
        'Quads': {img: 'Quads.svg', invertable: true},
        'Recommended at night': {img: 'Recommended_at_night.svg', invertable: true},
        'Recommended for kids': {img: 'Recommended_for_kids.svg', invertable: true},
        'Scenic view': {img: 'Scenic_view.svg', invertable: true},
        'Scuba gear': {img: 'Scuba_gear.svg', invertable: false},
        'Seasonal Access': {img: 'Seasonal_access.svg', invertable: true},
        'Short hike (less than 1km)': {img: 'Short_hike_(less_than_1km).svg', invertable: true},
        'Significant Hike': {img: 'Significant_Hike.svg', invertable: true},
        'Snowmobiles': {img: 'Snowmobiles.svg', invertable: true},
        'Snowshoes': {img: 'Snowshoes.svg', invertable: false},
        'Special Tool Required': {img: 'Special_Tool_Required.svg', invertable: false},
        'Stealth required': {img: 'Stealth_required.svg', invertable: true},
        'Stroller accessible': {img: 'Stroller_accessible.svg', invertable: true},
        'Takes less than an hour': {img: 'Takes_less_than_an_hour.svg', invertable: true},
        'Teamwork Required': {img: 'Teamwork_required.svg', invertable: true},
        'Telephone nearby': {img: 'Telephone_nearby.svg', invertable: true},
        'Thorns': {img: 'Thorns.svg', invertable: false},
        'Ticks': {img: 'Ticks.svg', invertable: false},
        'Tourist Friendly': {img: 'Tourist_friendly.svg', invertable: true},
        'Tree Climbing': {img: 'Tree_climbing.svg', invertable: true},
        'Truck Driver/RV': {img: 'Truck_Driver_RV.svg', invertable: true},
        'UV Light Required': {img: 'UV_Light_Required.svg', invertable: false},
        'Watch for livestock': {img: 'Watch_for_livestock.svg', invertable: false},
        'Wheelchair accessible': {img: 'Wheelchair_accessible.svg', invertable: true},
        'Wireless Beacon': {img: 'Wireless_Beacon.svg', invertable: false},
    };

    var log_trans = {
        "Found it":                    'static/images/logtypes/found.svg',
        "Didn't find it":              'static/images/logtypes/dnf.svg',
        "Write note":                  'static/images/logtypes/write_note.svg',
        "Needs Maintenance":           'static/images/logtypes/needs_maintenance.svg',
        "Temporarily Disable Listing": 'static/images/logtypes/disable_listing.svg',
        "Owner Maintenance":           'static/images/logtypes/owner_maintenance.svg',
        "Enable Listing":              'static/images/logtypes/enable_listing.svg',
        "Needs Archived":              'static/images/logtypes/needs_archived2.svg',
        "Will Attend":                 'static/images/logtypes/will_attend.svg',
        "Attended":                    'static/images/logtypes/attended.svg',
        "Webcam Photo Taken":          'static/images/logtypes/webcam_photo.svg',
        "Post Reviewer Note":          'static/images/logtypes/reviewer_note.svg',
        "Submit for Review":           'static/images/logtypes/not_supported.svg',
        "Publish Listing":             'static/images/logtypes/published.svg',
        "Archive":                     'static/images/logtypes/archived.svg',
        "Announcement":                'static/images/logtypes/announcement.svg',
        "Update Coordinates":          'static/images/logtypes/update_coordinates.svg',
        "Retract":                     'static/images/logtypes/not_supported.svg',
        "Unarchive":                   'static/images/logtypes/unarchive.svg',
        "Not Supported":               'static/images/logtypes/not_supported.svg'
    };

    angular
        .module('andyBeeApp')
        .factory('Functions', Functions);

    Functions.$inject = [];
    function Functions () {
        var func = {

            type_to_img: type_to_img,
            size_to_img: size_to_img,
            rating_to_imgs: rating_to_imgs,
            attr_to_img: attr_to_img,
            attr_invertable: attr_invertable,
            log_to_img: log_to_img,
            type_to_marker_img: type_to_marker_img,
            get_attributes: get_attributes,

            obj_to_coord: obj_to_coord,
            coord_to_obj: coord_to_obj,
            coord_equal: coord_equal,
            latlng_equal: latlng_equal
        };

        return func;


        function type_to_img (type) {
            return type_trans[type];
        }

        function type_to_marker_img (type) {
            return marker_trans[type];
        }

        function size_to_img (size) {
            return size_trans[size];
        }

        function rating_to_imgs (rating) {
            var imgs = [];
            for (var i = 0; i < 5; i++) {
                if (rating >= 1) {
                    imgs[i] = 'static/images/star.svg';
                }
                else if (rating > 0) {
                    imgs[i] = 'static/images/halfstar.svg';
                }
                else {
                    imgs[i] = 'static/images/star_empty.svg';
                }
                rating--;
            }
            return imgs;
        }

        function get_attributes () {
            var attributes = [];
            for (var i in attr_trans) {
                if (attr_trans.hasOwnProperty(i)) {
                    attributes.push(i);
                }
            }
            return attributes;
        }

        function attr_invertable (attr) {
            return attr_trans[attr].invertable;
        }

        function attr_to_img (attr, state) {
            var img;
            var img_name = attr_trans[attr].img;
            if (img_name) {
                img = 'static/images/attributes/' + state + '_' + img_name;
            }
            else {
                img = 'static/images/not_supported.svg';
            }
            return img;
        }

        function log_to_img (log) {
            var img = log_trans[log];
            if (!img) {
                img = log_trans['Not Supported'];
            }
            return img;
        }

        function coord_to_obj (coord, str1, str2) {
            var str = str1;
            if (coord < 0) {
                coord = -coord;
                str = str2;
            }
            var degrees = parseInt(coord);
            //return str + ' ' + degrees + ' ' + ((coord - degrees) * 60).toFixed(3);
            return {
                type: str,
                degrees: degrees,
                minutes: ((coord - degrees) * 60).toFixed(3)
            };
        }

        function obj_to_coord (obj) {
            var coord = obj.degrees + obj.minutes / 60;
            if ((obj.type == 'W') || (obj.type == 'S')) {
                coord = -coord;
            }
            return coord;
        }

        function coord_equal (coord1, coord2) {
            var c1 = coord_to_obj(coord1, 'A', 'B');
            var c2 = coord_to_obj(coord2, 'A', 'B');
            return ((c1.type == c2.type) && (c1.degrees == c2.degrees) && (c1.minutes == c2.minutes));
        }

        function latlng_equal (latlng1, latlng2) {
            return (coord_equal(latlng1.lat, latlng2.lat) && coord_equal(latlng1.lng, latlng2.lng));
        }

    }

})();
