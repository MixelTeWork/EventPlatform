from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bafser import get_json_values_from_req, permission_required, use_db_session, use_user, use_userId, use_userId_optional, use_user_optional
from data._operations import Operations
from data.game import Game, GameState
from data.user import User
from data.user_game import UserGame


blueprint = Blueprint("game", __name__)


@blueprint.route("/api/game/duration")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def duration(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return {"duration": game.duration}


@blueprint.post("/api/game/duration")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_duration(db_sess: Session, user: User):
    duration = get_json_values_from_req("duration")
    game = Game.get(db_sess)
    game.duration = duration
    db_sess.commit()
    return {"duration": game.duration}


@blueprint.route("/api/game/countdown")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def countdown(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return {"counter": game.counter}


@blueprint.post("/api/game/countdown")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_countdown(db_sess: Session, user: User):
    counter = get_json_values_from_req("counter")
    game = Game.get(db_sess)
    game.counter = counter
    db_sess.commit()
    return {"counter": game.counter}


@blueprint.route("/api/game/startStr")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def startStr(db_sess: Session, user: User):
    game = Game.get(db_sess)
    return {"startStr": game.startStr}


@blueprint.post("/api/game/startStr")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_startStr(db_sess: Session, user: User):
    startStr = get_json_values_from_req("startStr")
    game = Game.get(db_sess)
    game.startStr = startStr
    db_sess.commit()
    return {"startStr": game.startStr}


@blueprint.route("/api/game/state")
@use_db_session()
@use_userId_optional()
def state(db_sess: Session, userId: int):
    return Game.get_state(db_sess, userId=userId)


@blueprint.route("/api/game/state_full")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def state_full(db_sess: Session, user: User):
    return Game.get_state_update(db_sess)


@blueprint.post("/api/game/click")
@jwt_required()
@use_db_session()
@use_userId()
def click(db_sess: Session, userId: int):
    count = get_json_values_from_req("count")
    usergame = {"v": None}
    state = Game.get_state(db_sess, userId=userId, usergame=usergame)
    if state["state"] == GameState.going:
        ug: UserGame = usergame["v"]
        if ug and not ug.click(count):
            return "", 429
    return state


@blueprint.post("/api/game/select_team")
@jwt_required()
@use_db_session()
@use_userId()
def select_team(db_sess: Session, userId: int):
    team = get_json_values_from_req("team")
    usergame = {"v": None}
    state = Game.get_state(db_sess, userId=userId, usergame=usergame)
    ug: UserGame = usergame["v"]
    if ug:
        ug.set_team(team)
        state["team"] = team
    return state
