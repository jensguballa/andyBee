import os.path
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, Integer, String, Float, Text, Boolean, ForeignKey
from app.db import Db
from app import api, app
from flask_restful import abort, Resource
from marshmallow import Schema, fields

from flask import request, jsonify
from app.api import json_to_object

_PrefBase = declarative_base()

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
    id = fields.Integer(required=True)
    owner = fields.String()
    default_db = fields.String()
    auto_load = fields.Integer()
    used_db = fields.String()

class PrefSingle(Schema):
    preference = fields.Nested(PrefSchema, required=True)


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
        return {}
api.add_resource(PrefApi, '/andyBee/api/v1.0/config/<int:id>')
pref = Preferences(app)

