from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bfs import Image, get_json_values_from_req, jsonify_list, permission_required, response_msg, response_not_found, use_db_session, use_user
from data._operations import Operations
from data.tourney import Tourney
from data.tourney_character import TourneyCharacter
from data.user import User


blueprint = Blueprint("tourney", __name__)


@blueprint.route("/api/tourney")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def tourney(db_sess: Session, user: User):
    tourney = Tourney.get(db_sess)
    return tourney.get_dict()


@blueprint.post("/api/tourney/nodes/<int:nodeId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def edit_node(nodeId, db_sess: Session, user: User):
    characterId = get_json_values_from_req("characterId")

    tourney = Tourney.get(db_sess)
    r = tourney.edit_node(nodeId, characterId)
    if not r:
        return response_not_found("node", nodeId)

    return tourney.get_dict()


@blueprint.post("/api/tourney/third")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def set_third(db_sess: Session, user: User):
    characterId = get_json_values_from_req("characterId")

    tourney = Tourney.get(db_sess)
    tourney.set_third(characterId)

    return tourney.get_dict()


@blueprint.route("/api/tourney/characters")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def characters(db_sess: Session, user: User):
    characters = TourneyCharacter.all(db_sess)
    return jsonify_list(characters)


@blueprint.post("/api/tourney/characters")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def add_character(db_sess: Session, user: User):
    name, color, img_data = get_json_values_from_req("name", "color", "img")

    img, image_error = Image.new(user, img_data)
    if image_error:
        return response_msg(image_error, 400)

    character = TourneyCharacter.new(user, name, color, img.id)

    return character.get_dict()


@blueprint.post("/api/tourney/characters/<int:characterId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def store_item_patch(characterId, db_sess: Session, user: User):
    name, color, img_data = get_json_values_from_req(("name", None), ("color", None), ("img", None))

    character = TourneyCharacter.get(db_sess, characterId)
    if character is None:
        return response_not_found("tourneyCharacter", characterId)

    imgId = None
    if img_data is not None:
        img, image_error = Image.new(user, img_data)
        if image_error:
            return response_msg(image_error, 400)
        imgId = img.id

    character.update(user, name, color, imgId)

    return character.get_dict()


@blueprint.delete("/api/tourney/characters/<int:characterId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_games)
def delete_character(characterId, db_sess: Session, user: User):
    character = TourneyCharacter.get(db_sess, characterId)
    if character is None:
        return response_not_found("tourneyCharacter", characterId)

    character.delete(user)

    return response_msg("ok")
