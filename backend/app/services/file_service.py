from werkzeug.datastructures import FileStorage


def read_text_file(file: FileStorage) -> str:
    if not file.filename or not file.filename.endswith(".txt"):
        raise ValueError("Solo se aceptan archivos .txt")
    content = file.read()
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        return content.decode("latin-1")
