import math

from bafser import Log, get_json_values_from_req, get_log_fpath, jsonify_list, protected_route, update_message_to_frontend, use_db_sess
from flask import Blueprint, request
from sqlalchemy.orm import Session

import bafser_config
from data import Operations

blueprint = Blueprint("dev", __name__)
PSIZE = 100


@blueprint.route("/api/dev/log")
@protected_route(perms=Operations.page_dev)
@use_db_sess
def dev_log(db_sess: Session):
    p = request.args.get("p", 0, type=int)
    if p < 0:
        return jsonify_list([])
    log = db_sess.query(Log).order_by(Log.date.desc()).limit(PSIZE).offset(p * PSIZE).all()
    return jsonify_list(log)


@blueprint.post("/api/dev/set_msg")
@protected_route(perms=Operations.page_dev)
def set_msg():
    msg = get_json_values_from_req(("msg", str))
    update_message_to_frontend(msg)
    return {"msg": msg}


@blueprint.route("/api/dev/log_len")
@protected_route(perms=Operations.page_dev)
@use_db_sess
def dev_log_len(db_sess: Session):
    count = db_sess.query(Log).count()
    return {"len": math.ceil(count / PSIZE)}


@blueprint.route("/api/dev/log_info")
@protected_route(perms=Operations.page_dev)
def dev_log_info():
    return last_n_lines(get_log_fpath(bafser_config.log_info_path), 256)


@blueprint.route("/api/dev/log_requests")
@protected_route(perms=Operations.page_dev)
def dev_log_requests():
    return last_n_lines(get_log_fpath(bafser_config.log_requests_path), 256)


@blueprint.route("/api/dev/log_errors")
@protected_route(perms=Operations.page_dev)
def dev_log_errors():
    return last_n_lines(get_log_fpath(bafser_config.log_errors_path), 256)


@blueprint.route("/api/dev/log_frontend")
@protected_route(perms=Operations.page_dev)
def dev_log_frontend():
    return last_n_lines(get_log_fpath(bafser_config.log_frontend_path), 256)


def last_n_lines(filename: str, n: int = 1):
    lines = ["" for _ in range(n)]
    i = 0
    with open(filename, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            lines[i] = line
            i += 1
            i = i % n
    return "".join(lines[(j + i) % n] for j in range(n))
