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
        "/api/debug/log": {
            "__desc__": "Get log",
            "response": "Log[]",
        },
        "/api/quests": {
            "__desc__": "Get quests",
            "response": "Quest[]",
        },
        "/api/quest_complete": {
            "__desc__": "Mark quest as completed for user",
            "request": {
                "questId": "number",
                "userId": "number",
            },
            "response": {
                "res": "'ok' | 'already_done'"
            },
        },
        "/api/store_items": {
            "__desc__": "Get store items",
            "response": "StoreItem[]",
        },
        "User": {
            "id": "number",
            "name": "string",
            "login": "string",
            "balance": "number",
            "complited_quests": "number[]",
            "roles": "string[]",
            "operations": "string[]",
        },
        "UserFull": {
            "id": "number",
            "name": "string",
            "login": "string",
            "balance": "number",
            "complited_quests": "number[]",
            "roles": "string[]",
            "deleted": "bool",
            "operations": "string[]",
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
            "reward": "number",
        },
        "StoreItem": {
            "id": "number",
            "name": "string",
            "price": "number",
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
    }), 200
