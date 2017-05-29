from db import SqlTable


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
            country_id INTEGER, 
            difficulty FLOAT, 
            encoded_hints TEXT, 
            gc_id TEXT,
            last_logs TEXT, 
            lat FLOAT, 
            lon FLOAT, 
            long_desc TEXT, 
            long_html BOOLEAN, 
            name TEXT, 
            owner_id INTEGER, 
            placed_by TEXT, 
            short_desc TEXT, 
            short_html BOOLEAN, 
            state_id INTEGER, 
            terrain FLOAT, 
            type_id INTEGER, 
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
            PRIMARY KEY (id), 
            UNIQUE (name)
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
            type_id INTEGER, 
            finder_id INTEGER, 
            text TEXT, 
            text_encoded BOOLEAN, 
            lat FLOAT, 
            lon FLOAT, 
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
        Log,
        LogType,
        Waypoint,
        WaypointSym,
        WaypointType)

