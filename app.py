# -*- coding: utf-8 -*-
import os
import sqlite3
import geojson
from flask import Flask, request, g, redirect, url_for, render_template, flash, jsonify
from flask_bootstrap import Bootstrap

app = Flask(__name__)
bootstrap = Bootstrap(app)

# UPLOAD_FOLDER = '/Users/pankus/GitProjects/misis-db/static/files'
# Load default config and override config from an environment variable

# app.config.update(dict(
#     BOOTSTRAP_SERVE_LOCAL=True,
#     DATABASE=os.path.join(app.root_path, 'misis_db.sqlite'),
#     DEBUG=True,
#     SECRET_KEY='development key',
#     USERNAME='admin',
#     PASSWORD='default',
#     UPLOAD_FOLDER='static/files/originali',
#     THUMBNAIL_FOLDER='static/files/thumb',
#     MAX_CONTENT_LENGTH='50 * 1024 * 1024'
# ))

# ALLOWED_EXTENSIONS = set(['txt', 'png', 'jpg', 'jpeg', 'gif'])
ALLOWED_EXTENSIONS = set(['txt', 'gif', 'png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff', 'rar', 'zip', '7zip', 'pdf', 'doc', 'docx', 'odt'])
IGNORED_FILES = set(['.gitignore'])

app.config.from_object('config')
app.config.from_envvar('FLASKR_SETTINGS', silent=True)


def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DATABASE'])
    rv.row_factory = sqlite3.Row
    return rv


def get_db():
    """Opens a new database connection if there is none yet for the current application context."""
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db


@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()


@app.route('/')
@app.route('/index')
@app.route('/home')
def home():
    return render_template('home.html')


@app.route('/engine/getpoints')
def getpoints():
    db = get_db()
    # sql = "select * from geoname limit 100"
    # sql = "select * from geoname limit 100"
    sql = "select * from geoname limit 3000"
    cur = db.execute(sql)
    # geodata = [dict(id=row[0], name=row[1], lat=row[3], lon=row[4]) for row in cur.fetchall()]
    # return jsonify(geodata)
    # geodata = [dict(id=row[0], name=row[1], geojson.Point((row[3], row[4]))) for row in cur.fetchall()]
    # return geojson.dumps(geodata, sort_keys=True)
    row = cur.fetchall()
    features = []
    for i in row:
        feature = geojson.Feature(geometry=geojson.Point((i[4], i[3])), properties={"id": i[0], "name": i[1]})
        features.append(feature)
    geodata = geojson.FeatureCollection(features)
    return geojson.dumps(geodata, sort_keys=True)


if __name__ == '__main__':
    app.run(debug=True)
