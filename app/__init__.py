from flask import Flask
import os

# Get the absolute path to the directory containing this file (app/)
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(basedir, 'templates'),
    static_folder=os.path.join(basedir, 'static')
)

# Import routes to register them with the app
from . import routes 