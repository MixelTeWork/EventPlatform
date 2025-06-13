from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bafser import Image, get_json_values_from_req, jsonify_list, permission_required, response_msg, response_not_found, use_db_session, use_user
from data._operations import Operations
from data.dialog import Dialog
from data.dialog_character import DialogCharacter
from data.user import User


blueprint = Blueprint("dialog", __name__)


@blueprint.route("/api/dialog/<int:dialogId>")
@use_db_session()
def dialog(dialogId, db_sess: Session):
    dialog = Dialog.get(db_sess, dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    return dialog.get_dict()


@blueprint.post("/api/dialog/<int:dialogId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def dialog_edit(dialogId, db_sess: Session, user: User):
    data = get_json_values_from_req("data")

    dialog = Dialog.get(db_sess, dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    dialog.update(user, data)

    return dialog.get_dict()


@blueprint.route("/api/dialog/characters")
@use_db_session()
def characters(db_sess: Session):
    items = DialogCharacter.all(db_sess)
    return jsonify_list(items)


@blueprint.post("/api/dialog/character")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def character_add(db_sess: Session, user: User):
    name, img_data, orien = get_json_values_from_req("name", "img", "orien")

    img, image_error = Image.new(user, img_data)
    if image_error:
        return response_msg(image_error), 400

    character = DialogCharacter.new(user, name, img.id, orien)

    return character.get_dict()


@blueprint.post("/api/dialog/character/<int:characterId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def character_edit(characterId, db_sess: Session, user: User):
    name, img_data, orien = get_json_values_from_req(("name", None), ("img", None), ("orien", None))

    character = DialogCharacter.get(db_sess, characterId)
    if character is None:
        return response_not_found("character", characterId)

    imgId = None
    if img_data is not None:
        img, image_error = Image.new(user, img_data)
        if image_error:
            return response_msg(image_error), 400
        imgId = img.id

    character.update(user, name, imgId, orien)

    return character.get_dict()


@blueprint.delete("/api/dialog/character/<int:characterId>")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def character_delete(characterId, db_sess: Session, user: User):
    character = DialogCharacter.get(db_sess, characterId)
    if character is None:
        return response_not_found("character", characterId)

    character.delete(user)

    return response_msg("ok")
