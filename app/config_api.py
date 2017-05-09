import os.path
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Table, Column, Integer, String, Float, Text, Boolean, ForeignKey
from app.db import Db
from app import api, app
from flask_restful import abort, Resource
from marshmallow import Schema, fields
from config_model import ConfigDb, Preferences, Filter, FilterAtom

from flask import request, jsonify

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
        return {'msg': 'No input data provided'}, 400 # bad request
    data, errors = schema.load(json_data)
    if errors:
        errors['msg'] = "An error occured when parsing the request."
        return errors, 422 # unprocessable entity
    if (not data) and data_mandatory:
        return {'msg': 'No input data provided'}, 400 # bad request
    return data, 200

class PrefSchema(Schema):
    id = fields.Integer(required=True)
    owner = fields.String()
    default_db = fields.String()
    auto_load = fields.Integer()
    used_db = fields.String()

class PrefCompleteSchema(Schema):
    preference = fields.Nested(PrefSchema, required=True)

class PrefApi(Resource):

    def get(self, id):
        return PrefCompleteSchema().dump({'preference': config_db.session.query(Preferences).get(id)})

    def put(self, id):
        obj, status_code = json_to_object(PrefCompleteSchema())
        if status_code != 200:
            return obj, status_code
        config_db.session.query(Preferences).filter_by(id=id).update(obj['preference'])
        config_db.session.commit()
        return {}

api.add_resource(PrefApi, '/andyBee/api/v1.0/config/<int:id>/preference')


class FilterAtomSchema(Schema):
    name = fields.String(required=True)
    op = fields.String()
    value = fields.String()

class FilterSchema(Schema):
    id = fields.Integer()
    sequence = fields.Integer(required=True)
    name = fields.String(required=True)
    filter_atom = fields.List(fields.Nested(FilterAtomSchema))

class FilterCompleteSchema(Schema):
    filter = fields.List(fields.Nested(FilterSchema), required=True)

class FilterListApi(Resource):

    def get(self, id):
        list = config_db.session.query(Filter).all()
        if list is None:
            list = []
        ret = FilterCompleteSchema().dump({'filter': list})
        return ret

    def post(self, id):
        obj, status_code = json_to_object(FilterSchema())
        if status_code != 200:
            return obj, status_code
        new_filter = Filter()
        new_filter.name = obj['name']
        new_filter.sequence = obj['sequence']
        new_filter.filter_atom = []
        for filter_atom in obj['filter_atom']:
            atom = FilterAtom()
            atom.name = filter_atom['name']
            atom.op = filter_atom['op']
            atom.value = filter_atom['value']
            new_filter.filter_atom.append(atom)

        config_db.session.add(new_filter)
        config_db.session.commit()
        return {'id': new_filter.id}

api.add_resource(FilterListApi, '/andyBee/api/v1.0/config/<int:id>/filter')

class FilterApi(Resource):

    def delete(self, id, filter_id):
        config_db.session.query(Filter).filter(Filter.id == filter_id).delete()
        config_db.session.commit()
        return {}

api.add_resource(FilterApi, '/andyBee/api/v1.0/config/<int:id>/filter/<int:filter_id>')


def init():
    uri = app.config['CONFIG_URI_PREFIX'] + app.config['CONFIG_DB']
    db = Db(ConfigDb, uri)
    db.create_all()
    if db.session.query(Preferences).get(1) is None:
        db.session.add(Prefernces(id=1))
        db.session.commit()
    return db

config_db = init()

