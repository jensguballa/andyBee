import os

from flask import Flask
app = Flask(__name__)
app.config.from_object('config')
app.config['UPLOAD_FOLDER'] = "uploads/"

from flask_restful import Api
api = Api(app)


from app.geocache_model import GeocacheDb 
from app.db import Db
geocache_db = Db(GeocacheDb)


from flask_bootstrap import Bootstrap
Bootstrap(app)

from flask_triangle import Triangle
Triangle(app)
from app import config_api, geocache_api
from app import views

