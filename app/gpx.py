from lxml import etree
from app import geocache_db
from geocache_model_sql import Cache, Cacher, CacheType, CacheContainer, CacheCountry, CacheState, CacheToAttribute, Waypoint, WaypointSym, WaypointType, Log, LogType, Attribute
from db import DbInterface
import re
import datetime
import time

GPX_NS = "http://www.topografix.com/GPX/1/0"
GPX = "{%s}" % GPX_NS
GS_NS = "http://www.groundspeak.com/cache/1/0/1"
GS = "{%s}" % GS_NS
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
XSI = "{%s}" % XSI_NS

latmin = 0
latmax = 0
lonmin = 0
lonmax = 0

deleted_wpt = {}
log_pool = {}
cacher_pool = None

max_logs = 5
pref_owner = 'bauchansatz'
pref_owner_id = 0

class LogTypePool():

    def __init__(self):
        self._pool = {}
        for row in geocache_db.execute('SELECT id, name FROM log_type'):
            self._pool[row['id']] = row['name']

    def get_name(self, id):
        if id in self._pool:
            return self._pool[id]
        else:
            return None

    def create_singleton(self, id, name):
        if id in self._pool:
            if name != self._pool[id]:
                geocache_db.execute('UPDATE log_type SET name = ? WHERE id = ?', (name, id))
                self._pool[id] = name
        else:
            geocache_db.execute('INSERT INTO log_type (id, name) VALUES (?,?)', (id, name))
            self._pool[id] = name

class CacherPool():

    def __init__(self, pref_owner):
        self._pool = {}
        self._pref_owner_id = None
        for row in geocache_db.execute('SELECT id, name FROM cacher'):
            self._pool[int(row['id'])] = row['name']
            if row['name'] == pref_owner:
                self._pref_owner_id = int(row['id'])

    def get_pref_owner_id(self):
        return self._pref_owner_id

    def create_singleton(self, id, name):
        if id in self._pool:
            if name != self._pool[id]:
                geocache_db.execute('UPDATE cacher SET name = ? WHERE id = ?', (name, id))
                self._pool[id] = name
        else:
            geocache_db.execute('INSERT INTO cacher (id, name) VALUES (?,?)', (id, name))
            self._pool[id] = name



def wpt_to_xml(parent, waypoint, data):
    data['latmin'] = min(data['latmin'], waypoint.lat)
    data['latmax'] = max(data['latmax'], waypoint.lat)
    data['lonmin'] = min(data['lonmin'], waypoint.lon)
    data['lonmax'] = max(data['lonmax'], waypoint.lon)
    w_wpt = subnode(parent, GPX+"wpt", attrib={'lat': str(waypoint.lat), 'lon': str(waypoint.lon)})
    subnode(w_wpt, GPX+"time", text=waypoint.time)
    subnode(w_wpt, GPX+"name", text=waypoint.name)
    subnode(w_wpt, GPX+"cmt", text=waypoint.cmt)
    subnode(w_wpt, GPX+"desc", text=waypoint.desc)
    subnode(w_wpt, GPX+"url", text=waypoint.url)
    subnode(w_wpt, GPX+"urlname", text=waypoint.urlname)
    subnode(w_wpt, GPX+"sym", text=waypoint.sym.name)
    subnode(w_wpt, GPX+"type", text=waypoint.type.name)
    return w_wpt

