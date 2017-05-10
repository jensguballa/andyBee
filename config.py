import os
basedir = os.path.abspath(os.path.dirname(__file__))

SQLALCHEMY_DATABASE_DIR = os.path.join(basedir, 'databases/')
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'andb.db')
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, 'db_repository')

SQLALCHEMY_TRACK_MODIFICATIONS = True
SQLALCHEMY_ECHO = True

CONFIG_DB = os.path.join(basedir, 'databases/config/config.db')
CONFIG_URI_PREFIX = 'sqlite:///'

CACHE_DB_DIR = os.path.join(basedir, 'databases/')
CACHE_URI_PREFIX = 'sqlite:///'


