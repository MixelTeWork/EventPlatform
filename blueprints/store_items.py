from flask import Blueprint
from sqlalchemy.orm import Session
from data.store_items import StoreItem
from utils import jsonify_list, use_db_session


blueprint = Blueprint("storeItem", __name__)


@blueprint.route("/api/store_items")
@use_db_session()
def store_items(db_sess: Session):
    items = StoreItem.all(db_sess)
    return jsonify_list(items), 200
