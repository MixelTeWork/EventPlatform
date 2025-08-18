from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bafser import (Image, ImageJson, get_json_values_from_req, jsonify_list, permission_required, permission_required_any,
                    response_msg, response_not_found, use_db_session, use_user)
from data._operations import Operations
from data.store_item import StoreItem
from data.user import User


blueprint = Blueprint("store", __name__)


@blueprint.route("/api/store_items")
@use_db_session
def store_items(db_sess: Session):
    items = StoreItem.all(db_sess)
    return jsonify_list(items)


@blueprint.route("/api/store_items_full")
@jwt_required()
@use_db_session
@use_user()
@permission_required_any(Operations.page_staff_store, Operations.manage_store)
def store_items_full(db_sess: Session, user: User):
    items = StoreItem.all(db_sess)
    return jsonify_list(items, "get_dict_full")


@blueprint.post("/api/store_items")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.manage_store)
def store_item_add(db_sess: Session, user: User):
    name, price, count, img_data = get_json_values_from_req(("name", str), ("price", int), ("count", int), ("img", ImageJson, None))

    img = None
    if img_data is not None:
        img, image_error = Image.new(user, img_data)
        if image_error:
            return response_msg(image_error, 400)

    item = StoreItem.new(user, name, price, count, img.id if img is not None else None)

    return item.get_dict_full()


@blueprint.post("/api/store_items/<int:itemId>")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.manage_store)
def store_item_patch(itemId, db_sess: Session, user: User):
    name, price, count, img_data = get_json_values_from_req(("name", str, None), ("price", int, None), ("count", int, None), ("img", ImageJson, None))

    item = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    imgId = None
    if img_data is not None:
        img, image_error = Image.new(user, img_data)
        if image_error:
            return response_msg(image_error, 400)
        assert img
        imgId = img.id

    item.update(user, name, price, count, imgId)

    return item.get_dict_full()


@blueprint.post("/api/store_items/<int:itemId>/decrease")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.manage_store)
def store_item_decrease(itemId, db_sess: Session, user: User):
    item = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    item.decrease(user)

    return item.get_dict_full()


@blueprint.delete("/api/store_items/<int:itemId>")
@jwt_required()
@use_db_session
@use_user()
@permission_required(Operations.manage_store)
def store_item_delete(itemId, db_sess: Session, user: User):
    item = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    item.delete(user)

    return response_msg("ok")
