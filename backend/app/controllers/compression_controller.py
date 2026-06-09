from flask import request, jsonify
from ..services import compression_service, file_service
from ..utils.validators import (
    validate_text,
    validate_encoded_string,
    validate_codes_table,
    validate_algorithm,
)


def encode():
    if "file" in request.files:
        try:
            text = file_service.read_text_file(request.files["file"])
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
    else:
        body = request.get_json(silent=True) or {}
        text = body.get("text", "")

    error = validate_text(text)
    if error:
        return jsonify({"error": error}), 400

    try:
        result = compression_service.encode(text)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def decode():
    body = request.get_json(silent=True) or {}
    algorithm = body.get("algorithm", "")
    encoded = body.get("encoded", "")
    codes = body.get("codes", [])

    for error in [
        validate_algorithm(algorithm),
        validate_encoded_string(encoded),
        validate_codes_table(codes),
    ]:
        if error:
            return jsonify({"error": error}), 400

    try:
        decoded = compression_service.decode(algorithm, encoded, codes)
        return jsonify({"decoded": decoded}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
