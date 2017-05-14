import os.path, json, io
import werkzeug
from flask_restful import Resource, reqparse, request
from app import app, api, geocache_db
from marshmallow import Schema, fields
from sqlalchemy import func
from sqlalchemy.orm import joinedload, noload, subqueryload
from gpx import import_gpx, export_gpx
from geocache_model import Cache
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
        geocache_db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
        geocache_db.create_all()
        return {}

api.add_resource(DbListApi, '/andyBee/api/v1.0/db')

class AttributeSchema(Schema):
    name    = fields.String()
    inc     = fields.Boolean()

class LogSchema(Schema):
    date    = fields.String()
    type    = fields.Function(lambda log: log.type.name)
    finder  = fields.Function(lambda log: log.finder.name)
    text    = fields.String()
    text_encoded = fields.String()
    lat     = fields.Float()
    lon     = fields.Float()
    
class WaypointSchema(Schema):
    lat     = fields.Float()
    lon     = fields.Float()
    time    = fields.String()
    name    = fields.String()
    desc    = fields.String()
    url     = fields.String()
    urlname = fields.String()
    sym     = fields.String()
    type    = fields.String()
    cmt     = fields.String()

class GeocacheBasicSchema(Schema):
    id         = fields.Integer()
    available  = fields.Boolean()
    archived   = fields.Boolean()
    title      = fields.String(attribute="name") 
    placed_by  = fields.String()
    owner      = fields.Function(lambda cache: cache.owner.name)
    type       = fields.Function(lambda cache: cache.type.name)
    container  = fields.Function(lambda cache: cache.container.name)
    difficulty = fields.Float()
    terrain    = fields.Float()
    country    = fields.Function(lambda cache: cache.country.name)
    state      = fields.Function(lambda cache: cache.state.name)
    gc_id      = fields.Function(lambda cache: cache.waypoint.name)
    lat        = fields.Function(lambda cache: cache.waypoint.lat)
    lon        = fields.Function(lambda cache: cache.waypoint.lon)


class GeocacheFullSchema(GeocacheBasicSchema):
    attributes = fields.List(fields.Nested(AttributeSchema))
    url        = fields.Function(lambda cache: cache.waypoint.url)
    short_desc = fields.String()
    short_html = fields.String()
    long_desc  = fields.String()
    long_html  = fields.String()
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
        geocache_db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
        data, errors = GeocacheListSchema().dump({
            'geocaches': geocache_db.session.query(Cache).all(),
            'db_name': db_name,
            'nbr_caches': geocache_db.session.query(func.count(Cache.id)).scalar()
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
        geocache_db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
        data, errors = GeocacheSingleSchema().dump({
            'geocache': geocache_db.session.query(Cache).get(id)
            })
        if errors:
            errors['msg'] = 'Internal error, could not dump geocache data.'
            return errors, 422
        return data

api.add_resource(GeocacheApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>')

class GpxImportApi(Resource):

    def post(self, db_name):
        if db_name is None:
            return {'msg': 'Database name missing.'}, 400 # bad request
        file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
        if not os.path.isfile(file_path):
            return {'msg': 'Database is not existing.'}, 422 # unprocessable entity
        geocache_db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
        parse = reqparse.RequestParser()
        parse.add_argument('gpx_file', type=werkzeug.datastructures.FileStorage, location='files')
        args = parse.parse_args()
        # filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'jens')
        gpx_file = args['gpx_file']
        if gpx_file is None:
            return {'msg': 'GPX file name missing.'}, 400 # bad request
        import_gpx(gpx_file)
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
        print("DB01: ", obj)
        response = make_response(export_gpx(obj))
        response.headers['Content-Type'] = 'application/gpx'
        response.headers['Content-Disposition'] = ('attachment; filename=' + obj['file_name'])
        return response 


api.add_resource(GpxExportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_export')

