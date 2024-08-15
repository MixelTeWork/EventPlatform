from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.dialog_character import DialogCharacter
from data.image import Image
from data.operation import Operations
from data.dialog import Dialog
from data.user import User
from utils import (get_json_values_from_req, jsonify_list, permission_required, permission_required_any,
                   response_msg, response_not_found, use_db_session, use_user, use_user_try)


blueprint = Blueprint("dialog", __name__)


@blueprint.route("/api/dialog/<int:dialogId>")
@use_db_session()
def dialog(dialogId, db_sess: Session):
    dialog = Dialog.get(db_sess, dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    return jsonify(dialog.get_dict()), 200


@blueprint.route("/api/dialog/<int:dialogId>", methods=["POST"])
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

    return jsonify(dialog.get_dict()), 200


@blueprint.route("/api/dialog/characters")
@use_db_session()
def characters(db_sess: Session):
    items = DialogCharacter.all(db_sess)
    return jsonify_list(items), 200


@blueprint.route("/api/dialog/character", methods=["POST"])
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

    return jsonify(character.get_dict()), 200


@blueprint.route("/api/dialog/character/<int:characterId>", methods=["POST"])
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

    return jsonify(character.get_dict()), 200


@blueprint.route("/api/dialog/character/<int:characterId>", methods=["DELETE"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def character_delete(characterId, db_sess: Session, user: User):
    character = DialogCharacter.get(db_sess, characterId)
    if character is None:
        return response_not_found("character", characterId)

    character.delete(user)

    return response_msg("ok"), 200
