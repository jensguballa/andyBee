from db import SqlTable

class Preferences(SqlTable):
    _table_name = 'preferences'
    _key = 'id'
    _create_stmt = """
    CREATE TABLE IF NOT EXISTS preferences (
	id INTEGER NOT NULL, 
	auto_load INTEGER, 
	default_db TEXT, 
	owner TEXT, 
	used_db TEXT, 
        home_lat FLOAT,
        home_lon FLOAT,
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

