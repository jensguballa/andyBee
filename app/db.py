from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

class Db():
    def __init__(self, base, uri=None):
        self.session = None
        self.base = base
        self._uri = uri
        self.engine = None

        if uri is not None:
            self.set_uri(uri)

    def set_uri(self, uri):
        # Hm, what cleanup actions are needed for an active uri?
        if self.session:
            self.session.commit()
        self._uri = uri
        self.engine = create_engine(uri, echo=True)
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



