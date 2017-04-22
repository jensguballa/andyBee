import os.path, json
from flask import jsonify
from flask_restful import Resource
from app import app, api, db
from marshmallow import Schema, fields
from app.models import Cache

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
    geocaches = fields.List(fields.Nested(Geocache))


class GeocacheListApi(Resource):

    def get(self, db_name):
        if db_name is not None:
            file_path = os.path.join(app.config['CACHE_DB_DIR'], db_name)
            if os.path.isfile(file_path):
                db.set_uri(app.config['CACHE_URI_PREFIX'] + file_path)
                data, errors = GeocacheList().dump({'geocaches': db.session.query(Cache)})
                if errors:
                    return jsonify(errors), 422
                return data

api.add_resource(GeocacheListApi, '/andyBee/api/v1.0/db/<string:db_name>/geocaches')

