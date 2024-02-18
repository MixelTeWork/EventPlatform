from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.race import Race
from data.transaction import Actions, Transaction
from data.user_race import UserRace
from utils import get_json_values_from_req, permission_required, response_msg, use_db_session, use_user, use_user_try
from data.user import User


blueprint = Blueprint("race", __name__)


@blueprint.route("/api/race/reset", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def reset(db_sess: Session, user: User):
    race = Race.get(db_sess)
    race.winner = None
    race.startTime = None
    db_sess.query(UserRace).delete()
    db_sess.commit()
    return jsonify({"duration": race.duration}), 200


@blueprint.route("/api/race/duration")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def duration(db_sess: Session, user: User):
    race = Race.get(db_sess)
    return jsonify({"duration": race.duration}), 200


@blueprint.route("/api/race/duration", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_duration(db_sess: Session, user: User):
    (duration, ), errorRes = get_json_values_from_req("duration")
    if errorRes:
        return errorRes
    race = Race.get(db_sess)
    race.duration = duration
    db_sess.commit()
    return jsonify({"duration": race.duration}), 200


@blueprint.route("/api/race/counter")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def counter(db_sess: Session, user: User):
    race = Race.get(db_sess)
    return jsonify({"counter": race.counter}), 200


@blueprint.route("/api/race/counter", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_counter(db_sess: Session, user: User):
    (counter, ), errorRes = get_json_values_from_req("counter")
    if errorRes:
        return errorRes
    race = Race.get(db_sess)
    race.counter = counter
    db_sess.commit()
    return jsonify({"counter": race.counter}), 200


@blueprint.route("/api/race/price")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def price(db_sess: Session, user: User):
    race = Race.get(db_sess)
    return jsonify({"price": race.price}), 200


@blueprint.route("/api/race/price", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_price(db_sess: Session, user: User):
    (price, ), errorRes = get_json_values_from_req("price")
    if errorRes:
        return errorRes
    race = Race.get(db_sess)
    race.price = price
    db_sess.commit()
    return jsonify({"price": race.price}), 200


@blueprint.route("/api/race/startStr")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def startStr(db_sess: Session, user: User):
    race = Race.get(db_sess)
    return jsonify({"startStr": race.startStr}), 200


@blueprint.route("/api/race/startStr", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_startStr(db_sess: Session, user: User):
    (startStr, ), errorRes = get_json_values_from_req("startStr")
    if errorRes:
        return errorRes
    race = Race.get(db_sess)
    race.startStr = startStr
    db_sess.commit()
    return jsonify({"startStr": race.startStr}), 200


@blueprint.route("/api/race/start", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def start(db_sess: Session, user: User):
    Race.start(db_sess)
    return response_msg("ok"), 200


@blueprint.route("/api/race/finish", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def finish(db_sess: Session, user: User):
    (team, ), errorRes = get_json_values_from_req("team")
    if errorRes:
        return errorRes
    Race.finish(db_sess, team)
    return jsonify(Race.get_state(db_sess, user)), 200


@blueprint.route("/api/race/state")
@use_db_session()
@use_user_try()
def state(db_sess: Session, user: User):
    return jsonify(Race.get_state(db_sess, user)), 200


@blueprint.route("/api/race/join", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def join(db_sess: Session, user: User):
    (team, ), errorRes = get_json_values_from_req("team")
    if errorRes:
        return errorRes

    if team not in ["red", "blue", "green", "yellow"]:
        return response_msg(f"Wrong team: {team}"), 400

    state = Race.get_state(db_sess, user)
    race = Race.get(db_sess)

    if state["state"] != "join":
        return jsonify(Race.get_state(db_sess, user)), 200

    ur = db_sess.query(UserRace).filter(UserRace.userId == user.id).first()
    balance = user.balance
    if ur is None:
        if balance < race.price:
            return response_msg("Не хватает средств!"), 400
        user.balance = balance - race.price
        balance = user.balance
        Transaction.new(db_sess, user.id, 1, race.price, Actions.raceJoin, 1, True)
        UserRace.new(db_sess, user, team)
    else:
        ur.team = team
        db_sess.commit()

    return jsonify(Race.get_state(db_sess, user)), 200
