from sqlalchemy import Table, Column, Integer, Float, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

GeocacheDb = declarative_base()

class Waypoint(GeocacheDb):
    __tablename__ = 'waypoint'
    id       = Column(Integer, primary_key=True)                  
    lat      = Column(Float)
    lon      = Column(Float)
    time     = Column(Text)
    name     = Column(Text)
    gc_code  = Column(Text)
    desc     = Column(Text)
    url      = Column(Text)
    urlname  = Column(Text)
    sym_id   = Column(Text, ForeignKey('waypoint_sym.id'))
    sym      = relationship('WaypointSym', lazy='joined')
    type_id  = Column(Text, ForeignKey('waypoint_type.id'))
    type     = relationship('WaypointType', lazy='joined')
    cmt      = Column(Text)
    cache_id = Column(Integer, ForeignKey('cache.id'))
    cache    = relationship('Cache', back_populates='waypoint', uselist=False, lazy='joined')

    def __repr__(self):
        return "<Waypoint id='%d' lat='%r' lon='%r' cache_id='%d'>" % (self.id,
                self.lat, self.lon, self.cache_id)

class WaypointSym(GeocacheDb):
    __tablename__ = 'waypoint_sym'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<WaypointSym id='%d' name='%s'>" % (self.id, self.name)

class WaypointType(GeocacheDb):
    __tablename__ = 'waypoint_type'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<WaypointType id='%d' name='%s'>" % (self.id, self.name)



class Cache(GeocacheDb):
    __tablename__ = 'cache'
    id            = Column(Integer, primary_key=True)                  
    available     = Column(Boolean, default=1)                         
    archived      = Column(Boolean, default=0)                         
    name          = Column(Text)                                       
    placed_by     = Column(Text)                                       
    owner_id      = Column(Integer, ForeignKey('cacher.id'))        
    owner         = relationship('Cacher', lazy='joined')                                
    type_id       = Column(Integer, ForeignKey('cache_type.id'))          
    type          = relationship('CacheType', lazy='joined')                                  
    container_id  = Column(Integer, ForeignKey('cache_container.id'))     
    container     = relationship('CacheContainer', lazy='joined')                             
    attributes    = relationship('Attribute', secondary='cache_to_attribute', lazy='joined') 
    difficulty    = Column(Float)                                      
    terrain       = Column(Float)                                      
    country_id    = Column(Integer, ForeignKey('cache_country.id'))       
    country       = relationship('CacheCountry', lazy='joined')                               
    state_id      = Column(Integer, ForeignKey('cache_state.id'))         
    state         = relationship('CacheState', lazy='joined')                                 
    short_desc    = Column(Text)                                       
    short_html    = Column(Boolean)                                    
    long_desc     = Column(Text)                                       
    long_html     = Column(Boolean)                                    
    encoded_hints = Column(Text)                                       
    logs          = relationship('Log', lazy='joined')
    waypoint      = relationship('Waypoint', back_populates='cache', uselist=False, lazy='joined')

    def __repr__(self):
        return "<Cache id='%d' name='%s' av='%s' ar='%s'>" % (self.id, self.name,
                "True" if self.available else "False",
                "True" if self.archived else "False")


class Cacher(GeocacheDb):
    __tablename__ = 'cacher'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<Cacher id='%d' name='%s'>" % (self.id, self.name)
    
class CacheType(GeocacheDb):
    __tablename__ = 'cache_type'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheType id='%d' name='%s'>" % (self.id, self.name)

class CacheContainer(GeocacheDb):
    __tablename__ = 'cache_container'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheContainer id='%d' name='%s'>" % (self.id, self.name)

class CacheCountry(GeocacheDb):
    __tablename__ = 'cache_country'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheCountry id='%d' name='%s'>" % (self.id, self.name)

class CacheState(GeocacheDb):
    __tablename__ = 'cache_state'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheState id='%d' name='%s'>" % (self.id, self.name)


association_table = Table('cache_to_attribute', GeocacheDb.metadata,
    Column('cache_id', Integer, ForeignKey('cache.id')),
    Column('attribute_id', Integer, ForeignKey('attribute.id'))
)

class Attribute(GeocacheDb):
    __tablename__ = 'attribute'
    id    = Column(Integer, primary_key=True)
    gc_id = Column(Integer)
    inc   = Column(Boolean)
    name  = Column(Text)

    def __repr__(self):
        return "<Attribute id='%d' gc_id='%d' inc='%s' name='%s'>" % (self.id,
                self.gc_id,
                "True" if self.inc else "False",
                self.name)

class Log(GeocacheDb):
    __tablename__ = 'log'
    id           = Column(Integer, primary_key=True)
    cache_id     = Column(Integer, ForeignKey('cache.id'))
    date         = Column(Text)
    type_id      = Column(Integer, ForeignKey('log_type.id'))
    type         = relationship('LogType', lazy='joined')
    finder_id    = Column(Integer, ForeignKey('cacher.id'))
    finder       = relationship('Cacher', lazy='joined')
    text         = Column(Text)
    text_encoded = Column(Boolean)
    lat          = Column(Float)
    lon          = Column(Float)

    def __repr__(self):
        return "<Log id='%d'>" % (self.id, )


class LogType(GeocacheDb):
    __tablename__ = 'log_type'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<LogType id='%d' name='%s'>" % (self.id, self.name)

