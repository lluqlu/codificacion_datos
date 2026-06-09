from flask import Blueprint
from ..controllers.compression_controller import encode, decode

compression_bp = Blueprint("compression", __name__)

compression_bp.route("/encode", methods=["POST"])(encode)
compression_bp.route("/decode", methods=["POST"])(decode)
