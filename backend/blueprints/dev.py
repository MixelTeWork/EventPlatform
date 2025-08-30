import math

from bafser import (Log, get_json_values_from_req, get_log_fpath, jsonify_list, permission_required, update_message_to_frontend, use_db_session,
                    use_user)
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

import bafser_config
from data._operations import Operations
from data.user import User

blueprint = Blueprint("dev", __name__)
PSIZE = 100


@blueprint.route("/api/dev/log")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log(db_sess: Session, user: User):
    p = request.args.get("p", 0, type=int)
    if p < 0:
        return jsonify_list([])
    log = db_sess.query(Log).order_by(Log.date.desc()).limit(PSIZE).offset(p * PSIZE).all()
    return jsonify_list(log)


@blueprint.post("/api/dev/set_msg")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def set_msg(db_sess: Session, user: User):
    msg = get_json_values_from_req(("msg", str))
    update_message_to_frontend(msg)
    return {"msg": msg}


@blueprint.route("/api/dev/log_len")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log_len(db_sess: Session, user: User):
    count = db_sess.query(Log).count()
    return {"len": math.ceil(count / PSIZE)}


@blueprint.route("/api/dev/log_info")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log_info(db_sess: Session, user: User):
    return last_n_lines(get_log_fpath(bafser_config.log_info_path), 256)


@blueprint.route("/api/dev/log_requests")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log_requests(db_sess: Session, user: User):
    return last_n_lines(get_log_fpath(bafser_config.log_requests_path), 256)


@blueprint.route("/api/dev/log_errors")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log_errors(db_sess: Session, user: User):
    return last_n_lines(get_log_fpath(bafser_config.log_errors_path), 256)


@blueprint.route("/api/dev/log_frontend")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.page_dev)
def dev_log_frontend(db_sess: Session, user: User):
    return last_n_lines(get_log_fpath(bafser_config.log_frontend_path), 256)


def last_n_lines(filename, n=1):
    lines = ["" for _ in range(n)]
    i = 0
    with open(filename, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            lines[i] = line
            i += 1
            i = i % n
    return "".join(lines[(j + i) % n] for j in range(n))
