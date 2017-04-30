from flask import Flask, render_template
from app import app, db
from app.preferences import pref

@app.route('/')
@app.route('/index')
def index():
    default_db = pref.get_startup_db()
    return render_template('index.html', default_db=default_db)

