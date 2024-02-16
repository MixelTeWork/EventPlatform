from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.image import Image
from data.operation import Operations
from data.store_item import StoreItem
from data.user import User
from utils import (get_json_values_from_req, jsonify_list, permission_required,
                   permission_required_any, response_msg, response_not_found, use_db_session, use_user)


blueprint = Blueprint("store", __name__)


@blueprint.route("/api/store_items")
@use_db_session()
def store_items(db_sess: Session):
    items = StoreItem.all(db_sess)
    return jsonify_list(items), 200


@blueprint.route("/api/store_items_full")
@jwt_required()
@use_db_session()
@use_user()
@permission_required_any(Operations.page_worker_store, Operations.manage_store)
def store_items_full(db_sess: Session, user: User):
    items = StoreItem.all(db_sess)
    return jsonify_list(items, "get_dict_full"), 200


@blueprint.route("/api/store_item", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_store)
def store_item_add(db_sess: Session, user: User):
    (name, price, count, img_data), errorRes = get_json_values_from_req("name", "price", "count", ("img", None))
    if errorRes:
        return errorRes

    if img_data is not None:
        img, image_error = Image.new(db_sess, user, img_data)
        if image_error:
            return response_msg(image_error), 400

    item = StoreItem.new(db_sess, user, name, price, count, img.id if img_data is not None else None)

    return jsonify(item.get_dict_full()), 200


@blueprint.route("/api/store_item/<int:itemId>", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_store)
def store_item_patch(itemId, db_sess: Session, user: User):
    (name, price, count, img_data), errorRes = get_json_values_from_req(("name", None), ("price", None), ("count", None), ("img", None))
    if errorRes:
        return errorRes

    item = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    img = None
    if img_data is not None:
        img, image_error = Image.new(db_sess, user, img_data)
        if image_error:
            return response_msg(image_error), 400

    item.update(user, name, price, count, img)

    return jsonify(item.get_dict_full()), 200


@blueprint.route("/api/store_item/<int:itemId>/decrease", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_store)
def store_item_decrease(itemId, db_sess: Session, user: User):
    item: StoreItem = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    item.decrease(user)

    return jsonify(item.get_dict_full()), 200


@blueprint.route("/api/store_item/<int:itemId>", methods=["DELETE"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_store)
def store_item_delete(itemId, db_sess: Session, user: User):
    item = StoreItem.get(db_sess, itemId)
    if item is None:
        return response_not_found("item", itemId)

    image: Image = item.image
    if image is not None:
        image.delete(user)

    item.delete(user)

    return response_msg("ok"), 200
