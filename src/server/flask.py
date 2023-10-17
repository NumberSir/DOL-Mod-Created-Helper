from flask import Flask, send_file
import os

from ..consts import DIR_MODLOADER_ROOT

app = Flask(
    "test-modloader",
    root_path=DIR_MODLOADER_ROOT,
    static_folder="/",
    static_url_path="/"
)


@app.route("/")
def main():
    html = None
    for file in os.listdir(DIR_MODLOADER_ROOT):
        if file.endswith(".html"):
            html = file

    if not html:
        raise

    return send_file(DIR_MODLOADER_ROOT / html)
