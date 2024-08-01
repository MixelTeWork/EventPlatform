from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.quest import Quest
from data.user import User
from data.user_quest import UserQuest
from utils import (get_json_values_from_req, jsonify_list, permission_required, permission_required_any,
                   response_msg, response_not_found, use_db_session, use_user, use_user_try)


blueprint = Blueprint("quest", __name__)


@blueprint.route("/api/quests")
@use_db_session()
@use_user_try()
def quests(db_sess: Session, user: User):
    quests = Quest.all_for_user(db_sess, user)
    return jsonify(quests), 200


@blueprint.route("/api/quests_full")
@jwt_required()
@use_db_session()
@use_user()
@permission_required_any(Operations.page_worker_quest, Operations.manage_quest)
def quests_full(db_sess: Session, user: User):
    quests = Quest.all(db_sess, includeHidden=True)
    return jsonify_list(quests, "get_dict_full"), 200


@blueprint.route("/api/quest", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def quest_add(db_sess: Session, user: User):
    name, description, reward, hidden = get_json_values_from_req("name", "description", "reward", "hidden")

    quest = Quest.new(user, name, description, reward, hidden)

    return jsonify(quest.get_dict_full()), 200


@blueprint.route("/api/quest/<int:questId>", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def quest_edit(questId, db_sess: Session, user: User):
    name, description, reward, hidden, dialog1, dialog2 =\
        get_json_values_from_req(("name", None), ("description", None), ("reward", None), ("hidden", None), ("dialog1", None), ("dialog2", None))

    quest = Quest.get(db_sess, questId)
    if quest is None:
        return response_not_found("quest", questId)

    quest.update(user, name, description, reward, hidden, dialog1, dialog2)

    return jsonify(quest.get_dict_full()), 200


@blueprint.route("/api/quest/<int:questId>", methods=["DELETE"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.manage_quest)
def quest_delete(questId, db_sess: Session, user: User):
    quest = Quest.get(db_sess, questId)
    if quest is None:
        return response_not_found("quest", questId)

    quest.delete(user)

    return response_msg("ok"), 200


@blueprint.route("/api/quest/<int:questId>/open", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
def quest_open(questId, db_sess: Session, user: User):
    quest = Quest.get(db_sess, questId)
    if quest is None:
        return response_not_found("quest", questId)

    UserQuest.open_quest(user, user, quest)

    return response_msg("ok"), 200
