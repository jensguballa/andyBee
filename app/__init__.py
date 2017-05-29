#import os

from flask import Flask
app = Flask(__name__)
app.config.from_object('config')
app.config['UPLOAD_FOLDER'] = "uploads/"

from flask_restful import Api
api = Api(app)


from app.geocache_model_sql import geocache_tables 
from app.db import Db
geocache_db = Db(tables=geocache_tables, app=app, log=app.config['SQL_ECHO'])

#from app.config_model import config_tables
#from app.config_api import ConfigDb 
#config_db = ConfigDb(tables=config_tables, app=app)


from flask_bootstrap import Bootstrap
Bootstrap(app)

from flask_triangle import Triangle
Triangle(app)
from app import config_api, geocache_api
from app import views

