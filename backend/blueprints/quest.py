from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from data.quest import Quest
from data.user import User
from data.user_quest import UserQuest
from utils import get_json_values_from_req, jsonify_list, permission_required, response_not_found, use_db_session, use_user, use_user_try


blueprint = Blueprint("quest", __name__)


@blueprint.route("/api/quests")
@use_db_session()
@use_user_try()
def quests(db_sess: Session, user: User):
    if user is None:
        quests = Quest.all(db_sess)
        return jsonify_list(quests), 200
    else:
        quests = Quest.all_for_user(user)
        return jsonify(quests), 200


@blueprint.route("/api/quest_complete", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_scanner_quest)
def quest_complete(db_sess: Session, user: User):
    (questId, userId), errorRes = get_json_values_from_req("questId", "userId")
    if errorRes:
        return errorRes

    quest = Quest.get(db_sess, questId)
    player = User.get(db_sess, userId)

    if quest is None:
        return response_not_found("quest", questId)
    if player is None:
        return response_not_found("user", userId)

    completed = player.get_complited_quest_ids()
    if quest.id in completed:
        return jsonify({"res": "already_done", "player": player.name}), 200

    UserQuest.new(db_sess, user, player, quest)

    return jsonify({"res": "ok", "player": player.name}), 200
