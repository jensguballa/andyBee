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
        'Front Yard (Private Residence)': 'Frontyard.svg',
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
        'Seasonal Access': 'Seasonal_access.svg',
        'Short hike (less than 1km)': 'Short_hike_(less_than_1km).svg',
        'Significant Hike': 'Significant_Hike.svg',
        'Snowmobiles': 'Snowmobiles.svg',
        'Snowshoes': 'Snowshoes.svg',
        'Special Tool Required': 'Special_Tool_Required.svg',
        'Stealth required': 'Stealth_required.svg',
        'Stroller accessible': 'Stroller_accessible.svg',
        'Takes less than an hour': 'Takes_less_than_an_hour.svg',
        'Teamwork Required': 'Teamwork_required.svg',
        'Telephone nearby': 'Telephone_nearby.svg',
        'Thorns': 'Thorns.svg',
        'Ticks': 'Ticks.svg',
        'Tourist Friendly': 'Tourist_friendly.svg',
        'Tree Climbing': 'Tree_climbing.svg',
        'Truck Driver/RV': 'Truck_Driver_RV.svg',
        'UV Light Required': 'UV_Light_Required.svg',
        'Watch for livestock': 'Watch_for_livestock.svg',
        'Wheelchair accessible': 'Wheelchair_accessible.svg',
        'Wireless Beacon': 'Wireless_Beacon.svg',
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

        function rating_to_imgs(rating) {
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

        function attr_to_img(attr, state) {
            var img;
            var img_name = attr_trans[attr];
            if (img_name) {
                img = 'static/images/attributes/' + state + '_' + img_name;
            }
            else {
                img = 'static/images/not_supported.svg';
            }
            return img;
        }

        function log_to_img(log) {
            var img = log_trans[log];
            if (!img) {
                img = log_trans['Not Supported'];
            }
            return img;
        }

        function coord_to_obj(coord, str1, str2) {
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

        function obj_to_coord(obj) {
            var coord = obj.degrees + obj.minutes / 60;
            if ((obj.type == 'W') || (obj.type == 'S')) {
                coord = -coord;
            }
            return coord;
        }

        function coord_equal(coord1, coord2) {
            var c1 = coord_to_obj(coord1, 'A', 'B');
            var c2 = coord_to_obj(coord2, 'A', 'B');
            return ((c1.type == c2.type) && (c1.degrees == c2.degrees) && (c1.minutes == c2.minutes));
        }

        function latlng_equal(latlng1, latlng2) {
            return (coord_equal(latlng1.lat, latlng2.lat) && coord_equal(latlng1.lng, latlng2.lng));
        }

    }

})();
