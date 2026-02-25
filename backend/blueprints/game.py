import logging

from bafser import TJson, doc_api, get_json_list_from_req, get_json_values_from_req, get_userId, protected_route, use_db_sess
from flask import Blueprint
from sqlalchemy.orm import Session

from data import Operations
from data.game import Game, GameDict, GameState
from data.game_start_time import GameStartTime

bp = Blueprint("game", __name__)


@bp.route("/api/game/duration")
@doc_api(res=TJson["duration", int])
@protected_route(perms=Operations.manage_games)
def duration():
    game = Game.get2()
    return {"duration": game.duration}


@bp.post("/api/game/duration")
@doc_api(req=TJson["duration", int], res=TJson["duration", int])
@protected_route(perms=Operations.manage_games)
def set_duration():
    duration = get_json_values_from_req(("duration", int))
    game = Game.get2()
    game.duration = duration
    game.db_sess.commit()
    logging.info(f"set {duration=}")
    return {"duration": game.duration}


@bp.route("/api/game/countdown")
@doc_api(res=TJson["counter", int])
@protected_route(perms=Operations.manage_games)
def countdown():
    game = Game.get2()
    return {"counter": game.countdown}


@bp.post("/api/game/countdown")
@doc_api(req=TJson["counter", int], res=TJson["counter", int])
@protected_route(perms=Operations.manage_games)
def set_countdown():
    counter = get_json_values_from_req(("counter", int))
    game = Game.get2()
    game.countdown = counter
    game.db_sess.commit()
    logging.info(f"set {counter=}")
    return {"counter": game.countdown}


@bp.route("/api/game/startStr")
@doc_api(res=TJson["startStr", str])
@protected_route(perms=Operations.manage_games)
def startStr():
    game = Game.get2()
    return {"startStr": game.startStr}


@bp.post("/api/game/startStr")
@doc_api(req=TJson["startStr", str], res=TJson["startStr", str])
@protected_route(perms=Operations.manage_games)
def set_startStr():
    startStr = get_json_values_from_req(("startStr", str))
    game = Game.get2()
    game.startStr = startStr
    game.db_sess.commit()
    logging.info(f"set {startStr=}")
    return {"startStr": game.startStr}


@bp.route("/api/game/startPhrase")
@doc_api(res=TJson["startPhrase", str])
@protected_route(perms=Operations.manage_games)
def startPhrase():
    game = Game.get2()
    return {"startPhrase": game.startPhrase}


@bp.post("/api/game/startPhrase")
@doc_api(req=TJson["startPhrase", str], res=TJson["startPhrase", str])
@protected_route(perms=Operations.manage_games)
def set_startPhrase():
    startPhrase = get_json_values_from_req(("startPhrase", str))
    game = Game.get2()
    game.startPhrase = startPhrase
    game.db_sess.commit()
    logging.info(f"set {startPhrase=}")
    return {"startPhrase": game.startPhrase}


@bp.route("/api/game/start_times")
@doc_api(res=list[str])
@protected_route(perms=Operations.manage_games)
def start_times():
    return GameStartTime.get_all()


@bp.post("/api/game/start_times")
@doc_api(req=list[str], res=list[str])
@protected_route(perms=Operations.manage_games)
def set_start_times():
    start_times = get_json_list_from_req(str)
    GameStartTime.update(start_times)
    logging.info(f"set start_times=[{', '.join(start_times)}]")
    return GameStartTime.get_all()


@bp.route("/api/game/state")
@doc_api(res=GameDict)
@use_db_sess
def state(db_sess: Session):
    return Game.get_state(db_sess, userId=get_userId())


@bp.route("/api/game/state_full")
@doc_api(res=GameDict)
@protected_route(perms=Operations.manage_games)
@use_db_sess
def state_full(db_sess: Session):
    return Game.get_state_update(db_sess)


@bp.post("/api/game/click")
@doc_api(res=GameDict)
@protected_route()
@use_db_sess
def click(db_sess: Session):
    count = get_json_values_from_req(("count", int))
    usergame: Game.Tget_state_out_usergame = {"v": None}
    state = Game.get_state(db_sess, userId=get_userId(), out_usergame=usergame)
    if state["state"] == GameState.going:
        ug = usergame["v"]
        if ug and not ug.click(count):
            return "", 429
    return state


@bp.post("/api/game/select_team")
@doc_api(res=GameDict)
@protected_route()
@use_db_sess
def select_team(db_sess: Session):
    team = get_json_values_from_req(("team", int))
    usergame: Game.Tget_state_out_usergame = {"v": None}
    state = Game.get_state(db_sess, userId=get_userId(), out_usergame=usergame)
    ug = usergame["v"]
    if ug:
        ug.set_team(team)
        state["team"] = team
    return state
