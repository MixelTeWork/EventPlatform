from bafser import Image, ImageJson, TJson, doc_api, get_json_values_from_req, protected_route, response_msg
from flask import Blueprint, abort

from data import Operations

blueprint = Blueprint("images", __name__)


@blueprint.route("/api/img/<int:imgId>")
@doc_api(desc="Get image as file")
def img(imgId: int):
    img = Image.get2(imgId)
    if img is None:
        abort(404)

    return img.create_file_response()


@blueprint.post("/api/img")
@doc_api(req=TJson["img", ImageJson], res=TJson["id", int], desc="Upload image")
@protected_route(perms=Operations.add_any_image)
def upload_img():
    img_data = get_json_values_from_req(("img", ImageJson))

    img, image_error = Image.new2(img_data)
    if image_error:
        return response_msg(image_error, 400)
    assert img

    return {"id": img.id}
