#from sqlalchemy import create_engine
#from sqlalchemy.orm import scoped_session, sessionmaker
import sqlite3
import datetime
from pprint import pprint

def _str(obj):
    if type(obj) is str:
        return obj.encode('utf-8')
    elif type(obj) is unicode:
        return obj
    elif type(obj) is bool:
        return '1' if obj else '0'
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
        self._lookup = {}
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

    def get_singleton_id(self, cls, columns):
        cls_name = cls.__name__
        if cls_name not in self._cache:
            self._cache[cls_name] = {}
            lookup_columns = columns.keys()
            self._lookup[cls_name] = lookup_columns

            selected_columns = columns.keys()
            if cls._key not in selected_columns:
                selected_columns.append(cls._key)

            for row in self.execute('SELECT ' + ','.join(selected_columns) + ' FROM ' + cls._table_name):
                lookup_key = '|'.join([_str(row[key]) for key in lookup_columns])
                self._cache[cls_name][lookup_key] = row[cls.get_key()]
        lookup_key = '|'.join([_str(columns[key]) for key in self._lookup[cls_name]])
        if lookup_key in self._cache[cls_name]:
            return self._cache[cls_name][lookup_key]
        else:
            return None

    def insert(self, cls, col_dict):
        columns = ",".join([key for key in col_dict.keys()])
        vals = tuple([val for val in col_dict.values()])
        q = ",".join(['?' for a in xrange(len(vals))])
        self.execute('INSERT INTO ' + cls._table_name + ' ( ' + columns + ' ) VALUES (' + q + ')', vals)

    def create_singleton_id(self, cls, columns):
        cls_name = cls.__name__
        key = cls.get_key()
        id = self.get_singleton_id(cls, columns)
        if id is None:
            self.insert(cls, columns)
            id = self.cursor.lastrowid
            lookup_key = '|'.join([_str(columns[k]) for k in self._lookup[cls_name]])
            self._cache[cls_name][lookup_key] = id
            return id
        else:
            return id


    def commit(self):
        if self.db is None:
            raise Exception("No Database opened.")
        if self.log_sql:
            print datetime.datetime.now(), "SQL: COMMIT"
        self.connection.commit()
        self._cache = {}
        self._lookup = {}


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
        ks = []
        vs = []
        for k, v in vals.iteritems():
            if k != cls._key:
                ks.append(k + ' = ?')
                vs.append(v)
        if key is None:
            key = vals[cls._key]
        vs.append(key)
        self.execute('UPDATE ' + cls._table_name + ' SET ' + ','.join(ks) + ' WHERE ' + cls._key + ' = ?', tuple(vs))

    def debug(self):
        ''' 
        Scratch method for debug purposes
        '''
        print
        print("DB01: _cache")
        pprint(self._cache)
        print("DB02: _lookup")
        pprint(self._lookup)


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

    def __init__(self):
        self.db = {}

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



class DbInterface(object):

    def __init__(self, db, cls):
        self.db = db
        self.execute = db.execute
        self.cls = cls
        self.key = cls._key
        self.table_name = cls._table_name
        self._lookup_table = None
        self._reverse_lookup_table = None

    def insert(self, col_dict):
        columns = ",".join([key for key in col_dict.keys()])
        vals = tuple([val for val in col_dict.values()])
        q = ",".join(['?' for a in xrange(len(vals))])
        self.execute('INSERT INTO ' + self.table_name + ' ( ' + columns + ' ) VALUES (' + q + ')', vals)

    def delete(self, column_name, value):
        self.execute('DELETE FROM ' + self.table_name + ' WHERE ' + column_name + ' = ?', (value,))

    def update(self, key, vals):
        ks = []
        vs = []
        for k, v in vals.iteritems():
            if k != self.key:
                ks.append(k + ' = ?')
                vs.append(v)
        if key is None:
            key = vals[self.key]
        vs.append(key)
        self.execute('UPDATE ' + self.table_name + ' SET ' + ','.join(ks) + ' WHERE ' + self.key + ' = ?', tuple(vs))

    def get_value(self, id, column_name):
        if self._lookup_table is None:
            if self._reverse_lookup_table is not None:
                self._lookup_table = {v:k for k,v in self._reverse_lookup_table.iteritems()}
            else:
                self._lookup_table = {}
                for row in self.execute('SELECT ' + self.key + ',' + column_name + ' FROM ' + self.table_name):
                    self._lookup_table[row[self.key]] = row[column_name]
        if id in self._lookup_table:
            return self._lookup_table[id]
        else:
            return None

    def get_id(self, column_name, value):
        if self._reverse_lookup_table is None:
            if self._lookup_table is not None:
                self._reverse_lookup_table = {v:k for k,v in self._lookup_table.iteritems()}
            else:
                self._reverse_lookup_table = {}
                for row in self.execute('SELECT ' + self.key + ',' + column_name + ' FROM ' + self.table_name):
                    self._reverse_lookup_table[row[column_name]] = row[self.key]
        if value in self._reverse_lookup_table:
            return self._reverse_lookup_table[value]
        else:
            return None

    def create_singleton_value(self, column_name, value):
        id = self.get_id(column_name, value)
        if id is not None:
            return id
        self.insert({column_name: value})
        id = self.db.cursor.lastrowid
        self._reverse_lookup_table[value] = id
        if self._lookup_table is not None:
            self._lookup_table[id] = value
        return id




