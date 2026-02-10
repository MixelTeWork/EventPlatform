from bafser import (
    Image,
    ImageJson,
    JsonObj,
    JsonOpt,
    TJson,
    Undefined,
    doc_api,
    get_json_values_from_req,
    jsonify_list,
    protected_route,
    response_msg,
    response_not_found,
)
from flask import Blueprint

from data import Operations
from data.tourney import Tourney, TurneyDict
from data.tourney_character import TourneyCharacter, TourneyCharacterDict

bp = Blueprint("tourney", __name__)
UD = Undefined.default
U = Undefined.defined


@bp.route("/api/tourney")
@doc_api(res=TurneyDict, desc="Get tourney")
@protected_route(perms=Operations.manage_games)
def tourney():
    return Tourney.get2().get_dict()


@bp.post("/api/tourney/nodes/<int:nodeId>")
@doc_api(req=TJson["characterId", int], res=TurneyDict, desc="Edit tourney node")
@protected_route(perms=Operations.manage_games)
def edit_node(nodeId: int):
    characterId = get_json_values_from_req(("characterId", int))

    tourney = Tourney.get2()
    r = tourney.edit_node(nodeId, characterId)
    if not r:
        return response_not_found("node", nodeId)

    return tourney.get_dict()


@bp.post("/api/tourney/third")
@doc_api(req=TJson["characterId", int], res=TurneyDict, desc="Edit third place")
@protected_route(perms=Operations.manage_games)
def set_third():
    characterId = get_json_values_from_req(("characterId", int))

    tourney = Tourney.get2()
    tourney.set_third(characterId)

    return tourney.get_dict()


@bp.post("/api/tourney/start_game_at_node")
@doc_api(req=TJson["nodeId", int], res=TurneyDict, desc="Start game at node")
@protected_route(perms=Operations.manage_games)
def start_game_at_node():
    nodeId = get_json_values_from_req(("nodeId", int))

    tourney = Tourney.get2()
    r = tourney.start_game_at_node(nodeId)
    if r >= 0:
        return tourney.get_dict()

    if r == -1:
        return response_not_found("node", nodeId)
    if r == -2:
        return response_msg("node hasnt children", 400)
    if r == -3:
        return response_msg("node children is unwon", 400)
    return response_msg("err", 400)


@bp.post("/api/tourney/select_next_game")
@doc_api(res=TurneyDict, desc="Select next game node")
@protected_route(perms=Operations.manage_games)
def select_next_game():
    tourney = Tourney.get2()
    tourney.select_next_game()
    return tourney.get_dict()


@bp.post("/api/tourney/start_game")
@doc_api(res=TurneyDict, desc="Start game at current node")
@protected_route(perms=Operations.manage_games)
def start_game():
    tourney = Tourney.get2()
    r = tourney.start_game()
    if r >= 0:
        return tourney.get_dict()

    if r == -1:
        return response_msg("cur game not selected", 400)
    if r == -2 or r == -3:
        return response_msg(f"wrong cur game selected {r=}", 400)
    return response_msg("err", 400)


@bp.post("/api/tourney/end_game")
@doc_api(res=TurneyDict, desc="End current game")
@protected_route(perms=Operations.manage_games)
def end_game():
    tourney = Tourney.get2()
    tourney.end_game()
    return tourney.get_dict()


@bp.post("/api/tourney/show_pretourney")
@doc_api(res=TurneyDict, desc="Show pretourney screen to players")
@protected_route(perms=Operations.manage_games)
def show_pretourney():
    tourney = Tourney.get2()
    tourney.show_pretourney()
    return tourney.get_dict()


@bp.post("/api/tourney/end_tourney")
@doc_api(res=TurneyDict, desc="End tourney")
@protected_route(perms=Operations.manage_games)
def end_tourney():
    tourney = Tourney.get2()
    tourney.end_tourney()
    return tourney.get_dict()


@bp.post("/api/tourney/unend_tourney")
@doc_api(res=TurneyDict, desc="Cancel tourney end")
@protected_route(perms=Operations.manage_games)
def unend_tourney():
    tourney = Tourney.get2()
    tourney.unend_tourney()
    return tourney.get_dict()


@bp.post("/api/tourney/reset")
@doc_api(res=TurneyDict, desc="Full reset of tourney")
@protected_route(perms=Operations.manage_games)
def reset():
    tourney = Tourney.get2()
    tourney.reset()
    return tourney.get_dict()


@bp.route("/api/tourney/characters")
@doc_api(res=list[TourneyCharacterDict], desc="Get all tourney characters")
@protected_route()
def characters():
    return jsonify_list(TourneyCharacter.all2())


class TourneyCharacterJson(JsonObj):
    name: str
    color: str
    img: ImageJson


@bp.post("/api/tourney/characters")
@doc_api(req=TourneyCharacterJson, res=TourneyCharacterDict, desc="Add tourney character")
@protected_route(perms=Operations.manage_games)
def add_character():
    data = TourneyCharacterJson.get_from_req()

    img, image_error = Image.new2(data.img)
    if image_error:
        return response_msg(image_error, 400)
    assert img

    character = TourneyCharacter.new(data.name, data.color, img.id)

    return character.get_dict()


class TourneyCharacterEditJson(JsonObj):
    name: JsonOpt[str]
    color: JsonOpt[str]
    img: JsonOpt[ImageJson]


@bp.post("/api/tourney/characters/<int:characterId>")
@doc_api(req=TourneyCharacterEditJson, res=TourneyCharacterDict, desc="Edit tourney character")
@protected_route(perms=Operations.manage_games)
def store_item_patch(characterId: int):
    data = TourneyCharacterEditJson.get_from_req()

    character = TourneyCharacter.get2(characterId)
    if character is None:
        return response_not_found("tourneyCharacter", characterId)

    imgId = None
    if U(data.img):
        img, image_error = Image.new2(data.img)
        if image_error:
            return response_msg(image_error, 400)
        assert img
        imgId = img.id

    character.update(UD(data.name), UD(data.color), imgId)

    return character.get_dict()


@bp.delete("/api/tourney/characters/<int:characterId>")
@doc_api(desc="Delete tourney character")
@protected_route(perms=Operations.manage_games)
def delete_character(characterId: int):
    character = TourneyCharacter.get2(characterId)
    if character is None:
        return response_not_found("tourneyCharacter", characterId)

    character.delete2()

    return response_msg("ok")