def geocache_to_xml(parent, geocache, data):
    wpt_node = wpt_to_xml(parent, geocache.waypoint, data)
    cache_node = subnode(wpt_node, GS+"cache", nsmap={'groundspeak':GS_NS}, 
            attrib={
                'id': str(geocache.id),
                'available': "True" if geocache.available else "False",
                'archived': "True" if geocache.archived else "False"})
    subnode(cache_node, GS+"name", text=geocache.name)
    subnode(cache_node, GS+"placed_by", text=geocache.placed_by)
    subnode(cache_node, GS+"owner", text=geocache.owner.name, attrib={'id': str(geocache.owner_id)})
    subnode(cache_node, GS+"type", text=geocache.type.name)
    subnode(cache_node, GS+"container", text=geocache.container.name)
    if len(geocache.attributes):
        attr_node = subnode(cache_node, GS+"attributes")
        for attribute in geocache.attributes:
            subnode(attr_node, GS+"attribute", text=attribute.name, 
                    attrib={
                        'id': str(attribute.gc_id),
                        'inc': "1" if attribute.inc else "0"})
    subnode(cache_node, GS+"difficulty", text=re.sub('\.0','', str(geocache.difficulty)))
    subnode(cache_node, GS+"terrain", text=re.sub('\.0','',str(geocache.terrain)))
    subnode(cache_node, GS+"country", text=geocache.country.name)
    subnode(cache_node, GS+"state", text=geocache.state.name)
    subnode(cache_node, GS+"short_description", text=geocache.short_desc,
            attrib={'html': "True" if geocache.short_html else "False"})
    subnode(cache_node, GS+"long_description", text=geocache.long_desc,
            attrib={'html': "True" if geocache.long_html else "False"})
    subnode(cache_node, GS+"encoded_hints", text=geocache.encoded_hints)
    if len(geocache.logs) and (data['max_logs'] > 0):
        sort_logs = sorted(geocache.logs, key=lambda log: log.date)
        logs_node = subnode(cache_node, GS+"logs")
        for log in sort_logs[0:data['max_logs']]:
            log_node = subnode(logs_node, GS+"log", attrib={'id': str(log.id)})
            subnode(log_node, GS+"date", text=log.date)
            subnode(log_node, GS+"type", text=log.type.name)
            subnode(log_node, GS+"finder", text=log.finder.name, attrib={'id': str(log.finder_id)})
            subnode(log_node, GS+"text", text=log.text, attrib={'encoded': 'True' if log.text_encoded else 'False'})
    if data['waypoints']:
        wpts = geocache_db.session.query(Waypoint).filter_by(gc_code=geocache.waypoint.name).all()
        for wpt in wpts:
            if wpt.cache_id is None:
                wpt_to_xml(parent, wpt, data)


def subnode(parent, tag_name, text=None, attrib=None, nsmap=None):
    node = etree.SubElement(parent, tag_name, nsmap=nsmap)
    if text is not None:
        node.text = text
    if attrib is not None:
        for name, val in attrib.iteritems():
            node.attrib[name] = val
    return node


def export_gpx(data):
    data['latmin'] = 1000.0
    data['latmax'] = -1000.0
    data['lonmin'] = 1000.0
    data['lonmax'] = -1000.0

    root = etree.Element(GPX+"gpx", nsmap={None:GPX_NS, "xsi":XSI_NS})
    root.attrib["version"] = "1.0"
    root.attrib["creator"] = "geodb, all rights reserved"
    root.attrib[XSI+"schemaLocation"] = "{} {}/gpx.xsd {} {}/cache.xsd".format(GPX_NS,GPX_NS,GS_NS,GS_NS)

    subnode(root, GPX+"name"   , text="Cache Listing Generated by andiBee")                        
    subnode(root, GPX+"desc"   , text="This is an individual list of geocaches generated by andiBee.")
    subnode(root, GPX+"author" , text="Hi, that's me: Jens Guballa")                             
    subnode(root, GPX+"email"  , text="andiBee@guballa.de")                                        
    subnode(root, GPX+"url"    , text="http://www.guballa.de")                                   
    subnode(root, GPX+"urlname", text="Geocaching. What else?")                                  
    subnode(root, GPX+"time"   , text=datetime.datetime.now().isoformat())                       
    subnode(root, GPX+"keyword", text="cache, geocache")                                         
    bounds = subnode(root, GPX+"bounds")                                                                  

    for id in data['list']:
        geocache = geocache_db.session.query(Cache).get(id)
        geocache_to_xml(root, geocache, data)

    bounds.attrib['minlat'] = str(data['latmin'])
    bounds.attrib['minlon'] = str(data['lonmin'])
    bounds.attrib['maxlat'] = str(data['latmax'])
    bounds.attrib['maxlon'] = str(data['lonmax'])

    et = etree.ElementTree(root)
    return etree.tostring(et, pretty_print=True, encoding="UTF-8", xml_declaration=True)

