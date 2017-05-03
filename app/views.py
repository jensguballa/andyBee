from flask import Flask, render_template
from app import app, db
from app.preferences import pref

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

