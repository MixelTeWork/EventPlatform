from flask import Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy import func
from sqlalchemy.orm import Session

from bfs import permission_required, use_db_session, use_user
from data._operations import Operations
from data.user import User
from data.user_quest import UserQuest


blueprint = Blueprint("other", __name__)


@blueprint.route("/api/other/stats")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.page_stats)
def stats(db_sess: Session, user: User):
    data_completed = (db_sess
                .query(User.group, func.count(UserQuest.completeDate))
                .join(User, User.id == UserQuest.userId)
                .group_by(User.group)
                .all())
    data_members = (db_sess
                .query(User.group, func.count(User.id))
                .group_by(User.group)
                .all())
    r = {
        "group1_completed": 0,
        "group1_members": 0,
        "group2_completed": 0,
        "group2_members": 0,
    }
    for row in data_completed:
        group, count = row
        r[f"group{group}_completed"] = count

    for row in data_members:
        group, count = row
        r[f"group{group}_members"] = count

    return r
