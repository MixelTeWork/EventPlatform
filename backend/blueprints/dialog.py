from bafser import (
    Image,
    ImageJson,
    JsonObj,
    JsonOpt,
    TJson,
    Undefined,
    doc_api,
    get_json_values_from_req,
    jsonify_list,
    protected_route,
    response_msg,
    response_not_found,
)
from flask import Blueprint

from data import Operations
from data.dialog import Dialog, DialogDict
from data.dialog_character import DialogCharacter, DialogCharacterDict

bp = Blueprint("dialog", __name__)
UD = Undefined.default
U = Undefined.defined


@bp.route("/api/dialog/<int:dialogId>")
@doc_api(res=DialogDict, desc="Get dialog")
def dialog(dialogId: int):
    dialog = Dialog.get2(dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    return dialog.get_dict()


@bp.post("/api/dialog/<int:dialogId>")
@doc_api(req=TJson["data", object], res=DialogDict, desc="Edit dialog (see dialog.ts:GameDialogData)")
@protected_route(perms=Operations.manage_quest)
def dialog_edit(dialogId: int):
    data = get_json_values_from_req(("data", object))

    dialog = Dialog.get2(dialogId)
    if dialog is None:
        return response_not_found("dialog", dialogId)

    dialog.update(data)

    return dialog.get_dict()


@bp.route("/api/dialog/characters")
@doc_api(res=list[DialogCharacterDict], desc="Get all characters of all dialogs")
def characters():
    return jsonify_list(DialogCharacter.all2())


class CharacterJson(JsonObj):
    name: str
    img: ImageJson
    orien: int


@bp.post("/api/dialog/characters")
@doc_api(req=CharacterJson, res=DialogCharacterDict, desc="Add character")
@protected_route(perms=Operations.manage_quest)
def character_add():
    data = CharacterJson.get_from_req()

    img, image_error = Image.new2(data.img)
    if image_error:
        return response_msg(image_error), 400
    assert img

    character = DialogCharacter.new(data.name, img.id, data.orien)

    return character.get_dict()


class CharacterEditJson(JsonObj):
    name: JsonOpt[str]
    img: JsonOpt[ImageJson]
    orien: JsonOpt[int]


@bp.post("/api/dialog/characters/<int:characterId>")
@doc_api(req=CharacterEditJson, res=DialogCharacterDict, desc="Edit character")
@protected_route(perms=Operations.manage_quest)
def character_edit(characterId: int):
    data = CharacterEditJson.get_from_req()

    character = DialogCharacter.get2(characterId)
    if character is None:
        return response_not_found("character", characterId)

    imgId = None
    if U(data.img):
        img, image_error = Image.new2(data.img)
        if image_error:
            return response_msg(image_error), 400
        assert img
        imgId = img.id

    character.update(UD(data.name), imgId, UD(data.orien))

    return character.get_dict()


@bp.delete("/api/dialog/characters/<int:characterId>")
@doc_api(desc="Delete character")
@protected_route(perms=Operations.manage_quest)
def character_delete(characterId: int):
    character = DialogCharacter.get2(characterId)
    if character is None:
        return response_not_found("character", characterId)

    character.delete2()

    return response_msg("ok")
