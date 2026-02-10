from bafser import JsonObj, TJson, TJsonListOf, doc_api, get_json_values_from_req, jsonify_list, protected_route, response_msg, response_not_found
from flask import Blueprint, jsonify

from data import Operations, Roles
from data.user import User, UserFullDict

blueprint = Blueprint("user", __name__)


@blueprint.route("/api/users")
@doc_api(res=list[UserFullDict], desc="Get all users")
@protected_route(perms=Operations.page_dev)
def users():
    users = User.all2(includeDeleted=True)
    return jsonify_list(users, "get_dict_full")


class UserJson(JsonObj):
    login: str
    password: str
    name: str
    roles: list[int]


@blueprint.post("/api/users")
@doc_api(req=UserJson, res=UserFullDict, desc="Add user")
@protected_route(perms=Operations.page_dev)
def add_user():
    data = UserJson.get_from_req()
    u = User.new(User.current, data.login, data.password, data.name, data.roles)
    return u.get_dict_full()


@blueprint.route("/api/users/roles")
@doc_api(res=TJsonListOf["id", int, "name", str], desc="Get all roles")
@protected_route(perms=Operations.page_dev)
def roles():
    return jsonify([{"id": v[0], "name": v[1]} for v in Roles.get_all()])


@blueprint.post("/api/users/<int:userId>/roles")
@doc_api(req=TJson["roles", list[int]], res=UserFullDict, desc="Set user roles")
@protected_route(perms=Operations.page_dev)
def set_user_roles(userId: int):
    roles = get_json_values_from_req(("roles", list[int]))

    u = User.get2(userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    cur_roles = [v[0] for v in u.get_roles()]
    for role in set(cur_roles) - set(roles):
        u.remove_role(User.current, role)
    for role in set(roles) - set(cur_roles):
        u.add_role(User.current, role)

    return u.get_dict_full()


@blueprint.post("/api/users/<int:userId>/set_password")
@doc_api(req=TJson["password", str], res=UserFullDict, desc="Set user password")
@protected_route(perms=Operations.page_dev)
def set_user_password(userId: int):
    password = get_json_values_from_req(("password", str))

    u = User.get2(userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    u.update_password(User.current, password)

    return u.get_dict_full()


@blueprint.post("/api/users/<int:userId>/set_name")
@doc_api(req=TJson["name", str], res=UserFullDict, desc="Set user name")
@protected_route(perms=Operations.page_dev)
def set_user_name(userId: int):
    name = get_json_values_from_req(("name", str))

    u = User.get2(userId, includeDeleted=True)
    if u is None:
        return response_not_found("user", userId)

    u.update_name(User.current, name)

    return u.get_dict_full()


@blueprint.post("/api/user/change_password")
@doc_api(req=TJson["password", str], desc="Set new password")
@protected_route()
def change_password():
    password = get_json_values_from_req(("password", str))

    User.current.update_password(User.current, password)

    return response_msg("ok")


@blueprint.post("/api/user/change_name")
@doc_api(req=TJson["name", str], desc="Set new name")
@protected_route()
def change_name():
    name = get_json_values_from_req(("name", str))

    User.current.update_name(User.current, name)

    return response_msg("ok")


@blueprint.post("/api/user/set_group")
@doc_api(req=TJson["group", int], res=TJson["group", int], desc="Set user group")
@protected_route()
def set_group():
    group = get_json_values_from_req(("group", int))

    group = User.current.set_group(group)

    return jsonify({"group": group})


@blueprint.post("/api/user/open_game")
@doc_api(desc="Mark game dialog as opened")
@protected_route()
def open_game():
    User.current.gameOpened = True
    User.current.db_sess.commit()

    return response_msg("ok")
