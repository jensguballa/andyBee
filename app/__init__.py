import os
from config import basedir
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bootstrap import Bootstrap
from flask_triangle import Triangle

app = Flask(__name__)
app.config.from_object('config')
app.config['UPLOAD_FOLDER'] = "uploads/"
db = SQLAlchemy(app)
Bootstrap(app)
Triangle(app)
from app import views, models
