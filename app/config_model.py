from db import SqlTable

class Preferences(SqlTable):
    _table_name = 'preferences'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS preferences (
	id INTEGER NOT NULL, 
	owner TEXT, 
	default_db TEXT, 
	used_db TEXT, 
	auto_load INTEGER, 
	PRIMARY KEY (id), 
	UNIQUE (owner)
    )
    """

class Filter(SqlTable):
    _table_name = 'filter'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS filter (
        id INTEGER NOT NULL, 
        sequence INTEGER, 
        name TEXT, 
        PRIMARY KEY (id), 
        UNIQUE (sequence), 
        UNIQUE (name)
    )
    """

class FilterAtom(SqlTable):
    _table_name = 'filter_atom'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS filter_atom (
	id INTEGER NOT NULL, 
	filter_id INTEGER, 
	name TEXT, 
	op TEXT, 
	value TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(filter_id) REFERENCES filter (id)
    )
    """

config_tables = (
        Preferences,
        Filter,
        FilterAtom)

#from sqlalchemy import Table, Column, Integer, Float, Text, Boolean, ForeignKey
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy.orm import relationship
#
#ConfigDb = declarative_base()
#
#class Preferences(ConfigDb):
#    __tablename__ = 'preferences'
#    id         = Column(Integer, primary_key=True)                  
#    owner      = Column(Text, unique=True)
#    default_db = Column(Text)
#    used_db    = Column(Text)
#    auto_load  = Column(Integer, default=0)
#    # 0: don't load any DB at startup
#    # 1: load default_db at startup
#    # 2: load last used_db at startup
#
#    def __repr__(self):
#        return "<Preferences id='%d' owner='%s'>" % (self.id, self.owner)
#
#class Filter(ConfigDb):
#    __tablename__ = 'filter'
#    id         = Column(Integer, primary_key=True)          
#    sequence   = Column(Integer, unique=True)
#    name       = Column(Text, unique=True)
#    filter_atom = relationship('FilterAtom')
#
#    def __repr__(self):
#        return "<Filter id='%d' name='%s'>" % (self.id, self.name)
#
#class FilterAtom(ConfigDb):
#    __tablename__ = 'filter_atom'
#    id         = Column(Integer, primary_key=True)          
#    filter_id  = Column(Integer, ForeignKey('filter.id'))
#    name       = Column(Text)
#    op         = Column(Text)
#    value      = Column(Text) 
#
#    def __repr__(self):
#        return "<FilterAtom id='%d' filter_id='%d' name='%s'>" % (self.id, self.filter_id, self.name)


