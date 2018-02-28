import os.path, json, io
import werkzeug
from flask_restful import Resource, reqparse, request
from app import app, api, geocache_db
from marshmallow import Schema, fields
from gpx import export_gpx, GpxImporter
from geocache_model_sql import Cache, Cacher, CacheType, CacheContainer, CacheCountry, CacheState, UserNote, db_model_update
from geocache import Geocache, GeocacheList
from flask import send_from_directory, send_file, Response, make_response
from app.api import json_to_object
import time
import dateutil
import datetime
import calendar
import re


class DbListSchema(Schema):
    dbs = fields.List(fields.String())


class DbListApi(Resource):

    def get(self):
        list = next(os.walk(app.config['SQLALCHEMY_DATABASE_DIR']))[2]
        data, errors = DbListSchema().dump({'dbs': sorted(list)})
        if errors:
            errors['msg'] = 'Internal error, could not create list of databases.'
            return errors, 422
        return data

    def post(self):
        parse = reqparse.RequestParser()
        parse.add_argument('db', type=str, location='json')
        args = parse.parse_args()
        db_name = args['db']
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if os.path.isfile(file_path):
            return {'msg': 'Database is already existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)
        geocache_db.create_all()
        geocache_db.commit()
        return {}

api.add_resource(DbListApi, '/andyBee/api/v1.0/db')

class AttributeSchema(Schema):
    name    = fields.String()
    inc     = fields.Boolean()

class LogSchema(Schema):
    date    = fields.String()
    finder  = fields.String()
    lat     = fields.Float()
    lon     = fields.Float()
    text    = fields.String()
    text_encoded = fields.String()
    type    = fields.String()
    
class WaypointSchema(Schema):
    lat     = fields.Float()
    lon     = fields.Float()
    time    = fields.String()
    name    = fields.String()
    descr   = fields.String()
    url     = fields.String()
    urlname = fields.String()
    sym     = fields.String()
    type    = fields.String()
    cmt     = fields.String()

class GeocacheBasicSchema(Schema):
    id         = fields.Integer()
    archived   = fields.Boolean()
    available  = fields.Boolean()
    container  = fields.String()
    coords_updated = fields.Boolean()
    country    = fields.String()
    difficulty = fields.Float()
    found      = fields.Boolean()
    gc_code    = fields.String()
    hidden     = fields.Integer()
    last_logs  = fields.String()
    last_updated = fields.Integer()
    lat        = fields.Float()
    lon        = fields.Float()
    note_present = fields.Boolean()
    orig_lat   = fields.Float()
    orig_lon   = fields.Float()
    owner      = fields.String()
    placed_by  = fields.String()
    state      = fields.String()
    terrain    = fields.Float()
    title      = fields.String(attribute="name") 
    url        = fields.String()
    type       = fields.String()


class GeocacheFullSchema(GeocacheBasicSchema):
    attributes = fields.List(fields.Nested(AttributeSchema))
    short_desc = fields.String()
    short_html = fields.Boolean()
    long_desc  = fields.String()
    long_html  = fields.Boolean()
    encoded_hints = fields.String()
    logs       = fields.List(fields.Nested(LogSchema))
    user_note  = fields.String()
    waypoints  = fields.List(fields.Nested(WaypointSchema))

class GeocacheListSchema(Schema):
    geocaches  = fields.List(fields.Nested(GeocacheBasicSchema))
    db_name    = fields.String()
    nbr_caches = fields.Integer()

class GeocacheExportSchema(Schema):
    file_name   = fields.String()
    max_logs    = fields.Integer()
    waypoints   = fields.Boolean()
    list        = fields.List(fields.Integer())

class GeocacheDeleteSchema(Schema):
    geocaches   = fields.List(fields.Integer())

class GeocacheListApi(Resource):

    def get(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)

        db_model_update(geocache_db)

        geocaches = GeocacheList(geocache_db).get_data_for_rest_itf()

        data, errors = GeocacheListSchema().dump({
            'geocaches': geocaches,
            'db_name': db_name,
            'nbr_caches': len(geocaches)
            })
        if errors:
            errors['msg'] = 'Internal error, could not dump list of geocaches.'
            return errors, 422
        return data

api.add_resource(GeocacheListApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches')

class GeocacheDeleteListApi(Resource):

    def post(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)
        parse = reqparse.RequestParser()
        parse.add_argument('geocaches', type=list, location='json')
        args = parse.parse_args()
        for geocache_id in args['geocaches']:
            geocache_db.delete(Cache, geocache_id)
            geocache_db.delete(UserNote, geocache_id)
            geocache_db.execute('DELETE FROM cache_to_attribute WHERE cache_id = ?', (geocache_id,))
            geocache_db.execute('DELETE FROM log WHERE cache_id = ?', (geocache_id,))
            geocache_db.execute('DELETE FROM waypoint WHERE cache_id = ?', (geocache_id,))
        geocache_db.commit()
        return {}

api.add_resource(GeocacheDeleteListApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/delete_list')


class GeocacheSingleSchema(Schema):
    geocache   = fields.Nested(GeocacheFullSchema)

class GeocacheApi(Resource):
    def get(self, db_name, id):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity

        data, errors = GeocacheSingleSchema().dump({
            'geocache': Geocache(id, geocache_db).get_data_for_rest_itf()
        })
        if errors:
            errors['msg'] = 'Internal error, could not dump geocache data.'
            return errors, 422
        return data

api.add_resource(GeocacheApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>')

class GeocacheUpdateCoordsApi(Resource):

    def post(self, db_name, id):
        parse = reqparse.RequestParser()
        parse.add_argument('action', type=str, location='json')
        parse.add_argument('lat', type=float, location='json')
        parse.add_argument('lon', type=float, location='json')
        args = parse.parse_args()
        lat = args['lat']
        lon = args['lon']
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)
        now = int(time.time())
        if args['action'] == 'reset':
            geocache_db.update(Cache, id, {'coords_updated': False, 'corr_lat': None, 'corr_lon': None, 'last_updated': now})
        else:
            geocache_db.update(Cache, id, {'coords_updated': True, 'corr_lat': lat, 'corr_lon': lon, 'last_updated': now})
        geocache_db.commit()
        return {}

api.add_resource(GeocacheUpdateCoordsApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>/update_coords')

class GeocacheUpdateNoteApi(Resource):

    def post(self, db_name, id):
        parse = reqparse.RequestParser()
        parse.add_argument('user_note', type=unicode, location='json')
        args = parse.parse_args()
        user_note = args['user_note']
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)
        res = geocache_db.get_by_id(UserNote, id)
        if user_note == "":
            if res is not None:
                geocache_db.delete(UserNote, id)
        else:
            if res is not None:
                geocache_db.update(UserNote, id, {'note': user_note})
            else:
                geocache_db.insert(UserNote, {'id': id, 'note': user_note})
        geocache_db.update(Cache, id, {'note_present': (user_note != '')})
        geocache_db.commit()
        return {}

api.add_resource(GeocacheUpdateNoteApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>/update_note')


class GpxImportApi(Resource):

    def post(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)
        parse = reqparse.RequestParser()
        parse.add_argument('gpx_file', type=werkzeug.datastructures.FileStorage, location='files')
        parse.add_argument('max_logs', type=int)
        parse.add_argument('user_name')
        args = parse.parse_args()
        gpx_file = args['gpx_file']
        if gpx_file is None:
            return {'msg': 'GPX file name missing.'}, 400 # bad request
        gpx_import = GpxImporter(geocache_db, args['max_logs'], args['user_name'])
        gpx_import.import_gpx(gpx_file)
        return {} 

api.add_resource(GpxImportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_import')

class GpxExportApi(Resource):

    def post(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)

        obj, status_code = json_to_object(GeocacheExportSchema())
        if status_code != 200:
            return obj, status_code
        response = make_response(export_gpx(obj))
        response.headers['Content-Type'] = 'application/gpx'
        response.headers['Content-Disposition'] = ('attachment; filename=' + obj['file_name'])
        return response 


class FilterConditionSchema(Schema):
    property = fields.String()
    op = fields.String()
    value = fields.String()

class FilteredListSchema(Schema):
    filtered_list = fields.List(fields.Integer())

class FilterConditionApi(Resource):

    def filter_on_description(self, condition):
        search_for = condition['value']
        if condition['op'] == 'search':
            search_for = '(?i)' + search_for
        rows = geocache_db.execute('SELECT id FROM cache WHERE long_desc REGEXP ? OR short_desc REGEXP ?', (search_for, search_for))
        return rows

    def filter_on_note(self, condition):
        search_for = condition['value']
        if condition['op'] == 'search':
            search_for = '(?i)' + search_for
        rows = geocache_db.execute('SELECT id FROM user_note WHERE note REGEXP ?', (search_for,))
        return rows


    def filter_on_attributes(self, condition):
        txt_to_attr = {}
        for attribute in geocache_db.execute('SELECT id, inc, name FROM attribute'):
            txt_to_attr[('+' if (attribute['inc'] == 1) else '-') + attribute['name']] = attribute['id']

        attr_ids = []
        for attr_name in condition['value'].split(','):
            if attr_name in txt_to_attr:
                attr_ids.append(txt_to_attr[attr_name])
        placeholders = ','.join('?' * len(attr_ids))
        query = 'SELECT cache_id AS id, count(*) AS attr_count FROM cache_to_attribute WHERE attribute_id IN (%s) GROUP BY cache_id HAVING attr_count = ?' % placeholders 
        rows = geocache_db.execute(query, tuple(attr_ids) + (len(attr_ids),))
        return rows

    def post(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)

        obj, status_code = json_to_object(FilterConditionSchema())
        if status_code != 200:
            return obj, status_code

        rows = []
        if obj['property'] == 'description':
            rows = self.filter_on_description(obj)
        elif obj['property'] == 'attributes':
            rows = self.filter_on_attributes(obj)
        elif obj['property'] == 'note_search':
            rows = self.filter_on_note(obj)
        else:
            return {'msg': 'Cannot filter on property "{}".'.format(obj['property'])}, 422 # unprocessable entity

        filtered_list = []
        for row in rows:
            filtered_list.append(row['id'])
        data, errors = FilteredListSchema().dump({
            'filtered_list': filtered_list
            })
        if errors:
            errors['msg'] = 'Internal error, could not dump list of geocaches.'
            return errors, 422
        return data

api.add_resource(FilterConditionApi, '/andyBee/api/v1.0/db/<string:db_name>/filter_condition')

def update_corrected_coordinates(geocache):
    geocache['orig_lat'] = geocache['lat']
    geocache['orig_lon'] = geocache['lon']
    if geocache['coords_updated']:
        geocache['lat'] = geocache['corr_lat']
        geocache['lon'] = geocache['corr_lon']
    else:
        geocache['coords_updated'] = False

def adapt_hidden(geocache):
    full_date = dateutil.parser.parse(geocache['hidden'])
    date = datetime.datetime(full_date.year, full_date.month, full_date.day)
    geocache['hidden'] = int(calendar.timegm(date.timetuple()))

api.add_resource(GpxExportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_export')

