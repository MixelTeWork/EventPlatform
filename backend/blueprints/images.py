from flask import Blueprint, abort, jsonify, send_file
from flask_jwt_extended import jwt_required
from sqlalchemy.orm import Session
from data.operation import Operations
from utils import get_json_values_from_req, permission_required, use_db_session, use_user
from data.user import User
from data.image import Image

blueprint = Blueprint("images", __name__)


@blueprint.route("/api/img/<int:imgId>")
@use_db_session()
def img(db_sess: Session, imgId):
    img: Image = db_sess.query(Image).get(imgId)
    if not img or img.deleted:
        abort(404)

    path = img.get_path()
    filename = img.name + "." + img.type
    response = send_file(path)
    response.headers.set("Content-Type", f"image/{img.type}")
    response.headers.set("Content-Disposition", "inline", filename=filename)
    response.headers.set("Cache-Control", "public,max-age=604800,immutable")
    return response


@blueprint.route("/api/img", methods=["POST"])
@jwt_required()
@use_db_session()
@use_user()
@permission_required(Operations.add_any_image)
def upload_img(db_sess: Session, user: User):
    img_data = get_json_values_from_req("img")

    img, image_error = Image.new(user, img_data)
    if image_error:
        return jsonify({"msg": image_error}), 400

    return jsonify({"id": img.id}), 200
