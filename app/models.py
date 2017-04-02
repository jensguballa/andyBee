from app import db

def get_or_create(db, model, **kwargs):
    instance = db.session.query(model).filter_by(**kwargs).first()
    if instance:
        return instance
    else:
        instance = model(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance

class Waypoint(db.Model):
    id       = db.Column(db.Integer, primary_key=True)                  
    lat      = db.Column(db.Float)
    lon      = db.Column(db.Float)
    time     = db.Column(db.Text)
    name     = db.Column(db.Text)
    gc_code  = db.Column(db.Text)
    desc     = db.Column(db.Text)
    url      = db.Column(db.Text)
    urlname  = db.Column(db.Text)
    sym_id   = db.Column(db.Text, db.ForeignKey('waypoint_sym.id'))
    sym      = db.relationship('WaypointSym')
    type_id  = db.Column(db.Text, db.ForeignKey('waypoint_type.id'))
    type     = db.relationship('WaypointType')
    cmt      = db.Column(db.Text)
    cache_id = db.Column(db.Integer, db.ForeignKey('cache.id'))
    cache    = db.relationship('Cache', back_populates='waypoint', uselist=False)

    def __repr__(self):
        return "<Waypoint id='%d' lat='%r' lon='%r' cache_id='%d'>" % (self.id,
                self.lat, self.lon, self.cache_id)

class WaypointSym(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<WaypointType id='%d' name='%s'>" % (self.id, self.name)

class WaypointType(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<WaypointType id='%d' name='%s'>" % (self.id, self.name)



class Cache(db.Model):
    id            = db.Column(db.Integer, primary_key=True)                  
    available     = db.Column(db.Boolean, default=1)                         
    archived      = db.Column(db.Boolean, default=0)                         
    name          = db.Column(db.Text)                                       
    placed_by     = db.Column(db.Text)                                       
    owner_id      = db.Column(db.Integer, db.ForeignKey('cacher.id'))        
    owner         = db.relationship('Cacher')                                
    type_id       = db.Column(db.Integer, db.ForeignKey('cache_type.id'))          
    type          = db.relationship('CacheType')                                  
    container_id  = db.Column(db.Integer, db.ForeignKey('cache_container.id'))     
    container     = db.relationship('CacheContainer')                             
    attributes    = db.relationship('Attribute', secondary='cache_to_attribute') 
    difficulty    = db.Column(db.Float)                                      
    terrain       = db.Column(db.Float)                                      
    country_id    = db.Column(db.Integer, db.ForeignKey('cache_country.id'))       
    country       = db.relationship('CacheCountry')                               
    state_id      = db.Column(db.Integer, db.ForeignKey('cache_state.id'))         
    state         = db.relationship('CacheState')                                 
    short_desc    = db.Column(db.Text)                                       
    short_html    = db.Column(db.Boolean)                                    
    long_desc     = db.Column(db.Text)                                       
    long_html     = db.Column(db.Boolean)                                    
    encoded_hints = db.Column(db.Text)                                       
    logs          = db.relationship('Log')
    waypoint      = db.relationship('Waypoint', back_populates='cache', uselist=False)

    def __repr__(self):
        return "<Cache id='%d' name='%s' av='%s' ar='%s'>" % (self.id, self.name,
                "True" if self.available else "False",
                "True" if self.archived else "False")


class Cacher(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<Cacher id='%d' name='%s'>" % (self.id, self.name)
    
class CacheType(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<CacheType id='%d' name='%s'>" % (self.id, self.name)

class CacheContainer(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<CacheContainer id='%d' name='%s'>" % (self.id, self.name)

class CacheCountry(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<CacheCountry id='%d' name='%s'>" % (self.id, self.name)

class CacheState(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<CacheState id='%d' name='%s'>" % (self.id, self.name)


association_table = db.Table('cache_to_attribute',
    db.Column('cache_id', db.Integer, db.ForeignKey('cache.id')),
    db.Column('attribute_id', db.Integer, db.ForeignKey('attribute.id'))
)

class Attribute(db.Model):
    id    = db.Column(db.Integer, primary_key=True)
    gc_id = db.Column(db.Integer)
    inc   = db.Column(db.Boolean)
    name  = db.Column(db.Text)

    def __repr__(self):
        return "<Attribute id='%d' gc_id='%d' inc='%s' name='%s'>" % (self.id,
                self.gc_id,
                "True" if self.inc else "False",
                self.name)

class Log(db.Model):
    id           = db.Column(db.Integer, primary_key=True)
    cache_id     = db.Column(db.Integer, db.ForeignKey('cache.id'))
    date         = db.Column(db.Text)
    type_id      = db.Column(db.Integer, db.ForeignKey('log_type.id'))
    type         = db.relationship('LogType')
    finder_id    = db.Column(db.Integer, db.ForeignKey('cacher.id'))
    finder       = db.relationship('Cacher')
    text         = db.Column(db.Text)
    text_encoded = db.Column(db.Boolean)
    lat          = db.Column(db.Float)
    lon          = db.Column(db.Float)

    def __repr__(self):
        return "<Log id='%d'>" % (self.id, )


class LogType(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    name     = db.Column(db.Text, unique=True)

    def __repr__(self):
        return "<LogType id='%d' name='%s'>" % (self.id, self.name)

