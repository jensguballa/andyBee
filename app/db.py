from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

class Db():
    def __init__(self, base, uri=None, app=None):
        self.session = None
        self.base = base
        self._uri = uri
        self.engine = None
        self.echo = False
        self._cache = {}
        if app:
            self.echo = app.config['SQLALCHEMY_ECHO']

        if uri is not None:
            self.set_uri(uri)

    def set_uri(self, uri):
        # Hm, what cleanup actions are needed for an active uri?
        if self.session:
            self.session.commit()
        self._uri = uri
        self._cache = {}
        self.engine = create_engine(uri, echo=self.echo)
        self.session = scoped_session(sessionmaker(autocommit=False,
            autoflush=False,
            bind=self.engine))

    def get_uri(self):
        return self._uri

    def create_all(self):
        self.base.metadata.create_all(bind=self.engine)

    def get_or_create(self, model, **kwargs):
        instance = self.session.query(model).filter_by(**kwargs).first()
        if instance:
            return instance
        else:
            instance = model(**kwargs)
            self.session.add(instance)
            self.session.commit()
            return instance

    def get_or_create_new(self, cls, lookup, **kwargs):
        table = cls.__name__
        if table not in self._cache:
            self._cache[table] = {}
            for instance in self.session.query(cls).all():
                self._cache[table][getattr(instance, lookup)] = instance
        val = kwargs[lookup]
        if val in self._cache[table]:
            return self._cache[table][val]
        instance = cls(**kwargs)
        self._cache[table][val] = instance
        self.session.add(instance)
        return instance

