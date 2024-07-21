from flask import Blueprint, jsonify


blueprint = Blueprint("docs", __name__)


@blueprint.route("/api")
def docs():
    return jsonify({
        "/api/auth POST": {
            "__desc__": "Get auth cookie",
            "request": {
                "login": "string",
                "password": "string",
            },
            "response": "User",
        },
        "/api/logout POST": {
            "__desc__": "Remove auth cookie",
        },
        "/api/user": {
            "__desc__": "Get current user",
            "response": "User",
        },
        "/api/users": {
            "__desc__": "Get all users",
            "response": "UserFull[]",
        },
        "/api/user/change_password POST": {
            "__desc__": "Set new password",
            "request": {
                "password": "string",
            },
        },
        "/api/user/change_name POST": {
            "__desc__": "Set new name",
            "request": {
                "name": "string",
            },
        },
        "/api/user/set_group POST": {
            "__desc__": "Set user group",
            "request": {
                "group": "number",
            },
            "response": {
                "group": "number",
            },
        },
        "/api/img/<int:imageId>": {
            "__desc__": "Get image",
            "response": "binary image data",
        },
        "/api/img POST": {
            "__desc__": "Add image",
            "request": {
                "img": "Image",
            },
            "response": {
                "id": "number",
            },
        },
        "/api/debug/log": {
            "__desc__": "Get log",
            "response": "Log[]",
        },
        "/api/quests": {
            "__desc__": "Get quests",
            "response": "Quest[]",
        },
        "/api/quests_full": {
            "__desc__": "Get full quests",
            "response": "QuestFull[]",
        },
        "/api/quest POST": {
            "__desc__": "Add quest to store",
            "request": {
                "name": "string",
                "description": "string",
                "reward": "number",
                "hidden": "boolean",
            },
            "response": "QuestFull",
        },
        "/api/quest/<int:questId> POST": {
            "__desc__": "Edit quest",
            "request": {
                "name": "?string",
                "description": "?string",
                "reward": "?number",
                "hidden": "?boolean",
                "dialog1": "?dialog.ts:GameDialogData | False",  # False - delete
                "dialog2": "?dialog.ts:GameDialogData | False",  # False - delete
            },
            "response": "QuestFull",
        },
        "/api/quest/<int:questId> DELETE": {
            "__desc__": "Delete quest",
        },
        "/api/store_items": {
            "__desc__": "Get store items",
            "response": "StoreItem[]",
        },
        "/api/store_items_full": {
            "__desc__": "Get full store items",
            "response": "StoreItemFull[]",
        },
        "/api/store_item POST": {
            "__desc__": "Add item to store",
            "request": {
                "name": "string",
                "price": "number",
                "count": "number",
                "img": "?Image",
            },
            "response": "StoreItemFull",
        },
        "/api/store_item/<int:itemId> POST": {
            "__desc__": "Edit store item",
            "request": {
                "name": "?string",
                "price": "?number",
                "count": "?number",
                "img": "?Image",
            },
            "response": "StoreItemFull",
        },
        "/api/store_item/<int:itemId>/decrease POST": {
            "__desc__": "Decrease item count by one",
            "response": "StoreItemFull",
        },
        "/api/store_item/<int:itemId> DELETE": {
            "__desc__": "Delete store item",
        },
        "/api/scanner": {
            "__desc__": "Use scanned code",
            "request": {
                "code": "string",
            },
            "response": {
                "res": "'ok' | 'wrong' | 'error'",
                "action": "'quest' | 'store' | 'send' | 'promote'",
                "value": "number",
                "msg": "string",
                "balance": "number",
            },
        },
        "/api/send": {
            "__desc__": "Create send operation",
            "request": {
                "value": "number",
                "positive": "boolean",
                "reusable": "boolean",
            },
            "response": {
                "id": "string",
                "value": "number",
                "positive": "boolean",
                "reusable": "boolean",
            },
        },
        "/api/send_check": {
            "__desc__": "Check if send is successful",
            "request": {
                "id": "string",
            },
            "response": {
                "successful": "boolean",
            },
        },
        "/api/dialog/<int:dialogId>": {
            "__desc__": "Get dialog",
            "response": "Dialog",
        },
        "/api/dialog/<int:dialogId> POST": {
            "__desc__": "Edit dialog",
            "request": "dialog.ts:GameDialogData",
            "response": "Dialog",
        },
        "/api/dialog/characters": {
            "__desc__": "Get all dialog characters",
            "response": "DialogCharacter[]",
        },
        "User": {
            "id": "string",
            "name": "string",
            "last_name": "string",
            "photo": "string",
            "balance": "number",
            "roles": "string[]",
            "operations": "string[]",
            "group": "number",
        },
        "UserFull": {
            "id": "number",
            "id_vk": "number",
            "id_big": "string",
            "login": "string",
            "name": "string",
            "last_name": "string | null",
            "photo": "string | null",
            "balance": "number",
            "roles": "string[]",
            "deleted": "boolean",
            "operations": "string[]",
            "group": "number",
        },
        "Image": {
            "data": "string",
            "name": "string",
        },
        "Log": {
            "id": "number",
            "date": "datetime",
            "actionCode": "string",
            "userId": "number",
            "userName": "number",
            "tableName": "string",
            "recordId": "number",
            "changes": "string",
        },
        "Quest": {
            "id": "number",
            "name": "string",
            "description": "string",
            "reward": "number",
            "completed": "boolean",
            "dialogId": "number | null",
            "opened": "boolean",
        },
        "QuestFull": {
            "id": "number",
            "id_big": "string",
            "name": "string",
            "description": "string",
            "reward": "number",
            "hidden": "boolean",
            "dialog1Id": "number | null",
            "dialog2Id": "number | null",
        },
        "StoreItem": {
            "id": "number",
            "name": "string",
            "price": "'many' | 'few' | 'no'",
            "img": "string | null",
        },
        "StoreItemFull": {
            "id": "number",
            "id_big": "string",
            "name": "string",
            "price": "number",
            "img": "string | null",
        },
        "Transaction": {
            "id": "number",
            "date": "datetime",
            "fromId": "number",
            "toId": "number",
            "value": "number",
            "action": "string",
            "itemId": "number",
        },
        "Dialog": {
            "id": "number",
            "data": "dialog.ts:GameDialogData",
        },
        "DialogCharacter": {
            "id": "number",
            "name": "string",
            "img": "string",
        },
    }), 200
