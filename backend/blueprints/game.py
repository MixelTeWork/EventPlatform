from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.game import Game, GameState
from data.user_game import UserGame
from utils import get_json_values_from_req, permission_required, response_msg, use_db_session, use_user
from data.user import User


blueprint = Blueprint("game", __name__)


@blueprint.route("/api/game/duration")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def duration(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return jsonify({"duration": game.duration}), 200


@blueprint.route("/api/game/duration", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_duration(db_sess: Session, user: User):
    duration = get_json_values_from_req("duration")
    game = Game.get(db_sess)
    game.duration = duration
    db_sess.commit()
    return jsonify({"duration": game.duration}), 200


@blueprint.route("/api/game/counter")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def counter(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return jsonify({"counter": game.counter}), 200


@blueprint.route("/api/game/counter", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_counter(db_sess: Session, user: User):
    counter = get_json_values_from_req("counter")
    game = Game.get(db_sess)
    game.counter = counter
    db_sess.commit()
    return jsonify({"counter": game.counter}), 200


@blueprint.route("/api/game/startStr")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def startStr(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return jsonify({"startStr": game.startStr}), 200


@blueprint.route("/api/game/startStr", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_startStr(db_sess: Session, user: User):
    startStr = get_json_values_from_req("startStr")
    game = Game.get(db_sess)
    game.startStr = startStr
    db_sess.commit()
    return jsonify({"startStr": game.startStr}), 200


@blueprint.route("/api/game/start", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def start(db_sess: Session, user: User):
    Game.start(db_sess)
    return response_msg("ok"), 200


@blueprint.route("/api/game/reset", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def reset(db_sess: Session, user: User):
    Game.reset(db_sess)
    return response_msg("ok"), 200


@blueprint.route("/api/game/state")
@use_db_session()
def state(db_sess: Session):
    return jsonify(Game.get_state(db_sess)), 200


@blueprint.route("/api/game/state_full")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def state_full(db_sess: Session):
    return jsonify(Game.get_state_update(db_sess)), 200


@blueprint.route("/api/game/click", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def click(db_sess: Session, user: User):
    count = get_json_values_from_req("count")
    state = Game.get_state(db_sess)
    if state["state"] == GameState.going:
        if not UserGame.click(user, count):
            return "", 429
    return jsonify(state), 200
