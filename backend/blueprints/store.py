from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.store_items import StoreItem
from data.transaction import Actions, Transaction
from data.user import User
from utils import get_json_values_from_req, jsonify_list, permission_required, response_not_found, use_db_session, use_user


blueprint = Blueprint("store", __name__)


@blueprint.route("/api/store_items")
@use_db_session()
def store_items(db_sess: Session):
    items = StoreItem.all(db_sess)
    return jsonify_list(items), 200


@blueprint.route("/api/store_sell_check", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_scanner_store)
def store_sell_check(db_sess: Session, user: User):
    (itemId, userId), errorRes = get_json_values_from_req("itemId", "userId")
    if errorRes:
        return errorRes

    item = StoreItem.get(db_sess, itemId)
    visitor = User.get(db_sess, userId)

    if item is None:
        return jsonify({"res": "no_item", "item": itemId, "player": None}), 200
    if visitor is None:
        return jsonify({"res": "no_player", "item": item.get_dict(), "player": userId}), 200

    if visitor.balance < item.price:
        return jsonify({"res": "no_money", "item": item.get_dict(), "player": visitor.name}), 200

    return jsonify({"res": "ok", "item": item.get_dict(), "player": visitor.name}), 200


@blueprint.route("/api/store_sell", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_scanner_store)
def store_sell(db_sess: Session, user: User):
    (itemId, userId), errorRes = get_json_values_from_req("itemId", "userId")
    if errorRes:
        return errorRes

    item = StoreItem.get(db_sess, itemId)
    visitor = User.get(db_sess, userId)

    if item is None:
        return response_not_found("item", itemId)
    if visitor is None:
        return response_not_found("user", userId)

    if visitor.balance < item.price:
        return jsonify({"res": "no_money", "item": item.name, "player": visitor.name}), 200

    visitor.balance -= item.price
    Transaction.new(db_sess, visitor, user, item.price, Actions.buyItem, item.id)

    return jsonify({"res": "ok", "item": item.name, "player": visitor.name}), 200