class GpxImporter():

    def __init__(self, geocache_db, max_logs, pref_owner):
        self.waypoint_itf = DbInterface(geocache_db, Waypoint)
        self.waypoint_sym_itf = DbInterface(geocache_db, WaypointSym)
        self.waypoint_type_itf = DbInterface(geocache_db, WaypointType)
        self.cache_itf = DbInterface(geocache_db, Cache)
        self.cache_type_itf = DbInterface(geocache_db, CacheType)
        self.cache_state_itf = DbInterface(geocache_db, CacheState)
        self.cache_country_itf = DbInterface(geocache_db, CacheCountry)
        self.cache_container_itf = DbInterface(geocache_db, CacheContainer)
        self.cache_to_attribute_itf = DbInterface(geocache_db, CacheToAttribute)
        self.cacher_itf = CacherInterface(geocache_db, Cacher)
        self.log_type_itf = DbInterface(geocache_db, LogType)
        self.log_itf = LogInterface(geocache_db, Log)
        self.db = geocache_db
        self.deleted_wpt = {}
        self.max_logs = max_logs
        self.pref_owner = pref_owner

    def import_gpx(self, gpx_file):
        print("DB001:")
        try:
            start = time.time()
            tree = etree.parse(gpx_file)
            end = time.time()
            print("DB01: ", end - start)
        except:
            return
        gpx = tree.getroot()

        if gpx.tag == GPX+"gpx":
            for node in gpx:
                if node.tag == GPX+"wpt":
                    wpt = self._parse_wpt(node)
                    self._merge_wpt(wpt)
        geocache_db.execute('''UPDATE waypoint 
        SET cache_id = (SELECT cache.id FROM cache WHERE cache.gc_code = waypoint.gc_code) 
        WHERE cache_id IS NULL''')
        self.db.commit()

    def _parse_wpt(self, node):
        wpt = Waypoint()
        wpt.cache = None
        wpt.db['lat'] = float(node.get("lat"))
        wpt.db['lon'] = float(node.get("lon"))
        for child in node:
            if child.tag == GPX+"time":
                wpt.db['time'] = child.text
            elif child.tag == GPX+"name":
                wpt.db['name'] = child.text
                wpt.db['gc_code'] = re.sub('^..', 'GC', child.text)
            elif child.tag == GPX+"desc":
                wpt.db['descr'] = child.text
            elif child.tag == GPX+"url":
                wpt.db['url'] = child.text
            elif child.tag == GPX+"urlname":
                wpt.db['urlname'] = child.text
            elif child.tag == GPX+"sym":
                wpt.sym = child.text
                wpt.db['sym_id'] = self.waypoint_sym_itf.create_singleton_value('name', child.text)
            elif child.tag == GPX+"type":
                #wpt.db['type_id'] = geocache_db.create_singleton_id(WaypointType, {'name': child.text})
                wpt.db['type_id'] = self.waypoint_type_itf.create_singleton_value('name', child.text)
            elif child.tag == GPX+"cmt":
                wpt.db['cmt'] = child.text
            elif child.tag == GS+"cache":
                wpt.cache = self._parse_cache(child)
                wpt.db['cache_id'] = wpt.cache.db['id']
        if wpt.cache is not None:
            # copy some values from the waypoint, so that join statements
            # can be avoided
            wpt.cache.db['hidden'] = wpt.db['time']
            wpt.cache.db['lat'] = wpt.db['lat']
            wpt.cache.db['lon'] = wpt.db['lon']
            wpt.cache.db['gc_code'] = wpt.db['name']
            wpt.cache.db['url'] = wpt.db['url']
            wpt.cache.db['found'] = (wpt.sym == 'Geocache Found')
        return wpt


    def _parse_cache(self, node):
        cache = Cache()
        cache.db['id'] = int(node.get("id"))
        cache.db['available'] = (node.get("available") == "True")
        cache.db['archived'] = (node.get("archived") == "True")
        for child in node:
            if child.tag == GS+"name":
                cache.db['name'] = child.text
            elif child.tag == GS+"placed_by":
                cache.db['placed_by'] = child.text
            elif child.tag == GS+"owner":
                owner_id = int(child.get("id"))
                self.cacher_itf.create_singleton(owner_id, child.text)
                cache.db['owner_id'] =  owner_id 
                # geocache_db.create_singleton_id(Cacher, {'id': child.get("id") , 'name': child.text})
            elif child.tag == GS+"type":
                #cache.db['type_id'] = geocache_db.create_singleton_id(CacheType, {'name': child.text})
                cache.db['type_id'] = self.cache_type_itf.create_singleton_value('name', child.text)
            elif child.tag == GS+"container":
                #cache.db['container_id'] = geocache_db.create_singleton_id(CacheContainer, {'name': child.text})
                cache.db['container_id'] = self.cache_container_itf.create_singleton_value('name', child.text)
            elif child.tag == GS+"difficulty":
                cache.db['difficulty'] = float(child.text)
            elif child.tag == GS+"terrain":
                cache.db['terrain'] = float(child.text)
            elif child.tag == GS+"country":
                #cache.db['country_id'] = geocache_db.create_singleton_id(CacheCountry, {'name': child.text})
                cache.db['country_id'] = self.cache_country_itf.create_singleton_value('name', child.text)
            elif child.tag == GS+"state":
                #cache.db['state_id'] = geocache_db.create_singleton_id(CacheState, {'name': child.text})
                cache.db['state_id'] = self.cache_state_itf.create_singleton_value('name', child.text)
            elif child.tag == GS+"short_description":
                cache.db['short_desc'] = child.text
                cache.db['short_html'] = (child.get("html") == "True")
            elif child.tag == GS+"long_description":
                cache.db['long_desc'] = child.text
                cache.db['long_html'] = (child.get("html") == "True")
            elif child.tag == GS+"encoded_hints":
                cache.db['encoded_hints'] = child.text
            elif child.tag == GS+"attributes":
                cache.attributes = []
                for node_attr in child:
                    if node_attr.tag == GS+"attribute":
                        cache.attributes.append(self._parse_attribute(node_attr))
            elif child.tag == GS+"logs":
                cache.logs = []
                for node_log in child:
                    if node_log.tag == GS+"log":
                        cache.logs.append(self._parse_log(node_log, cache.db['id']))
        return cache

    def _parse_attribute(self, node):
        attr = Attribute()
        attr.db['gc_id'] = int(node.get("id"))
        attr.db['inc'] = (node.get("inc") == "1")
        attr.db['name'] = node.text
        return attr


    def _parse_log(self, node, cache_id):
        log = Log()
        log.db['id'] = int(node.get("id"))
        log.db['cache_id'] = cache_id
        for log_node in node:
            if log_node.tag == GS+"date":
                log.db['date'] = log_node.text
            elif log_node.tag == GS+"type":
                #log.db['type_id'] = geocache_db.create_singleton_id(LogType, {'name': log_node.text})
                log.db['type_id'] = self.log_type_itf.create_singleton_value('name', log_node.text)
            elif log_node.tag == GS+"finder":
                log.db['finder_id'] = int(log_node.get("id"))
                log.finder = log_node.text
            elif log_node.tag == GS+"text":
                log.db['text'] = log_node.text
                log.db['text_encoded'] = (log_node.get("encoded") == "True")
            elif log_node.tag == GS+"log_wpt":
                log.db['lat'] = float(log_node.get("lat"))
                log.db['lon'] = float(log_node.get("lon"))
        return log


    def _merge_wpt(self, wpt):
        gc_code = wpt.db['gc_code']
        #cache_exists = geocache_db.get_singleton_id(Cache, {'gc_code': gc_code}) != None
        cache_exists = self.cache_itf.get_id('gc_code', gc_code) != None
        if cache_exists:
            if gc_code not in self.deleted_wpt:
                self.waypoint_itf.delete('gc_code', gc_code)
                self.deleted_wpt[gc_code] = True
        self.waypoint_itf.insert(wpt.db)
        if wpt.cache is not None:
            self._merge_cache(wpt.cache, cache_exists)

    def _merge_cache(self, cache, cache_exists):
        last_logs = self._merge_logs(cache.logs, cache.db['id'])
        cache.db['last_logs'] = last_logs
        if cache_exists:
            self.cache_itf.update(cache.db['id'], cache.db)
        else:
            self.cache_itf.insert(cache.db)
        self._merge_attributes(cache.attributes, cache.db['id'], cache_exists)


    def _merge_logs(self, logs, cache_id):
        #global cacher_pool

        db_logs = self.log_itf.get_cache_logs(cache_id)
        merged_array = []
        for log in logs:
            if log.db['id'] in db_logs:
                del db_logs[log.db['id']]
                merged_array.append({'id': log.db['id'], 'date': log.db['date'], 'finder': log.finder, 'type_id': log.db['type_id'], 'action': 'update', 'db': log.db})
            else:
                merged_array.append({'id': log.db['id'], 'date': log.db['date'], 'finder': log.finder, 'type_id': log.db['type_id'], 'action': 'insert', 'db': log.db})

        for log in db_logs.values():
            merged_array.append(log)

        sorted_logs = sorted(merged_array, key=lambda log: log['date'], reverse=True)

        log_cntr = 1
        for log in sorted_logs:
            if (log_cntr <= self.max_logs) or (log['db']['finder_id'] == pref_owner_id):
                if log['action'] == 'insert':
                    self.cacher_itf.create_singleton(log['db']['finder_id'], log['finder'])
                    #cacher_pool.create_singleton(log['db']['finder_id'], log['finder'])
                    #geocache_db.create_singleton_id(Cacher, {'id': log['db']['finder_id'], 'name': log['finder']})
                    self.log_itf.insert(log['db'])
                    #geocache_db.insert(Log, log['db'])
                elif log['action'] == 'update':
                    self.cacher_itf.create_singleton(log['db']['finder_id'], log['finder'])
                    #cacher_pool.create_singleton(log['db']['finder_id'], log['finder'])
                    #geocache_db.create_singleton_id(Cacher, {'id': log['db']['finder_id'], 'name': log['finder']})
                    self.log_itf.update(log['id'], log['db'])
            else:
                if log['action'] == 'none':
                    self.log_itf.delete('id', log['id'])
            log_cntr = log_cntr + 1

        #cache.last_logs = ";".join([l.type for l in sorted_logs[:5]])
        last_logs = ';'.join([self.log_type_itf.get_value(log['type_id'], 'name')  for log in sorted_logs[:5]])
        return last_logs



    def _merge_attributes(self, attributes, cache_id, cache_exists):
        if cache_exists:
            self.cache_to_attribute_itf.delete('cache_id', cache_id)
        for attr in attributes:
            id = geocache_db.create_singleton_id(Attribute, attr.db) 
            self.cache_to_attribute_itf.insert({'cache_id': cache_id, 'attribute_id': id})


