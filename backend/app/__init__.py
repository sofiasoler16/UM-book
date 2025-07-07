from flask import Flask
from flask_restful import Api
from app.config import Config
from app.extensions import db, migrate, jwt, mail
from app.routes.user_routes import UserResource

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    api = Api(app)

    # Registrar el resource
    api.add_resource(UserResource, '/users')

    return app

