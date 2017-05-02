import os.path, json
import werkzeug
from flask import jsonify
from flask_restful import Resource, reqparse, request
from app import app, api, db
from marshmallow import Schema, fields
from app.models import Cache
from sqlalchemy import func
from app.gpx import import_gpx

class DbList(Schema):
    dbs = fields.List(fields.String())


class DbListApi(Resource):

    def get(self):
        list = next(os.walk(app.config['SQLALCHEMY_DATABASE_DIR']))[2]
        data, errors = DbList().dump({'dbs': sorted(list)})
        if errors:
            return jsonify(errors), 422
        return data

    def post(self):
        parse = reqparse.RequestParser()
        parse.add_argument('db', type=str, location='json')
        args = parse.parse_args()
        db_name = args['db']
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if not os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                db.create_all()
                return jsonify({'db': db_name})

api.add_resource(DbListApi, '/andyBee/api/v1.0/db')

class Attribute(Schema):
    name    = fields.String()
    inc     = fields.Boolean()

class Log(Schema):
    date    = fields.String()
    type    = fields.String()
    finder  = fields.String()
    text    = fields.String()
    text_encoded = fields.String()
    lat     = fields.Float()
    lon     = fields.Float()
    
class Waypoint(Schema):
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

class GeocacheBasic(Schema):
    id         = fields.Integer()
    available  = fields.Boolean()
    archived   = fields.Boolean()
    title      = fields.String(attribute="name") 
    placed_by  = fields.String()
    owner      = fields.String()
    type       = fields.String()
    container  = fields.String()
    difficulty = fields.Float()
    terrain    = fields.Float()
    gc_id      = fields.Function(lambda cache: cache.waypoint.name)
    lat        = fields.Function(lambda cache: cache.waypoint.lat)
    lon        = fields.Function(lambda cache: cache.waypoint.lon)


class GeocacheFull(GeocacheBasic):
    attributes = fields.List(fields.Nested(Attribute))
    country    = fields.String()
    state      = fields.String()
    short_desc = fields.String()
    short_html = fields.String()
    long_desc  = fields.String()
    long_html  = fields.String()
    encoded_hints = fields.String()
    logs       = fields.List(fields.Nested(Log))
    waypoints  = fields.List(fields.Nested(Waypoint))

class GeocacheList(Schema):
    geocaches  = fields.List(fields.Nested(GeocacheBasic))
    db_name    = fields.String()
    nbr_caches = fields.Integer()


class GeocacheListApi(Resource):

    def get(self, db_name):
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                data, errors = GeocacheList().dump({
                    'geocaches': db.session.query(Cache),
                    'db_name': db_name,
                    'nbr_caches': db.session.query(func.count(Cache.id)).scalar()
                    })
                if errors:
                    return jsonify(errors), 422
                return data

api.add_resource(GeocacheListApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches')

class GeocacheSingle(Schema):
    geocache   = fields.Nested(GeocacheFull)

class GeocacheApi(Resource):
    def get(self, db_name, id):
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                data, errors = GeocacheSingle().dump({
                    'geocache': db.session.query(Cache).get(id)
                    })
                if errors:
                    return jsonify(errors), 422
                return data

api.add_resource(GeocacheApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches/<int:id>')

class GpxImportApi(Resource):

    def post(self, db_name):
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                parse = reqparse.RequestParser()
                parse.add_argument('gpx_file', type=werkzeug.datastructures.FileStorage, location='files')
                args = parse.parse_args()
                # filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'jens')
                gpx_file = args['gpx_file']
                import_gpx(gpx_file)
                return {} 

api.add_resource(GpxImportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_import')


