from flask import Flask
from .config import Config
from .extensions import db, migrate, jwt, mail

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)

    # Importar y registrar los blueprints (rutas)
    from .routes.auth_routes import auth_bp
    from .routes.user_routes import user_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/users')

    return app
