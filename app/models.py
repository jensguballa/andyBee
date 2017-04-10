from sqlalchemy import Table, Column, Integer, String, Float, Text, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

DbBase = declarative_base()


class Waypoint(DbBase):
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
    sym      = relationship('WaypointSym')
    type_id  = Column(Text, ForeignKey('waypoint_type.id'))
    type     = relationship('WaypointType')
    cmt      = Column(Text)
    cache_id = Column(Integer, ForeignKey('cache.id'))
    cache    = relationship('Cache', back_populates='waypoint', uselist=False)

    def __repr__(self):
        return "<Waypoint id='%d' lat='%r' lon='%r' cache_id='%d'>" % (self.id,
                self.lat, self.lon, self.cache_id)

class WaypointSym(DbBase):
    __tablename__ = 'waypoint_sym'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<WaypointType id='%d' name='%s'>" % (self.id, self.name)

class WaypointType(DbBase):
    __tablename__ = 'waypoint_type'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<WaypointType id='%d' name='%s'>" % (self.id, self.name)



class Cache(DbBase):
    __tablename__ = 'cache'
    id            = Column(Integer, primary_key=True)                  
    available     = Column(Boolean, default=1)                         
    archived      = Column(Boolean, default=0)                         
    name          = Column(Text)                                       
    placed_by     = Column(Text)                                       
    owner_id      = Column(Integer, ForeignKey('cacher.id'))        
    owner         = relationship('Cacher')                                
    type_id       = Column(Integer, ForeignKey('cache_type.id'))          
    type          = relationship('CacheType')                                  
    container_id  = Column(Integer, ForeignKey('cache_container.id'))     
    container     = relationship('CacheContainer')                             
    attributes    = relationship('Attribute', secondary='cache_to_attribute') 
    difficulty    = Column(Float)                                      
    terrain       = Column(Float)                                      
    country_id    = Column(Integer, ForeignKey('cache_country.id'))       
    country       = relationship('CacheCountry')                               
    state_id      = Column(Integer, ForeignKey('cache_state.id'))         
    state         = relationship('CacheState')                                 
    short_desc    = Column(Text)                                       
    short_html    = Column(Boolean)                                    
    long_desc     = Column(Text)                                       
    long_html     = Column(Boolean)                                    
    encoded_hints = Column(Text)                                       
    logs          = relationship('Log')
    waypoint      = relationship('Waypoint', back_populates='cache', uselist=False)

    def __repr__(self):
        return "<Cache id='%d' name='%s' av='%s' ar='%s'>" % (self.id, self.name,
                "True" if self.available else "False",
                "True" if self.archived else "False")


class Cacher(DbBase):
    __tablename__ = 'cacher'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<Cacher id='%d' name='%s'>" % (self.id, self.name)
    
class CacheType(DbBase):
    __tablename__ = 'cache_type'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheType id='%d' name='%s'>" % (self.id, self.name)

class CacheContainer(DbBase):
    __tablename__ = 'cache_container'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheContainer id='%d' name='%s'>" % (self.id, self.name)

class CacheCountry(DbBase):
    __tablename__ = 'cache_country'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheCountry id='%d' name='%s'>" % (self.id, self.name)

class CacheState(DbBase):
    __tablename__ = 'cache_state'
    id   = Column(Integer, primary_key=True)
    name = Column(Text, unique=True)

    def __repr__(self):
        return "<CacheState id='%d' name='%s'>" % (self.id, self.name)


association_table = Table('cache_to_attribute', DbBase.metadata,
    Column('cache_id', Integer, ForeignKey('cache.id')),
    Column('attribute_id', Integer, ForeignKey('attribute.id'))
)

class Attribute(DbBase):
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

class Log(DbBase):
    __tablename__ = 'log'
    id           = Column(Integer, primary_key=True)
    cache_id     = Column(Integer, ForeignKey('cache.id'))
    date         = Column(Text)
    type_id      = Column(Integer, ForeignKey('log_type.id'))
    type         = relationship('LogType')
    finder_id    = Column(Integer, ForeignKey('cacher.id'))
    finder       = relationship('Cacher')
    text         = Column(Text)
    text_encoded = Column(Boolean)
    lat          = Column(Float)
    lon          = Column(Float)

    def __repr__(self):
        return "<Log id='%d'>" % (self.id, )


class LogType(DbBase):
    __tablename__ = 'log_type'
    id       = Column(Integer, primary_key=True)
    name     = Column(Text, unique=True)

    def __repr__(self):
        return "<LogType id='%d' name='%s'>" % (self.id, self.name)

