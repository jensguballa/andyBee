import os

from flask import Flask
app = Flask(__name__)
app.config.from_object('config')
app.config['UPLOAD_FOLDER'] = "uploads/"

from flask_restful import Api
api = Api(app)


#from flask_sqlalchemy import SQLAlchemy
from app.models import DbBase 
from app.db import Db
db = Db(DbBase)

#pref = None
#from app.preferences import Preferences
#pref = Preferences(app) 

from flask_bootstrap import Bootstrap
Bootstrap(app)

from flask_triangle import Triangle
Triangle(app)
from app import preferences
from app import views, models

