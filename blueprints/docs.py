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
        "User": {
            "id": "number",
            "name": "string",
            "login": "string",
            "roles": "string[]",
            "operations": "string[]",
        },
        "UserFull": {
            "id": "number",
            "name": "string",
            "login": "string",
            "roles": "string[]",
            "bossId": "number",
            "deleted": "bool",
            "access": "string[]",
            "operations": "string[]",
        },
    }), 200
