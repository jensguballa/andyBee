import dateutil
import datetime
import calendar
from geocache_model_sql import UserNote

def update_corrected_coordinates_for_rest_itf(geocache):
    geocache['orig_lat'] = geocache['lat']
    geocache['orig_lon'] = geocache['lon']
    if geocache['coords_updated']:
        geocache['lat'] = geocache['corr_lat']
        geocache['lon'] = geocache['corr_lon']
    else:
        geocache['coords_updated'] = False

def update_hidden_for_rest_itf(geocache):
    full_date = dateutil.parser.parse(geocache['hidden'])
    date = datetime.datetime(full_date.year, full_date.month, full_date.day)
    geocache['hidden'] = int(calendar.timegm(date.timetuple()))

class Geocache():

    def __init__(self, id, db):
        self.id = id
        self.db = db
        self.data = {}

    def get_data(self):
        return self.data

    def get_data_for_rest_itf(self):
        self.fetch_singular()
        update_hidden_for_rest_itf(self.data)
        update_corrected_coordinates_for_rest_itf(self.data)
        return self.data

    def fetch_singular(self):

        stmt = '''SELECT 
                cache.id AS id,
                cache.archived AS archived,
                cache.available AS available,
                cache_container.name AS container,
                cache.coords_updated AS coords_updated,
                cache.corr_lat AS corr_lat,
                cache.corr_lon AS corr_lon,
                cache_country.name AS country,
                cache.difficulty AS difficulty,
                cache.encoded_hints AS encoded_hints,
                cache.found AS found,
                cache.gc_code AS gc_code,
                cache.hidden AS hidden,
                cache.last_logs AS last_logs,
                cache.last_updated AS last_updated,
                cache.lat AS lat,
                cache.lon AS lon,
                cache.long_desc AS long_desc,
                cache.long_html AS long_html,
                cache.name AS name,
                cacher.name AS owner,
                cache.note_present AS note_present,
                cache.owner_id AS owner_id,
                cache.placed_by AS placed_by,
                cache.short_desc AS short_desc,
                cache.short_html AS short_html,
                cache_state.name AS state,
                cache.terrain AS terrain,
                cache_type.name AS type,
                cache.url AS url
                FROM cache
                INNER JOIN cache_container ON cache_container.id = cache.container_id
                INNER JOIN cache_country ON cache_country.id = cache.country_id
                INNER JOIN cacher ON cacher.id = cache.owner_id
                INNER JOIN cache_state ON cache_state.id = cache.state_id
                INNER JOIN cache_type ON cache_type.id = cache.type_id
                WHERE cache.id = ?
        '''
        self.data = dict(self.db.execute(stmt,(self.id,)).fetchone())

        user_note = ""
        if self.data['note_present']:
            user_note = self.db.get_by_id(UserNote, self.id)['note']
        self.data['user_note'] = user_note

        stmt = '''SELECT
                attribute.gc_id AS gc_id,
                attribute.inc AS inc,
                attribute.name AS name
                FROM cache_to_attribute
                INNER JOIN attribute ON attribute.id = cache_to_attribute.attribute_id
                WHERE cache_to_attribute.cache_id = ?
                '''
        self.data['attributes'] = [dict(row) for row in self.db.execute(stmt, (self.id,))]

        stmt = '''SELECT
                log.id AS id,
                log.date AS date,
                cacher.name AS finder,
                log.finder_id AS finder_id,
                log.lat AS lat,
                log.lon AS lon,
                log.text AS text,
                log.text_encoded AS text_encoded,
                log_type.name AS type
                FROM log
                INNER JOIN cacher ON cacher.id = log.finder_id
                INNER JOIN log_type ON log_type.id = log.type_id
                WHERE log.cache_id = ?
                '''
        self.data['logs'] = [dict(row) for row in self.db.execute(stmt, (self.id,))]

        stmt = '''SELECT
                waypoint.gc_code AS gc_code,
                waypoint.lat AS lat,
                waypoint.lon AS lon, 
                waypoint.time AS time, 
                waypoint.name AS name, 
                waypoint.descr AS descr, 
                waypoint.url AS url, 
                waypoint.urlname AS urlname,
                waypoint_sym.name AS sym,
                waypoint_type.name AS type,
                waypoint.cmt AS cmt
                FROM waypoint
                INNER JOIN waypoint_sym ON waypoint_sym.id = waypoint.sym_id
                INNER JOIN waypoint_type ON waypoint_type.id = waypoint.type_id
                WHERE cache_id = ? 
                '''
                # WHERE cache_id = ? AND waypoint.name != waypoint.gc_code
        self.data['waypoints'] = [dict(row) for row in self.db.execute(stmt, (self.id,))]

        return self


class GeocacheList():

    def __init__(self, db):
        self.db = db
        self.list = []

        self.owners = {}
        for row in self.db.execute('SELECT * from cacher'):
            self.owners[row['id']] = row['name']
        
        self.types = {}
        for row in self.db.execute('SELECT * from cache_type'):
            self.types[row['id']] = row['name']

        self.containers = {}
        for row in self.db.execute('SELECT * from cache_container'):
            self.containers[row['id']] = row['name']

        self.countries = {}
        for row in self.db.execute('SELECT * from cache_country'):
            self.countries[row['id']] = row['name']

        self.states = {}
        for row in self.db.execute('SELECT * from cache_state'):
            self.states[row['id']] = row['name']


    def get_data_for_rest_itf(self):

        self.fetch_list()
        for geocache in self.list:
            update_hidden_for_rest_itf(geocache)
            update_corrected_coordinates_for_rest_itf(geocache)
        return self.list

    def fetch_list(self):

        stmt = 'SELECT id, available, archived, name, ' \
                'placed_by, owner_id, type_id, container_id, terrain, difficulty, ' \
                'country_id, state_id, last_logs, last_updated, lat, lon, gc_code, url, found, ' \
                'short_desc, short_html, long_desc, long_html, encoded_hints, ' \
                'coords_updated, corr_lat, corr_lon, hidden, note_present '\
                'FROM cache'
        self.list = [dict(row) for row in self.db.execute(stmt)]

        for geocache in self.list:
            geocache['owner'] = self.owners[geocache['owner_id']]
            geocache['type'] = self.types[geocache['type_id']]
            geocache['container'] = self.containers[geocache['container_id']]
            geocache['country'] = self.countries[geocache['country_id']]
            geocache['state'] = self.states[geocache['state_id']]

