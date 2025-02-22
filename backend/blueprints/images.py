from flask import Blueprint, abort
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session

from bfs import Image, get_json_values_from_req, permission_required, response_msg, use_db_session, use_user
from data._operations import Operations
from data.user import User

blueprint = Blueprint("images", __name__)


@blueprint.route("/api/img/<int:imgId>")
@use_db_session()
def img(db_sess: Session, imgId):
    img = Image.get(db_sess, imgId)
    if img is None:
        abort(404)

    return img.create_file_response()


@blueprint.post("/api/img")
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.add_any_image)
def upload_img(db_sess: Session, user: User):
    img_data = get_json_values_from_req("img")

    img, image_error = Image.new(user, img_data)
    if image_error:
        return response_msg(image_error, 400)

    return {"id": img.id}
