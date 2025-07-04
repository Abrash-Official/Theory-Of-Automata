from flask_frozen import Freezer
from app import app

app.config['FREEZER_DESTINATION'] = 'netlify-dist'
freezer = Freezer(app)

if __name__ == '__main__':
    freezer.freeze() 