import os.path
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy import Table, Column, Integer, String, Float, Text, Boolean, ForeignKey
from app.db import Db
from app.config_model import config_tables
from app import api, app
from flask_restful import abort, Resource
from marshmallow import Schema, fields
from config_model import Preferences, Filter, FilterAtom

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
        config_db.init()
        return PrefCompleteSchema().dump({'preference': config_db.get_by_id(Preferences, id)})

    def put(self, id):
        config_db.init()
        obj, status_code = json_to_object(PrefCompleteSchema())
        if status_code != 200:
            return obj, status_code
        config_db.update(Preferences, id, obj['preference'])
        config_db.commit()
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


class FilterListSchema(Schema):
    filter = fields.List(fields.Nested(FilterSchema), required=True)

class FilterSingleSchema(Schema):
    filter = fields.Nested(FilterSchema, required=True)

class FilterListApi(Resource):

    def get(self, id):
        config_db.init()
        filters = [dict(row) for row in config_db.execute('SELECT * from filter')]
        for filt in filters:
            filt['filter_atom'] = [dict(atom) for atom in config_db.execute('SELECT * from filter_atom WHERE filter_id=?', (filt['id'],))]
        return FilterListSchema().dump({'filter': filters})



    def post(self, id):
        config_db.init()
        obj, status_code = json_to_object(FilterSchema())
        if status_code != 200:
            return obj, status_code

        config_db.execute('INSERT INTO filter (sequence, name) VALUES (?,?)', 
                (obj['sequence'], obj['name']))
        new_filter_id = config_db.cursor.lastrowid
        for filter_atom in obj['filter_atom']:
            config_db.execute('INSERT INTO filter_atom (filter_id, name, op, value) VALUES (?,?,?,?)',
                    (new_filter_id, filter_atom['name'], filter_atom['op'], filter_atom['value']))
        config_db.commit()
        return {'id': new_filter_id}

api.add_resource(FilterListApi, '/andyBee/api/v1.0/config/<int:id>/filter')

class FilterApi(Resource):

    def delete(self, id, filter_id):
        config_db.init()
        config_db.session.query(Filter).filter(Filter.id == filter_id).delete()
        config_db.session.query(FilterAtom).filter(FilterAtom.filter_id == filter_id).delete()
        config_db.session.commit()
        return {}

    def put(self, id, filter_id):
        config_db.init()
        obj, status_code = json_to_object(FilterSingleSchema())
        if status_code != 200:
            return obj, status_code
        req = obj['filter']
        config_db.execute('UPDATE filter SET sequence = ?, name = ? WHERE (id = ?)',
                (req['sequence'], req['name'], filter_id))
        config_db.execute('DELETE FROM filter_atom WHERE filter_id = ?', (filter_id,))
        for atom in req['filter_atom']:
            config_db.execute('INSERT INTO filter_atom (filter_id, name, op, value) VALUES (?,?,?,?)',
                    (filter_id, atom['name'], atom['op'], atom['value']))
        config_db.connection.commit()
        return {}

api.add_resource(FilterApi, '/andyBee/api/v1.0/config/<int:id>/filter/<int:filter_id>')

    
class ConfigDb(Db):

    def init(self):
        db = app.config['CONFIG_DB']
        if not os.path.isfile(db):
            self.set_db(db)
            self.create_all()
            config_db.execute("INSERT INTO preferences (id) VALUES (1)")
            config_db.connection.commit()
        else:
            self.set_db(db)
        
config_db = ConfigDb(tables=config_tables, app=app, log=app.config['SQL_ECHO'])
        
