from typing import Any

from bafser import JsonObj, JsonOpt, Undefined, doc_api, jsonify_list, protected_route, response_msg, response_not_found
from flask import Blueprint, jsonify

from data import Operations, User
from data.quest import Quest, QuestFullDict, QuestUserDict
from data.user_quest import UserQuest

bp = Blueprint("quest", __name__)
UD = Undefined.default


@bp.route("/api/quests")
@doc_api(res=list[QuestUserDict], desc="Get quests")
def quests():
    user = User.get_current(lazyload=True)
    quests = Quest.all_for_user(user)
    return jsonify(quests)


@bp.route("/api/quests_full")
@doc_api(res=list[QuestFullDict], desc="Get all quests")
@protected_route(perms_any=[Operations.page_staff_quest, Operations.manage_quest])
def quests_full():
    quests = Quest.all(includeHidden=True)
    return jsonify_list(quests, "get_dict_full")


class QuestJson(JsonObj):
    name: str
    description: str
    reward: int
    hidden: bool


@bp.post("/api/quests")
@doc_api(req=QuestJson, res=QuestFullDict, desc="Add new quest")
@protected_route(perms=Operations.manage_quest)
def quest_add():
    data = QuestJson.get_from_req()
    quest = Quest.new(data.name, data.description, data.reward, data.hidden)
    return quest.get_dict_full()


class QuestEditJson(JsonObj):
    name: JsonOpt[str]
    description: JsonOpt[str]
    reward: JsonOpt[int]
    hidden: JsonOpt[bool]
    dialog1: JsonOpt[dict[str, Any]]
    dialog2: JsonOpt[dict[str, Any]]


@bp.post("/api/quests/<int:questId>")
@doc_api(req=QuestEditJson, res=QuestFullDict, desc="Edit quest")
@protected_route(perms=Operations.manage_quest)
def quest_edit(questId: int):
    data = QuestEditJson.get_from_req()

    quest = Quest.get2(questId)
    if quest is None:
        return response_not_found("quest", questId)

    quest.update(UD(data.name), UD(data.description), UD(data.reward), UD(data.hidden), UD(data.dialog1), UD(data.dialog2))

    return quest.get_dict_full()


@bp.delete("/api/quests/<int:questId>")
@doc_api(desc="Delete quest")
@protected_route(perms=Operations.manage_quest)
def quest_delete(questId: int):
    quest = Quest.get2(questId)
    if quest is None:
        return response_not_found("quest", questId)

    quest.delete2()

    return response_msg("ok")


@bp.post("/api/quests/<int:questId>/open")
@doc_api(desc="Mark quest as opened")
@protected_route()
def quest_open(questId: int):
    quest = Quest.get2(questId)
    if quest is None:
        return response_not_found("quest", questId)

    User.get_current(lazyload=True)
    UserQuest.open_quest(User.current, quest)

    return response_msg("ok")
