from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.quest import Quest
from data.role import Roles
from data.send import Send
from data.store_item import StoreItem
from data.transaction import Actions, Transaction
from data.user import User
from data.user_quest import UserQuest
from data.user_send import UserSend
from utils import get_json_values_from_req, use_db_session, use_user


blueprint = Blueprint("scanner", __name__)


@blueprint.route("/api/scanner", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def scanner(db_sess: Session, user: User):
    (code, ), errorRes = get_json_values_from_req("code")
    if errorRes:
        return errorRes

    for key in SCANNERS:
        if (code.startswith(key)):
            return SCANNERS[key](db_sess, user, code[len(key):])

    return respose_wrong(user, "")


def scanner_quest(db_sess: Session, user: User, code: str):
    quest = Quest.get_by_big_id(db_sess, code)
    if quest is None:
        return respose_wrong(user, "quest")

    completed = UserQuest.complete_quest(db_sess, user, user, quest)
    if not completed:
        return respose_error(user, "quest", f"Квест {quest.name} уже завершён")

    user.balance += quest.reward
    Transaction.new(db_sess, 1, user.id, quest.reward, Actions.endQuest, quest.id)

    return respose_ok(user, "quest", quest.name, quest.reward)


def scanner_item(db_sess: Session, user: User, code: str):
    item = StoreItem.get_by_big_id(db_sess, code)
    if item is None:
        return respose_wrong(user, "item")

    if user.balance < item.price:
        return respose_error(user, "store", f"Маловато средств для покупки {item.name}", item.price)

    user.balance -= item.price
    Transaction.new(db_sess, user.id, 1, item.price, Actions.buyItem, item.id)
    item.decrease()

    return respose_ok(user, "store", item.name, item.price)


def scanner_send(db_sess: Session, user: User, code: str):
    send = Send.get_by_big_id(db_sess, code)
    if send is None:
        return respose_wrong(user, "send")

    if send.used:
        return respose_error(user, "send", "Код уже использован")

    if send.reusable:
        used = send.check_used_by(user)
        if used:
            return respose_error(user, "send", "Код уже вами использован")

    if send.positive:
        user.balance += send.value
        Transaction.new(db_sess, 1, user.id, send.value, Actions.send, send.id)
    else:
        if user.balance < send.value:
            return respose_error(user, "send", "Маловато средств", send.value)
        user.balance -= send.value
        Transaction.new(db_sess, user.id, 1, send.value, Actions.send, send.id)

    if send.reusable:
        UserSend.new(db_sess, user, send)
    else:
        send.used = True
        db_sess.commit()

    return respose_ok(user, "send", "", send.value * (1 if send.positive else -1))


def scanner_promote(db_sess: Session, user: User, code: str):
    splited = code.split("_")
    if len(splited) != 2:
        return respose_wrong(user, "promote")

    role, userId = splited

    actor = User.get_by_big_id(db_sess, userId)
    if actor is None:
        return respose_wrong(user, "promote_0")

    if role == "worker":
        text = "волонтёр"

        if not actor.check_permission(Operations.promote_worker):
            return respose_wrong(user, "promote_1")

        r = user.add_role(actor, Roles.worker)

    elif role == "manager":
        text = "управляющий"

        if not actor.check_permission(Operations.promote_manager):
            return respose_wrong(user, "promote_2")

        user.add_role(actor, Roles.worker)
        r = user.add_role(actor, Roles.manager)

    else:
        return respose_wrong(user, "promote_3")

    if not r:
        return respose_error(user, "promote", f"Вы уже {text}")

    return respose_ok(user, "promote", role)


def respose_ok(user: User, action: str, msg: str, value=0):
    return jsonify({
        "res": "ok",
        "action": action,
        "value": value,
        "msg": msg,
        "balance": user.balance,
    }), 200


def respose_wrong(user: User, msg: str):
    return jsonify({
        "res": "wrong",
        "action": "",
        "value": 0,
        "msg": msg,
        "balance": user.balance,
    }), 200


def respose_error(user: User, action: str, msg: str, value=0):
    return jsonify({
        "res": "error",
        "action": action,
        "value": value,
        "msg": msg,
        "balance": user.balance,
    }), 200


SCANNERS = {
    "quest_": scanner_quest,
    "item_": scanner_item,
    "send_": scanner_send,
    "promote_": scanner_promote,
}
