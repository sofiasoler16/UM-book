from flask import Flask
from flask_restful import Api
from app.config import Config
from app.extensions import db, migrate, jwt, mail
from flask_cors import CORS

from app.routes.user_routes import UserResource
from app.routes.auth_routes import LoginResource
from app.routes.album_routes import AlbumResource
from app.routes.album_routes import AlbumDetailResource
from app.routes.foto_routes import FotoResource


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app)


    api = Api(app)

    # Registrar el resource
    api.add_resource(UserResource, '/users')
    api.add_resource(LoginResource, "/login")
    api.add_resource(AlbumResource, '/albums')
    api.add_resource(AlbumDetailResource, '/albums/<int:album_id>')
    api.add_resource(FotoResource, '/fotos')

    return app

