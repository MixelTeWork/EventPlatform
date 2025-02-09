from datetime import timedelta
from typing import Callable, Literal, Union
import json
import logging
import os
import time
import traceback

from flask import Flask, Response, abort, g, make_response, redirect, request, send_from_directory
from flask_jwt_extended import JWTManager, get_jwt_identity, verify_jwt_in_request
from urllib.parse import quote

from bfs.scripts.init_db_values import init_db_values

from . import db_session
from .logger import setLogging
from .utils import register_blueprints, get_json, get_secret_key, randstr, response_msg
import bfs_config


class AppConfig():
    is_admin_default = False
    data_folders: list[tuple[str, str]] = []
    config: list[tuple[str, str]] = []

    def __init__(self,
                 FRONTEND_FOLDER="build",
                 IMAGES_FOLDER="images",
                 JWT_ACCESS_TOKEN_EXPIRES: Union[Literal[False], timedelta] = False,
                 CACHE_MAX_AGE=31536000,
                 MESSAGE_TO_FRONTEND="",
                 STATIC_FOLDERS: list[str] = ["/static/", "/fonts/"],
                 DEV_MODE=False,
                 DELAY_MODE=False,
                 ):
        self.FRONTEND_FOLDER = FRONTEND_FOLDER
        self.IMAGES_FOLDER = IMAGES_FOLDER
        self.JWT_ACCESS_TOKEN_EXPIRES = JWT_ACCESS_TOKEN_EXPIRES
        self.CACHE_MAX_AGE = CACHE_MAX_AGE
        self.MESSAGE_TO_FRONTEND = MESSAGE_TO_FRONTEND
        self.STATIC_FOLDERS = STATIC_FOLDERS
        self.DEV_MODE = DEV_MODE
        self.DELAY_MODE = DELAY_MODE
        self.add_data_folder("IMAGES_FOLDER", IMAGES_FOLDER)
        self.add("CACHE_MAX_AGE", CACHE_MAX_AGE)

    def add(self, key: str, value: str):
        self.config.append((key, value))
        return self

    def add_data_folder(self, key: str, path: str):
        self.add(key, path)
        self.data_folders.append((key, path))
        return self

    def add_secret_key(self, key: str, path: str):
        self.add(key, get_secret_key(path))
        return self


def create_app(import_name: str, config: AppConfig):
    setLogging()
    app = Flask(import_name, static_folder=None)
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_SECRET_KEY"] = get_secret_key(bfs_config.jwt_key_file_path)
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = config.JWT_ACCESS_TOKEN_EXPIRES
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False
    app.config["JWT_SESSION_COOKIE"] = False
    for (key, path) in config.config:
        app.config[key] = path

    jwt_manager = JWTManager(app)

    def run(run_app: bool, init_dev_values: Callable[[], None], port=5000):
        for (_, path) in config.data_folders:
            if not os.path.exists(path):
                os.makedirs(path)

        if config.DEV_MODE:
            if not os.path.exists(bfs_config.db_dev_path):
                os.makedirs(os.path.dirname(bfs_config.db_dev_path), exist_ok=True)
                init_db_values(True)
                init_dev_values()

        db_session.global_init(config.DEV_MODE)

        if not config.DEV_MODE:
            check_is_admin_default()

        register_blueprints(app)
        if run_app:
            print("Starting")
            if config.DELAY_MODE:
                print("Delay for requests is enabled")
            app.run(debug=True, port=port)

    def check_is_admin_default():
        from . import UserBase
        db_sess = db_session.create_session()
        admin = UserBase.get_by_login(db_sess, "admin", includeDeleted=True)
        if admin is not None:
            config.is_admin_default = admin.check_password("admin")
        db_sess.close()

    @app.before_request
    def before_request():
        g.json = get_json(request)
        g.req_id = randstr(4)
        if verify_jwt_in_request(optional=True):
            jwt_identity = get_jwt_identity()
            if isinstance(jwt_identity, (list, tuple)) and len(jwt_identity) == 2:
                g.userId = jwt_identity[0]
        if request.path.startswith(bfs_config.api_url):
            try:
                if g.json[1]:
                    if "password" in g.json[0]:
                        password = g.json[0]["password"]
                        g.json[0]["password"] = "***"
                        data = json.dumps(g.json[0])[:512]
                        g.json[0]["password"] = password
                    else:
                        data = json.dumps(g.json[0])[:512]
                    logging.info("Request;;%(data)s", {"data": data})
                else:
                    logging.info("Request")
            except Exception as x:
                logging.error("Request logging error: %s", x)

        if config.DELAY_MODE:
            time.sleep(0.5)
        if config.is_admin_default:
            check_is_admin_default()
            if config.is_admin_default:
                # Admin password must be changed
                return response_msg("Security error")

    @app.after_request
    def after_request(response: Response):
        if request.path.startswith(bfs_config.api_url):
            try:
                if response.content_type == "application/json":
                    logging.info("Response;%s;%s", response.status_code, str(response.data)[:512])
                else:
                    logging.info("Response;%s", response.status_code)
            except Exception as x:
                logging.error("Request logging error: %s", x)
        response.set_cookie("MESSAGE_TO_FRONTEND", quote(config.MESSAGE_TO_FRONTEND))
        return response

    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def frontend(path):
        if request.path.startswith(bfs_config.api_url):
            abort(404)
        if path != "" and os.path.exists(config.FRONTEND_FOLDER + "/" + path):
            res = send_from_directory(config.FRONTEND_FOLDER, path)
            if any(request.path.startswith(path) for path in config.STATIC_FOLDERS):
                res.headers.set("Cache-Control", f"public,max-age={config.CACHE_MAX_AGE},immutable")
            else:
                res.headers.set("Cache-Control", "no_cache")
            return res
        else:
            res = send_from_directory(config.FRONTEND_FOLDER, "index.html")
            res.headers.set("Cache-Control", "no_cache")
            return res

    @app.errorhandler(404)
    def not_found(error):
        if request.path.startswith(bfs_config.api_url):
            return response_msg("Not found", 404)
        return make_response("Страница не найдена", 404)

    @app.errorhandler(405)
    def method_not_allowed(error):
        return response_msg("Method Not Allowed", 405)

    @app.errorhandler(415)
    def unsupported_media_type(error):
        return response_msg("Unsupported Media Type", 415)

    @app.errorhandler(403)
    def no_permission(error):
        return response_msg("No permission", 403)

    @app.errorhandler(500)
    @app.errorhandler(Exception)
    def internal_server_error(error):
        print(error)
        logging.error("%s\n%s", error, traceback.format_exc())
        if request.path.startswith(bfs_config.api_url):
            return response_msg("Internal Server Error", 500)
        return make_response("Произошла ошибка", 500)

    @app.errorhandler(401)
    def unauthorized(error):
        if request.path.startswith(bfs_config.api_url):
            return response_msg("Unauthorized", 401)
        return redirect(bfs_config.login_page_url)

    @jwt_manager.expired_token_loader
    def expired_token_loader(jwt_header, jwt_data):
        return response_msg("The JWT has expired", 401)

    @jwt_manager.invalid_token_loader
    def invalid_token_loader(error):
        return response_msg("Invalid JWT", 401)

    @jwt_manager.unauthorized_loader
    def unauthorized_loader(error):
        return response_msg("Unauthorized", 401)

    return app, run
