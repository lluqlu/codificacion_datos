from flask import Flask
from flask_cors import CORS
from .config import config_map
from .routes.compression_routes import compression_bp
from .routes.health_routes import health_bp


def create_app(env: str = "default") -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_map[env])

    CORS(app, origins=["https://codificacion.lluqlu.com"])

    app.register_blueprint(health_bp, url_prefix="/api/health")
    app.register_blueprint(compression_bp, url_prefix="/api/compression")

    return app
