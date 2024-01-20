from flask import Blueprint
from sqlalchemy.orm import Session
from data.quest import Quest
from utils import jsonify_list, use_db_session


blueprint = Blueprint("quest", __name__)


@blueprint.route("/api/quests")
@use_db_session()
def quests(db_sess: Session):
    quests = Quest.all(db_sess)
    return jsonify_list(quests), 200
