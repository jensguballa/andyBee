from db import SqlTable

RELEASE = 1
VERSION = 3

class DbModel(SqlTable):
    _table_name = 'db_model'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS db_model (
            id INTEGER NOT NULL, 
            release INTEGER, 
            version INTEGER, 
            PRIMARY KEY (id) 
    )
    """
    _init_cmd = """
    INSERT INTO db_model (id, release, version) VALUES (1,{0},{1}) 
    """.format(RELEASE, VERSION)

class Attribute(SqlTable):
    _table_name = 'attribute'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS attribute (
            id INTEGER NOT NULL, 
            gc_id INTEGER, 
            inc BOOLEAN, 
            name TEXT, 
            PRIMARY KEY (id), 
            CHECK (inc IN (0, 1))
    )
    """

class Cache(SqlTable):
    _table_name = 'cache'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache (
            id INTEGER NOT NULL, 
            archived BOOLEAN, 
            available BOOLEAN, 
            container_id INTEGER, 
            coords_updated BOOLEAN,
            corr_lat FLOAT,
            corr_lon FLOAT,
            country_id INTEGER, 
            difficulty FLOAT, 
            encoded_hints TEXT, 
            found BOOLEAN,
            gc_code TEXT,
            hidden TEXT,
            last_logs TEXT, 
            last_updated INTEGER,
            lat FLOAT, 
            lon FLOAT, 
            long_desc TEXT, 
            long_html BOOLEAN, 
            name TEXT, 
            note_present BOOLEAN DEFAULT 0,
            owner_id INTEGER, 
            placed_by TEXT, 
            short_desc TEXT, 
            short_html BOOLEAN, 
            state_id INTEGER, 
            terrain FLOAT, 
            type_id INTEGER, 
            url TEXT,
            PRIMARY KEY (id), 
            CHECK (available IN (0, 1)), 
            CHECK (archived IN (0, 1)), 
            FOREIGN KEY(owner_id) REFERENCES cacher (id), 
            FOREIGN KEY(type_id) REFERENCES cache_type (id), 
            FOREIGN KEY(container_id) REFERENCES cache_container (id), 
            FOREIGN KEY(country_id) REFERENCES cache_country (id), 
            FOREIGN KEY(state_id) REFERENCES cache_state (id), 
            CHECK (short_html IN (0, 1)), 
            CHECK (long_html IN (0, 1))
    )
    """

class CacheContainer(SqlTable):
    _table_name = 'cache_container'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache_container (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class CacheCountry(SqlTable):
    _table_name = 'cache_country'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache_country (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class CacheState(SqlTable):
    _table_name = 'cache_state'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache_state (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class CacheToAttribute(SqlTable):
    _table_name = 'cache_to_attribute'
    _key = ''
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache_to_attribute (
            cache_id INTEGER, 
            attribute_id INTEGER, 
            FOREIGN KEY(cache_id) REFERENCES cache (id), 
            FOREIGN KEY(attribute_id) REFERENCES attribute (id)
    )
    """

class CacheType(SqlTable):
    _table_name = 'cache_type'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cache_type (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class Cacher(SqlTable):
    _table_name = 'cacher'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS cacher (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id) 
    )
    """

class Log(SqlTable):
    _table_name = 'log'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS log (
            id INTEGER NOT NULL, 
            cache_id INTEGER, 
            date TEXT, 
            finder_id INTEGER, 
            lat FLOAT, 
            lon FLOAT, 
            text TEXT, 
            text_encoded BOOLEAN, 
            type_id INTEGER, 
            PRIMARY KEY (id), 
            FOREIGN KEY(cache_id) REFERENCES cache (id), 
            FOREIGN KEY(type_id) REFERENCES log_type (id), 
            FOREIGN KEY(finder_id) REFERENCES cacher (id), 
            CHECK (text_encoded IN (0, 1))
    )
    """

class LogType(SqlTable):
    _table_name = 'log_type'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS log_type (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class UserNote(SqlTable):
    _table_name = 'user_note'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS user_note (
            id INTEGER NOT NULL, 
            note TEXT, 
            PRIMARY KEY (id) 
    )
    """

class Waypoint(SqlTable):
    _table_name = 'waypoint'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS waypoint (
            id INTEGER NOT NULL, 
            lat FLOAT, 
            lon FLOAT, 
            time TEXT, 
            name TEXT, 
            gc_code TEXT, 
            descr TEXT, 
            url TEXT, 
            urlname TEXT, 
            sym_id TEXT, 
            type_id TEXT, 
            cmt TEXT, 
            cache_id INTEGER, 
            PRIMARY KEY (id), 
            FOREIGN KEY(sym_id) REFERENCES waypoint_sym (id), 
            FOREIGN KEY(type_id) REFERENCES waypoint_type (id), 
            FOREIGN KEY(cache_id) REFERENCES cache (id)
    )
    """    

class WaypointSym(SqlTable):
    _table_name = 'waypoint_sym'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS waypoint_sym (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

class WaypointType(SqlTable):
    _table_name = 'waypoint_type'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS waypoint_type (
            id INTEGER NOT NULL, 
            name TEXT, 
            PRIMARY KEY (id), 
            UNIQUE (name)
    )
    """

geocache_tables = (
        Attribute,
        Cache,
        CacheContainer,
        CacheCountry,
        CacheState,
        CacheToAttribute,
        CacheType,
        Cacher,
        DbModel,
        Log,
        LogType,
        UserNote,
        Waypoint,
        WaypointSym,
        WaypointType)

def db_model_update(geocache_db):
    row = dict(geocache_db.get_by_id(DbModel, 1))
    if row['release'] == RELEASE:
        if row['version'] != VERSION:
            for cur_version in range(row['version'], VERSION):
                if cur_version == 1:
                    geocache_db.execute(UserNote.create_table())
                elif cur_version == 2:
                    geocache_db.execute('ALTER TABLE cache ADD COLUMN note_present BOOLEAN DEFAULT 0')

            geocache_db.update(DbModel, 1, {'version': VERSION})
            geocache_db.commit()

