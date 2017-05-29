#from sqlalchemy import create_engine
#from sqlalchemy.orm import scoped_session, sessionmaker
import sqlite3
import datetime

def _str(obj):
    if type(obj) is str:
        return obj.encode('utf-8')
    elif type(obj) is unicode:
        return obj
    else:
        return str(obj)

class Db(object):

    def __init__(self, tables=None, db=None, app=None, log=False):
        self.log_sql = log
        self.tables = tables
        self.app = app
        self.db = None
        self.set_db(db)
        self._cache = {}
        self._lookup = {}

    def set_db(self, db):
        if db == self.db:
            return
        self.db = db
        self._cache = {}
        if db is not None:
            self.connection = sqlite3.connect(db, check_same_thread=False)
            self.connection.row_factory = sqlite3.Row
            self.cursor = self.connection.cursor()
#            rows = self.execute('SELECT name FROM sqlite_master WHERE type="table"').fetchall()
#            tables = [row[0] for row in rows]
#            commit_required = False
#            for table in self.tables:
#                if table._table_name not in tables:
#                    self.execute(table.create_table)
#                    commit_required = True
#            if commit_required:
#                self.connection.commit()

    def lookup_id(self, cls, **kwargs):
        if cls not in self._cache:
            self._cache[cls] = {}
            lookup_columns = kwargs.keys()
            self._lookup[cls] = lookup_columns
            for row in self.execute('SELECT * FROM ' + cls._table_name):
                lookup_key = '|'.join([_str(row[key]) for key in lookup_columns])
                self._cache[cls][lookup_key] = row
        lookup_key = '|'.join([_str(kwargs[key]) for key in self._lookup[cls]])
        if lookup_key in self._cache[cls]:
            return self._cache[cls][lookup_key]
        else:
            return None

    def insert(self, cls, col_dict):
        columns = ",".join([key for key in col_dict.keys()])
        vals = tuple([val for val in col_dict.values()])
        q = ",".join(['?' for a in xrange(len(vals))])
        self.execute('INSERT INTO ' + cls._table_name + ' ( ' + columns + ' ) VALUES (' + q + ')', vals)

    def unique_factory(self, cls, **kwargs):
        key = cls.get_key()
        id = self.lookup_id(cls, **kwargs)
        if id is None:
            self.insert(cls, kwargs)
            id = self.cursor.lastrowid
            lookup_key = '|'.join([_str(kwargs[k]) for k in self._lookup[cls]])
            self._cache[cls][lookup_key] = id
            return id
        else:
            return id


    def commit(self):
        if self.db is None:
            raise Exception("No Database opened.")
        if self.log_sql:
            print datetime.datetime.now(), "SQL: COMMIT"
        self.connection.commit()


    def create_all(self):
        for table in self.tables:
            self.execute(table.create_table())
        self.connection.commit()

    def get_by_id(self, cls, id):
        return self.execute(cls.get_by_id(), (id,)).fetchone()

    def execute(self, stmt, vals=None):
        if self.db is None:
            raise Exception("No Database opened.")
        if self.log_sql:
            print datetime.datetime.now(), "SQL:", stmt
            if vals is not None:
                print "    ", vals
        if vals is None:
            return self.cursor.execute(stmt)
        else:
            return self.cursor.execute(stmt, vals)

    def update(self, cls, key, vals):
        stmt, v =  cls.update(key, vals)
        self.execute(stmt, v)




#    def get_or_create(self, model, **kwargs):
#        instance = self.session.query(model).filter_by(**kwargs).first()
#        if instance:
#            return instance
#        else:
#            instance = model(**kwargs)
#            self.session.add(instance)
#            self.session.commit()
#            return instance
#
#    def get_or_create_new(self, cls, lookup, **kwargs):
#        table = cls.__name__
#        if table not in self._cache:
#            self._cache[table] = {}
#            for instance in self.session.query(cls).all():
#                self._cache[table][getattr(instance, lookup)] = instance
#        val = kwargs[lookup]
#        if val in self._cache[table]:
#            return self._cache[table][val]
#        instance = cls(**kwargs)
#        self._cache[table][val] = instance
#        self.session.add(instance)
#        return instance
#
#    def add(self, instance):
#        stmt, vals = instance.insert()
#        self.session.query(stmt, vals)
#        


class SqlTable():

    def set(self, **kwargs):
        for (k, v) in kwargs.iteritems():
            setattr(self, k, v)

    @classmethod
    def get_key(cls):
        return cls._key

    @classmethod
    def create_table(cls):
        return cls._create_stmt

    @classmethod
    def drop_table(cls):
        return 'DROP TABLE IF EXISTS ' + cls._table_name

    def insert(self):
        columns = ",".join([col for col in self.__dict__])
        vals = tuple([self.__dict__[col] for col in self.__dict__])
        q = ",".join(['?' for a in xrange(len(vals))])
        return ('INSERT INTO ' + self._table_name + ' ( ' + columns + ' ) VALUES (' + q + ')', vals)

    @classmethod
    def select(cls, columns=None, where=None, limit=None):
        col_str = '*'
        if columns is not None:
            col_str = ','.join(columns)
        where_str = ''
        if where is not None:
            where_str = ' WHERE ' + where
        limit_str = ''
        if limit is not None:
            limit_str = ' LIMIT ' + str(limit)
        return 'SELECT ' + col_str + ' FROM ' + cls._table_name + where_str + limit_str

    @classmethod
    def get_by_id(cls):
        return 'SELECT * FROM ' + cls._table_name + ' WHERE ' + cls._key + ' = ?'

    @classmethod
    def update(cls, values, key=None):
        ks = []
        vs = []
        for k, v in values.iteritems():
            if k != cls._key:
                ks.append(k + ' = ?')
                vs.append(v)
        if key is None:
            key = values[cls._key]
        vs.append(key)
        return ('UPDATE ' + cls._table_name + ' SET ' + ','.join(ks) + ' WHERE ' + cls._key + ' = ?', tuple(vs))


#    @classmethod
#    def register(cls, table_cls, table_name, create_stmt):
#        setattr(table_cls, '_table_name', table_name)
#        setattr(table_cls, '_create_stmt', create_stmt)
#        if hasattr(cls, 'table') == False:
#            setattr(cls, 'table', [])
#        cls.table.append(table_cls)


