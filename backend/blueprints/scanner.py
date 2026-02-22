from typing import Literal, TypedDict

from bafser import TJson, doc_api, get_json_values_from_req, protected_route
from flask import Blueprint

from data import Operations, Roles, User
from data.quest import Quest
from data.send import Send
from data.store_item import StoreItem
from data.transaction import Actions, Transaction
from data.user_quest import UserQuest
from data.user_send import UserSend

bp = Blueprint("scanner", __name__)

type ScannerAction = Literal["", "quest", "store", "send", "promote"]


class ScannerRes(TypedDict):
    res: Literal["ok", "wrong", "error"]
    action: ScannerAction
    value: int
    msg: str
    balance: int


@bp.post("/api/scanner")
@doc_api(req=TJson["code", str], res=ScannerRes, desc="Use scanned code")
@protected_route()
def scanner():
    code = get_json_values_from_req(("code", str))
    User.get_current(lazyload=True, for_update=True)

    for key in SCANNERS:
        if code.startswith(key):
            return SCANNERS[key](code[len(key) :])

    return respose_wrong("")


def scanner_quest(code: str):
    quest = Quest.get_by_big_id(code)
    if quest is None:
        return respose_wrong("quest")

    user = User.current
    completed = UserQuest.complete_quest(user, quest)
    if not completed:
        return respose_error("quest", f"Квест {quest.name} уже завершён")

    user.balance += quest.reward
    Transaction.new(1, user.id, quest.reward, Actions.endQuest, quest.id)

    return respose_ok("quest", quest.name, quest.reward)


def scanner_item(code: str):
    item = StoreItem.get_by_big_id(code)
    if item is None:
        return respose_wrong("item")

    user = User.current
    if user.balance < item.price:
        return respose_error("store", f"Маловато средств для покупки {item.name}", item.price)

    user.balance -= item.price
    Transaction.new(user.id, 1, item.price, Actions.buyItem, item.id, commit=False)
    item.decrease()

    return respose_ok("store", item.name, item.price)


def scanner_send(code: str):
    send = Send.get_by_big_id(code)
    if send is None:
        return respose_wrong("send")

    if send.used:
        return respose_error("send", "Код уже использован")

    user = User.current
    if send.reusable:
        used = send.check_used_by(user)
        if used:
            return respose_error("send", "Код уже вами использован")

    if send.positive:
        user.balance += send.value
        Transaction.new(1, user.id, send.value, Actions.send, send.id, commit=False)
    else:
        if user.balance < send.value:
            return respose_error("send", "Маловато средств", send.value)
        user.balance -= send.value
        Transaction.new(user.id, 1, send.value, Actions.send, send.id, commit=False)

    if send.reusable:
        UserSend.new(user, send)
    else:
        send.used = True
        send.db_sess.commit()

    return respose_ok("send", "", send.value * (1 if send.positive else -1))


def scanner_promote(code: str):
    splited = code.split("_")
    if len(splited) != 2:
        return respose_wrong("promote")

    role, userId = splited

    actor = User.get_by_big_id(userId)
    if actor is None:
        return respose_wrong("promote_0")

    user = User.current
    if role == "staff":
        text = "волонтёр"

        if not actor.check_permission(Operations.promote_staff):
            return respose_wrong("promote_1")

        r = user.add_role(actor, Roles.staff)

    elif role == "manager":
        text = "управляющий"

        if not actor.check_permission(Operations.promote_manager):
            return respose_wrong("promote_2")

        user.add_role(actor, Roles.staff)
        r = user.add_role(actor, Roles.manager)

    else:
        return respose_wrong("promote_3")

    if not r:
        return respose_error("promote", f"Вы уже {text}")

    return respose_ok("promote", role)


def respose_ok(action: ScannerAction, msg: str, value: int = 0) -> ScannerRes:
    return {
        "res": "ok",
        "action": action,
        "value": value,
        "msg": msg,
        "balance": User.current.balance,
    }


def respose_wrong(msg: str) -> ScannerRes:
    return {
        "res": "wrong",
        "action": "",
        "value": 0,
        "msg": msg,
        "balance": User.current.balance,
    }


def respose_error(action: ScannerAction, msg: str, value: int = 0) -> ScannerRes:
    return {
        "res": "error",
        "action": action,
        "value": value,
        "msg": msg,
        "balance": User.current.balance,
    }


SCANNERS = {
    "quest_": scanner_quest,
    "item_": scanner_item,
    "send_": scanner_send,
    "promote_": scanner_promote,
}
