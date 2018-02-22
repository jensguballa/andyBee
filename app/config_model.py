from db import SqlTable

RELEASE = 1
VERSION = 1

class Preferences(SqlTable):
    _table_name = 'preferences'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS preferences (
	id INTEGER NOT NULL, 
	auto_load INTEGER, 
        cluster_zoom INTEGER,
        db_model_version INTEGER,
        db_model_release INTEGER,
	default_db TEXT, 
	owner TEXT, 
	used_db TEXT, 
        home_lat FLOAT,
        home_lon FLOAT,
        marker_size INTEGER,
        max_export INTEGER,
        max_import INTEGER,
        sticky_menu BOOLEAN,
	PRIMARY KEY (id), 
	UNIQUE (owner)
    )
    """

class Filter(SqlTable):
    _table_name = 'filter'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS filter (
        id INTEGER NOT NULL, 
        sequence INTEGER, 
        name TEXT, 
        PRIMARY KEY (id), 
        UNIQUE (sequence), 
        UNIQUE (name)
    )
    """

class FilterAtom(SqlTable):
    _table_name = 'filter_atom'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS filter_atom (
	id INTEGER NOT NULL, 
	filter_id INTEGER, 
	name TEXT, 
	op TEXT, 
	value TEXT, 
	PRIMARY KEY (id), 
	FOREIGN KEY(filter_id) REFERENCES filter (id)
    )
    """

config_tables = (
        Preferences,
        Filter,
        FilterAtom)

def db_model_update (release, version, config_db, id):
    if version < VERSION:
        for cur_version in range(version, VERSION):
            if cur_version == 1:
                pass
            if cur_version == 2:
                pass
            if cur_version == 3:
                pass
        config_db.update(Preferences, id, {'db_model_version': VERSION})
        config_db.commit()
        return True
    else:
        return False

