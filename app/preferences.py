import os.path
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, Integer, String, Float, Text, Boolean, ForeignKey
from app.db import Db
from app import api, app
from flask_restful import abort, Resource
from marshmallow import Schema, fields

from flask import request, jsonify

_PrefBase = declarative_base()

def json_to_object(schema, data_mandatory=True):
    """
    Helper function, which gets the json part from a request
    and checks it against the given schema.
    Returns a python object and a response code.
    response code 200 means "OK, no errors, json successfully
    parsed". Any other return code indicates an error.
    """
    json_data = request.get_json()
    if not json_data:
        return {'message': 'No input data provided'}, 400
    data, errors = schema.load(json_data)
    if errors:
        return errors, 422
    if (not data) and data_mandatory:
        return {'message': 'No input data provided'}, 400
    return data, 200

class _PrefDB(_PrefBase):
    __tablename__ = 'preferences'
    id         = Column(Integer, primary_key=True)                  
    owner      = Column(Text, unique=True)
    default_db = Column(Text)
    used_db    = Column(Text)
    auto_load  = Column(Integer, default=0)
    # 0: don't load any DB at startup
    # 1: load default_db at startup
    # 2: load last used_db at startup

    def __repr__(self):
        return "<Preferences id='%d' owner='%s'>" % (self.id, self.owner)

class PrefSchema(Schema):
    id = fields.Integer()
    owner = fields.String()
    default_db = fields.String()
    auto_load = fields.Integer()

class PrefSingle(Schema):
    preference = fields.Nested(PrefSchema)


class Preferences():

    def __init__(self, app):
        self.app = app
        self._uri = app.config['CONFIG_URI_PREFIX'] + app.config['CONFIG_DB']
        self._db = Db(_PrefBase, self._uri)
        self._db.create_all()
        self._pref = self._db.session.query(_PrefDB).get(1)
        if self._pref is None:
            self._pref = _PrefDB(id=1)
            self._db.session.add(self._pref)
            self._db.session.commit()

    def set_used_db(self, db):
        self._db.session.query(_PrefDB).filter_by(id=1).update({'used_db': db})
        self._db.session.commit()

    def get_startup_db(self):
        db = None
        pref = self._db.session.query(_PrefDB).get(1)
        if pref.auto_load == 1:
            db = pref.default_db
        elif pref.auto_load == 2:
            db = pref.used_db
        if db is not None:
            if os.path.isfile(os.path.join(self.app.config['CACHE_DB_DIR'],db)) == None:
                db = None
        return db

    def update(self, id, data):
        self._db.session.query(_PrefDB).filter_by(id=id).update(data['preference'])
        self._db.session.commit()

    def get_as_json(self, id):
        return PrefSingle().dump({'preference': self._db.session.query(_PrefDB).get(id)})

class PrefApi(Resource):

    def get(self, id):
        return pref.get_as_json(id)

    def put(self, id):
        obj, status_code = json_to_object(PrefSingle())
        if status_code != 200:
            return obj, status_code
        pref.update(id, obj)

api.add_resource(PrefApi, '/andyBee/api/v1.0/config/<int:id>')
pref = Preferences(app)

