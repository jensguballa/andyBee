import os.path, json
import werkzeug
from flask import jsonify
from flask_restful import Resource, reqparse
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

api.add_resource(DbListApi, '/andyBee/api/v1.0/db')


class Geocache(Schema):
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

class GeocacheList(Schema):
    geocaches  = fields.List(fields.Nested(Geocache))
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



class GpxImportApi(Resource):

    def post(self, db_name):
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                parse = reqparse.RequestParser()
                parse.add_argument('gpx_file', type=werkzeug.datastructures.FileStorage, location='files')
                args = parse.parse_args()
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'jens')
                gpx_file = args['gpx_file']
                import_gpx(gpx_file)
                return {} 

api.add_resource(GpxImportApi, '/andyBee/api/v1.0/db/<string:db_name>/gpx_import')


