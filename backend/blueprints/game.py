from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.game import Game
from data.transaction import Actions, Transaction
from data.user_game import UserGame
from utils import get_json_values_from_req, permission_required, response_msg, use_db_session, use_user, use_user_try
from data.user import User


blueprint = Blueprint("game", __name__)


@blueprint.route("/api/game/reset", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def reset(db_sess: Session, user: User):
    game = Game.get(db_sess)
    game.winner = None
    game.startTime = None
    db_sess.query(UserGame).delete()
    db_sess.commit()
    return jsonify({"duration": game.duration}), 200


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


@blueprint.route("/api/game/price")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def price(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return jsonify({"price": game.price}), 200


@blueprint.route("/api/game/price", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_price(db_sess: Session, user: User):
    price = get_json_values_from_req("price")
    game = Game.get(db_sess)
    game.price = price
    db_sess.commit()
    return jsonify({"price": game.price}), 200


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


@blueprint.route("/api/game/finish", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def finish(db_sess: Session, user: User):
    team = get_json_values_from_req("team")
    Game.finish(db_sess, team)
    return jsonify(Game.get_state(db_sess, user)), 200


@blueprint.route("/api/game/state")
@use_db_session()
@use_user_try()
def state(db_sess: Session, user: User):
    return jsonify(Game.get_state(db_sess, user)), 200


@blueprint.route("/api/game/join", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def join(db_sess: Session, user: User):
    team = get_json_values_from_req("team")

    if team not in ["red", "blue", "green", "yellow"]:
        return response_msg(f"Wrong team: {team}"), 400

    state = Game.get_state(db_sess, user)
    game = Game.get(db_sess)

    if state["state"] != "join":
        return jsonify(Game.get_state(db_sess, user)), 200

    ur = db_sess.query(UserGame).filter(UserGame.userId == user.id).first()
    balance = user.balance
    if ur is None:
        if balance < game.price:
            return response_msg("Не хватает средств!"), 400
        user.balance = balance - game.price
        balance = user.balance
        Transaction.new(db_sess, user.id, 1, game.price, Actions.gameJoin, 1, True)
        UserGame.new(user, team)
    else:
        ur.team = team
        db_sess.commit()

    return jsonify(Game.get_state(db_sess, user)), 200
