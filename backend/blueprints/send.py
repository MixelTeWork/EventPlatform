from bafser import TJson, doc_api, get_json_values_from_req, protected_route, response_not_found
from flask import Blueprint

from data import Operations, User
from data.send import Send, SendDict

bp = Blueprint("send", __name__)


@bp.post("/api/send")
@doc_api(req=TJson["value", int, "positive", bool, "reusable", bool], res=SendDict, desc="Create send operation")
@protected_route(perms=Operations.send_any)
def send():
    value, positive, reusable = get_json_values_from_req(("value", int), ("positive", bool), ("reusable", bool))

    send = Send.new(User.current.id, value, positive, reusable)

    return send.get_dict()


@bp.post("/api/send_check")
@doc_api(req=TJson["id", str], res=TJson["successful", bool], desc="Check if send is successful")
@protected_route(perms=Operations.send_any)
def send_check():
    sendId = get_json_values_from_req(("id", str))

    send = Send.get_by_big_id(sendId)
    if send is None:
        return response_not_found("send", sendId)

    return {"successful": send.used}