class AttributeInterface():

    def __init__(self, db, cls):
        DbInterface.__init__(self, db, cls)

    def get_id(self, columns):
        if self._reverse_lookup_table is None:
            for row in self.execute('SELECT id, gc_id, inc, name FROM attribute'):
                vals = '|'.join([row['gc_id'], row['inc'], row['name']])
                self._reverse_lookup_table[vals] = id
        vals = '|'.join([columns['gc_id'], columns['inc'], columns['name']])
        if vals in self._reverse_lookup_table:
            return self._reverse_lookup_table[vals]
        else:
            return None

    def create_singleton(self, columns):
        id = self.get_id(columns)
        if id is not None:
            return id
        self.insert(columns)
        id = self.db.cursor.lastrowid
        vals = '|'.join([columns['gc_id'], columns['inc'], columns['name']])
        self._reverse_lookup_table[vals] = id
        if self._lookup_table is not None:
            self._lookup_table[id] = value
        return id
        
class CacherInterface(DbInterface):

    def __init__(self, db, cls):
        DbInterface.__init__(self, db, cls)

    def create_singleton(self, id, name):
        db_name = self.get_value(id, 'name')
        if db_name is None:
            self.insert({'id': id, 'name': name})
            self._lookup_table[id] = name
            if self._reverse_lookup_table is not None:
                self._reverse_lookup_table[name] = id
        else:
            if name != db_name:
                self.update(id, {'name': name})
                self._lookup_table[id] = name
                if self._reverse_lookup_table is not None:
                    self._reverse_lookup_table[name] = id
            
class LogInterface(DbInterface):

    def __init__(self, db, cls):
        DbInterface.__init__(self, db, cls)
        self._pool = {}
        for row in self.execute('SELECT id, date, cache_id, finder_id, type_id FROM log'):
            if row['cache_id'] not in self._pool:
                self._pool[row['cache_id']] = {}
            self._pool[row['cache_id']][row['id']] = {'id': row['id'], 'date': row['date'], 'finder_id': row['finder_id'], 'type_id': row['type_id'], 'action': 'none'}

    def get_cache_logs(self, cache_id):
        if cache_id in self._pool:
            return self._pool[cache_id]
        else:
            return {}

