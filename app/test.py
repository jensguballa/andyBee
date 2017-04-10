from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base

Session = sessionmaker(autocommit=False,
                                         autoflush=False)
engine = create_engine('sqlite:////tmp/test.db', convert_unicode=True)
engine2 = create_engine('sqlite:////tmp/test.db2', convert_unicode=True)
db_session = scoped_session(Session(bind=engine))
db_session2 = scoped_session(Session(bind=engine2))

Base = declarative_base()
Base.query = db_session.query_property()

def init_db():
    # import all modules here that might define models so that
    # they will be registered properly on the metadata.  Otherwise
    # you will have to import them first before calling init_db()
    Base.metadata.create_all(bind=engine)

from sqlalchemy import Column, Integer, String
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    email = Column(String(120), unique=True)

    def __init__(self, name=None, email=None):
        self.name = name
        self.email = email

    def __repr__(self):
        return '<User %r>' % (self.name)

class User2(Base):
    __tablename__ = 'users2'
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True)
    email = Column(String(120), unique=True)

    def __init__(self, name=None, email=None):
        self.name = name
        self.email = email

    def __repr__(self):
        return '<User2 %r>' % (self.name)

u = User('admin', 'admin@localhost')
u2 = User('jens', 'jens@localhost')
