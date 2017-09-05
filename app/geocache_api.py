import os.path, json, io
import werkzeug
from flask_restful import Resource, reqparse, request
from app import app, api, geocache_db
from marshmallow import Schema, fields
from gpx import export_gpx, GpxImporter
from geocache_model_sql import Cache, Cacher, CacheType, CacheContainer, CacheCountry, CacheState
from flask import send_from_directory, send_file, Response, make_response
from app.api import json_to_object

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
    last_logs  = fields.String()
    lat        = fields.Float()
    lon        = fields.Float()
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
    hidden     = fields.String()
    short_desc = fields.String()
    short_html = fields.Boolean()
    long_desc  = fields.String()
    long_html  = fields.Boolean()
    encoded_hints = fields.String()
    logs       = fields.List(fields.Nested(LogSchema))
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

class GeocacheListApi(Resource):

    def get(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)

        owners = {}
        for row in geocache_db.execute('SELECT * from cacher'):
            owners[row['id']] = row['name']
        
        types = {}
        for row in geocache_db.execute('SELECT * from cache_type'):
            types[row['id']] = row['name']

        containers = {}
        for row in geocache_db.execute('SELECT * from cache_container'):
            containers[row['id']] = row['name']

        countries = {}
        for row in geocache_db.execute('SELECT * from cache_country'):
            countries[row['id']] = row['name']

        states = {}
        for row in geocache_db.execute('SELECT * from cache_state'):
            states[row['id']] = row['name']

        stmt = 'SELECT id, available, archived, name, ' \
                'placed_by, owner_id, type_id, container_id, terrain, difficulty, ' \
                'country_id, state_id, last_logs, lat, lon, gc_code, url, found, ' \
                'short_desc, short_html, long_desc, long_html, encoded_hints, ' \
                'coords_updated, corr_lat, corr_lon '\
                'FROM cache'
        geocaches = [dict(row) for row in geocache_db.execute(stmt)]

        for row in geocaches:
            update_corrected_coordinates(row)
            row['owner'] = owners[row['owner_id']]
            row['type'] = types[row['type_id']]
            row['container'] = containers[row['container_id']]
            row['country'] = countries[row['country_id']]
            row['state'] = states[row['state_id']]

        data, errors = GeocacheListSchema().dump({
            'geocaches': geocaches,
            'db_name': db_name,
            #'nbr_caches': geocache_db.session.query(func.count(Cache.id)).scalar()
            'nbr_caches': len(geocaches)
            })
        if errors:
            errors['msg'] = 'Internal error, could not dump list of geocaches.'
            return errors, 422
        return data


api.add_resource(GeocacheListApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches')


class GeocacheSingleSchema(Schema):
    geocache   = fields.Nested(GeocacheFullSchema)

class GeocacheApi(Resource):
    def get(self, db_name, id):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_db(file_path)

        stmt = '''SELECT 
                cache.id AS id,
                cache.archived AS archived,
                cache.available AS available,
                cache_container.name AS container,
                cache.coords_updated AS coords_updated,
                cache.corr_lat AS corr_lat,
                cache.corr_lon AS corr_lon,
                cache_country.name AS country,
                cache.difficulty AS difficulty,
                cache.encoded_hints AS encoded_hints,
                cache.found AS found,
                cache.gc_code AS gc_code,
                cache.hidden AS hidden,
                cache.last_logs AS last_logs,
                cache.lat AS lat,
                cache.lon AS lon,
                cache.long_desc AS long_desc,
                cache.long_html AS long_html,
                cache.name AS name,
                cacher.name AS owner,
                cache.placed_by AS placed_by,
                cache.short_desc AS short_desc,
                cache.short_html AS short_html,
                cache_state.name AS state,
                cache.terrain AS terrain,
                cache_type.name AS type,
                cache.url AS url
                FROM cache
                INNER JOIN cache_container ON cache_container.id = cache.container_id
                INNER JOIN cache_country ON cache_country.id = cache.country_id
                INNER JOIN cacher ON cacher.id = cache.owner_id
                INNER JOIN cache_state ON cache_state.id = cache.state_id
                INNER JOIN cache_type ON cache_type.id = cache.type_id
                WHERE cache.id = ?
        '''
        geocache = dict(geocache_db.execute(stmt,(id,)).fetchone())

        update_corrected_coordinates(geocache)

        stmt = '''SELECT
                attribute.inc AS inc,
                attribute.name AS name
                FROM cache_to_attribute
                INNER JOIN attribute ON attribute.id = cache_to_attribute.attribute_id
                WHERE cache_to_attribute.cache_id = ?
                '''
        geocache['attributes'] = [dict(row) for row in geocache_db.execute(stmt, (id,))]

        stmt = '''SELECT
                log.date AS date,
                cacher.name AS finder,
                log.lat AS lat,
                log.lon AS lon,
                log.text AS text,
                log.text_encoded AS text_encoded,
                log_type.name AS type
                FROM log
                INNER JOIN cacher ON cacher.id = log.finder_id
                INNER JOIN log_type ON log_type.id = log.type_id
                WHERE log.cache_id = ?
                '''
        geocache['logs'] = [dict(row) for row in geocache_db.execute(stmt, (id,))]

        stmt = '''SELECT
                waypoint.lat AS lat,
                waypoint.lon AS lon, 
                waypoint.time AS time, 
                waypoint.name AS name, 
                waypoint.descr AS descr, 
                waypoint.url AS url, 
                waypoint.urlname AS urlname,
                waypoint_sym.name AS sym,
                waypoint_type.name AS type,
                waypoint.cmt AS cmt
                FROM waypoint
                INNER JOIN waypoint_sym ON waypoint_sym.id = waypoint.sym_id
                INNER JOIN waypoint_type ON waypoint_type.id = waypoint.type_id
                WHERE cache_id = ? AND waypoint.name != waypoint.gc_code
                '''
        geocache['waypoints'] = [dict(row) for row in geocache_db.execute(stmt, (id,))]

        data, errors = GeocacheSingleSchema().dump({
            'geocache': geocache
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
        if args['action'] == 'reset':
            geocache_db.update(Cache, id, {'coords_updated': False, 'corr_lat': None, 'corr_lon': None})
        else:
            geocache_db.update(Cache, id, {'coords_updated': True, 'corr_lat': lat, 'corr_lon': lon})
        geocache_db.commit()
        return {}

api.add_resource(GeocacheUpdateCoordsApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>/update_coords')


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
        geocache_db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)

        obj, status_code = json_to_object(GeocacheExportSchema())
        if status_code != 200:
            return obj, status_code
        response = make_response(export_gpx(obj))
        response.headers['Content-Type'] = 'application/gpx'
        response.headers['Content-Disposition'] = ('attachment; filename=' + obj['file_name'])
        return response 

def update_corrected_coordinates(geocache):
    if geocache['coords_updated']:
        geocache['orig_lat'] = geocache['lat']
        geocache['orig_lon'] = geocache['lon']
        geocache['lat'] = geocache['corr_lat']
        geocache['lon'] = geocache['corr_lon']
    else:
        geocache['coords_updated'] = False

api.add_resource(GpxExportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_export')

