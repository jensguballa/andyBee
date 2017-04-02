import os, json
from flask import Flask, render_template, request, redirect
from flask_nav import Nav
from flask_nav.elements import *
from werkzeug import secure_filename
from app import app
from app.gpx import import_gpx

from config import *

nav = Nav()

class LinkExt(NavigationItem):
    """ Intention of this class: provide extensions for the class Link.
    This class provides a workaround. The original class
    Link does not support to add arbitrary attributes to the link.
    We on the other hand need this, as we want to taggle the modal
    window with it.
    """
    def __init__(self, text, dest, **kwargs):
        self.text = text
        self.dest = dest
        self.kwargs = kwargs

from flask_bootstrap.nav import BootstrapRenderer
from dominate import tags
@nav.renderer()
class AndybeeRenderer(BootstrapRenderer):
    """ We need to provide a renderer class which can render the
    new LinkExt class.
    """

    def visit_Navbar(self, node):
        navbar = BootstrapRenderer.visit_Navbar(self, node)
        navbar['class'] = 'navbar navbar-inverse'
        return navbar

    def visit_LinkExt(self, node):
        return tags.li(tags.a(node.text, href=node.dest, **node.kwargs))

@nav.navigation()
def andyBeeNavbar():
    return Navbar(
        'AndyBee',
        Subgroup(
            'File',
            LinkExt('Select database', '#selectDB', **{'data-toggle':'modal'}),
            View('Import GPX', 'upload_gpx')
        ))

nav.init_app(app)

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/upload_gpx', methods = ['GET', 'POST'])
def upload_gpx():
    if request.method == 'POST':
        file = request.files['file']
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        import_gpx(filepath)
        return redirect(url_for('index'))
    else:
        return render_template('upload_gpx.html')

@app.route('/getdblist')
def get_db_list():
    list = next(os.walk(SQLALCHEMY_DATABASE_DIR))[2]
    return json.dumps(sorted(list))




