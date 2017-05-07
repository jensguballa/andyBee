from lxml import etree
from app import geocache_db
import geocache_model
import re

GPX_NS = "http://www.topografix.com/GPX/1/0"
GPX = "{%s}" % GPX_NS
GS_NS = "http://www.groundspeak.com/cache/1/0/1"
GS = "{%s}" % GS_NS
XSI_NS = "http://www.w3.org/2001/XMLSchema-instance"
XSI = "{%s}" % XSI_NS

def import_gpx(filename):
    try:
        tree = etree.parse(filename)
    except:
        return
    gpx = tree.getroot()
    if gpx.tag == GPX+"gpx":
        for node in gpx:
            if node.tag == GPX+"wpt":
                parse_wpt(node)
        geocache_db.session.commit()

def parse_wpt(node):
    wpt = models.Waypoint()
    wpt.lat = float(node.get("lat"))
    wpt.lon = float(node.get("lon"))
    for child in node:
        if child.tag == GPX+"time":
            wpt.time = child.text
        elif child.tag == GPX+"name":
            wpt.name = child.text
            wpt.gc_code = re.sub('^..', 'GC', wpt.name)
        elif child.tag == GPX+"desc":
            wpt.desc = child.text
        elif child.tag == GPX+"url":
            wpt.url = child.text
        elif child.tag == GPX+"urlname":
            wpt.urlname = child.text
        elif child.tag == GPX+"sym":
            wpt.sym = ddbb.get_or_create(models.WaypointSym, name=child.text)
            pass
        elif child.tag == GPX+"type":
            wpt.type = geocache_db.get_or_create(models.WaypointType, name=child.text)
            pass
        elif child.tag == GPX+"cmt":
            wpt.cmt = child.text
        elif child.tag == GS+"cache":
            wpt.cache = parse_cache(child)
    geocache_db.session.add(wpt)

def parse_cache(node):
    cache = models.Cache()
    cache.id = int(node.get("id"))
    cache.available = (node.get("available") == "True")
    cache.archived = (node.get("archived") == "True")
    for child in node:
        if child.tag == GS+"name":
            cache.name = child.text
        elif child.tag == GS+"placed_by":
            cache.placed_by = child.text
        elif child.tag == GS+"owner":
            cache.owner = geocache_db.get_or_create(models.Cacher, name=child.text)
            pass
        elif child.tag == GS+"type":
            cache.type = geocache_db.get_or_create(models.CacheType, name=child.text)
            pass
        elif child.tag == GS+"container":
            cache.container = geocache_db.get_or_create(models.CacheContainer, name=child.text)
            pass
        elif child.tag == GS+"difficulty":
            cache.difficulty = float(child.text)
        elif child.tag == GS+"terrain":
            cache.terrain = float(child.text)
        elif child.tag == GS+"country":
            cache.country = geocache_db.get_or_create(models.CacheCountry, name=child.text)
            pass
        elif child.tag == GS+"state":
            cache.state = geocache_db.get_or_create(models.CacheState, name=child.text)
            pass
        elif child.tag == GS+"short_description":
            cache.short_desc = child.text
            cache.short_html = (child.get("html") == "True")
        elif child.tag == GS+"long_description":
            cache.long_desc = child.text
            cache.long_html = (child.get("html") == "True")
        elif child.tag == GS+"encoded_hints":
            cache.encoded_hints = child.text
        elif child.tag == GS+"attributes":
            for node_attr in child:
                if node_attr.tag == GS+"attribute":
                    cache.attributes.append(parse_attribute(node_attr))
                    pass
        elif child.tag == GS+"logs":
            for node_log in child:
                if node_log.tag == GS+"log":
                    cache.logs.append(parse_log(node_log))
    return cache


def parse_attribute(node):
    return geocache_db.get_or_create(models.Attribute, 
            gc_id=int(node.get("id")),
            inc=(node.get("inc") == "1"),
            name=node.text)

def parse_log(node):
    log = models.Log()
    log.id = node.get("id")
    for log_node in node:
        if log_node.tag == GS+"date":
            log.date = log_node.text
        elif log_node.tag == GS+"type":
            log.type = geocache_db.get_or_create(models.LogType, name=log_node.text)
            pass
        elif log_node.tag == GS+"finder":
            log.finder = geocache_db.get_or_create(models.Cacher, name=log_node.text)
            pass
        elif log_node.tag == GS+"text":
            log.text = log_node.text
            log.text_encoded = (log_node.get("encoded") == "True")
        elif log_node.tag == GS+"log_wpt":
            log.lat = float(log_node.get("lat"))
            log.lon = float(log_node.get("lon"))
    return log


