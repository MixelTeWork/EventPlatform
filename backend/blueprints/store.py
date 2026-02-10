from bafser import Image, ImageJson, JsonObj, JsonOpt, Undefined, doc_api, jsonify_list, protected_route, response_msg, response_not_found
from flask import Blueprint

from data import Operations
from data.store_item import StoreItem, StoreItemDict, StoreItemFullDict

bp = Blueprint("store", __name__)
UD = Undefined.default
U = Undefined.defined


@bp.route("/api/store_items")
@doc_api(res=list[StoreItemDict], desc="Get store items")
def store_items():
    return jsonify_list(StoreItem.all2())


@bp.route("/api/store_items_full")
@doc_api(res=list[StoreItemFullDict], desc="Get full list of store items")
@protected_route(perms_any=[Operations.page_staff_store, Operations.manage_store])
def store_items_full():
    return jsonify_list(StoreItem.all2(), "get_dict_full")


class StoreItemJson(JsonObj):
    name: str
    price: int
    count: int
    img: JsonOpt[ImageJson]


@bp.post("/api/store_items")
@doc_api(req=StoreItemJson, res=StoreItemFullDict, desc="Add item to store")
@protected_route(perms=Operations.manage_store)
def store_item_add():
    data = StoreItemJson.get_from_req()

    img_id = None
    if U(data.img):
        img, image_error = Image.new2(data.img)
        if image_error:
            return response_msg(image_error, 400)
        assert img
        img_id = img.id

    item = StoreItem.new(data.name, data.price, data.count, img_id)

    return item.get_dict_full()


class StoreItemEditJson(JsonObj):
    name: JsonOpt[str]
    price: JsonOpt[int]
    count: JsonOpt[int]
    img: JsonOpt[ImageJson]


@bp.post("/api/store_items/<int:itemId>")
@doc_api(req=StoreItemJson, res=StoreItemFullDict, desc="Edit store item")
@protected_route(perms=Operations.manage_store)
def store_item_patch(itemId: int):
    data = StoreItemEditJson.get_from_req()

    item = StoreItem.get2(itemId)
    if item is None:
        return response_not_found("item", itemId)

    imgId = None
    if U(data.img):
        img, image_error = Image.new2(data.img)
        if image_error:
            return response_msg(image_error, 400)
        assert img
        imgId = img.id

    item.update(UD(data.name), UD(data.price), UD(data.count), imgId)

    return item.get_dict_full()


@bp.post("/api/store_items/<int:itemId>/decrease")
@doc_api(res=StoreItemFullDict, desc="Decrease item count by one")
@protected_route(perms=Operations.manage_store)
def store_item_decrease(itemId: int):
    item = StoreItem.get2(itemId)
    if item is None:
        return response_not_found("item", itemId)

    item.decrease()

    return item.get_dict_full()


@bp.delete("/api/store_items/<int:itemId>")
@doc_api(desc="Delete store item")
@protected_route(perms=Operations.manage_store)
def store_item_delete(itemId: int):
    item = StoreItem.get2(itemId)
    if item is None:
        return response_not_found("item", itemId)

    item.delete2()

    return response_msg("ok")
