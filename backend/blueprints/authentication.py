import logging
import sys

import requests
from bafser import JsonObj, create_access_token, doc_api, randstr, response_msg, use_db_session
from flask import Blueprint, abort, current_app, jsonify, redirect, request
from flask_jwt_extended import set_access_cookies, unset_jwt_cookies
from sqlalchemy.orm import Session

from data._roles import Roles
from data.other import Other
from data.user import User, UserDict

blueprint = Blueprint("authentication", __name__)
# CLIENT_ID = "51848582"
# REDIRECT_URI = "https://platformevent.pythonanywhere.com/auth_vk"
# REDIRECT_URI = "https://www.underparty.fun/auth_vk"
TICKETS_API_URL = "http://localhost:5001/" if "dev" in sys.argv else "https://ticketsystem.pythonanywhere.com/"
TICKETS_API_URL += "api/event_platform/"
EVENT_ID = 3 if "dev" in sys.argv else 19


class LoginJson(JsonObj):
    login: str
    password: str


@blueprint.post("/api/auth")
@doc_api(req=LoginJson, res=UserDict, desc="Get auth cookie")
@use_db_session
def login(db_sess: Session):
    data = LoginJson.get_from_req()
    user = User.get_by_login(db_sess, data.login)

    if not user or not user.check_password(data.password):
        return response_msg("Неправильный логин или пароль", 400)

    response = jsonify(user.get_dict())
    access_token = create_access_token(user)
    set_access_cookies(response, access_token)
    return response


@blueprint.post("/api/logout")
@doc_api(desc="Remove auth cookie")
def logout():
    response = response_msg("logout successful")
    unset_jwt_cookies(response)
    return response


class LoginTicketJson(JsonObj):
    code: str


@blueprint.post("/api/auth_ticket")
@doc_api(req=LoginTicketJson, res=UserDict, desc="Auth as visitor by ticket code")
@use_db_session
def login_ticket(db_sess: Session):
    code = LoginTicketJson.get_from_req().code

    obj = Other.get(db_sess)
    if not obj.ticketLoginEnabled:
        return response_msg("Вход по билету пока отключен, войти на сайт можно будет во время мероприятия", 400)

    user = User.get_by_login(db_sess, f"ticket_{code}", includeDeleted=True)
    if user is None:
        user = create_user_by_ticket(db_sess, code)

    if user.deleted:
        user.restore(user)

    response = jsonify(user.get_dict())
    access_token = create_access_token(user)
    set_access_cookies(response, access_token)
    return response


def create_user_by_ticket(db_sess: Session, code: str):
    res = requests.get(TICKETS_API_URL + "user_info_by_ticket", json={
        "apikey": current_app.config["API_SECRET_KEY"],
        "eventId": EVENT_ID,
        "code": code,
    })
    if not res.ok:
        logging.warning(f"auth_error: {res.status_code}; code={code}; {res.content}")
        abort(500)

    res_data = res.json()
    res_code = res_data.get("res", None)
    data = res_data.get("data", {})

    if res_code == "wrong event":
        abort(response_msg("Билет от другого мероприятия", 400))
    if res_code == "not found":
        abort(response_msg("Несуществующий билет", 400))
    if res_code != "ok":
        logging.warning(f"auth_error: {res_code}; code={code}")
        abort(500)

    typeId = data.get("typeId", 0)
    typeName = data.get("typeName", "")
    personName = data.get("personName", "Инкогнито")

    user = User.new(User.get_fake_system(), f"ticket_{code}", randstr(8), personName, [Roles.visitor], db_sess=db_sess)
    user.ticketTId = typeId
    user.ticketType = typeName
    db_sess.commit()

    return user


# @blueprint.route("/auth_vk")
# @use_db_session
# def auth_vk(db_sess: Session):
#     vk_user = get_vk_user()
#     if vk_user is None:
#         return redirect("/auth_error")
#     user_id, access_token = vk_user

#     user = User.get_by_login(db_sess, f"vk_{user_id}", includeDeleted=True)
#     if user is None:
#         user = create_vk_user(db_sess, user_id, access_token)

#     if user is None:
#         return redirect("/auth_error")

#     if user.deleted:
#         user.deleted = False
#         db_sess.commit()

#     response = redirect("/")
#     access_token = create_access_token(user)
#     set_access_cookies(response, access_token)  # type: ignore
#     return response


# def get_vk_user():
#     code = request.args.get("code", "")
#     error = request.args.get("error", "")
#     error_description = request.args.get("error_description", "")
#     if code == "" or error != "":
#         logging.warning(f"auth_error_1: {error}; {error_description}")
#         return None

#     res = requests.get("https://oauth.vk.com/access_token", {
#         "client_id": CLIENT_ID,
#         "client_secret": current_app.config["VK_SECRET_KEY"],
#         "redirect_uri": REDIRECT_URI,
#         "code": code,
#     })
#     if not res.ok:
#         logging.warning(f"auth_error_2: {res.status_code}; {res.content}")
#         return None

#     data = res.json()
#     access_token = data.get("access_token", None)
#     user_id = data.get("user_id", None)

#     if user_id is None:
#         logging.warning(f"auth_error_3: {data.get('error', None)}; {data.get('error_description', None)}")
#         return None

#     return user_id, access_token


# def create_vk_user(db_sess: Session, user_id: int, access_token: str):
#     res = requests.get("https://api.vk.com/method/account.getProfileInfo", {
#         "access_token": access_token,
#         "v": "5.199",
#     })
#     if not res.ok:
#         logging.warning(f"auth_error_4: {res.status_code}; {res.content}")
#         return None

#     data = res.json()
#     response = data.get("response", None)
#     error = data.get("error", {})

#     if response is None:
#         logging.warning(f"auth_error_5: {error.get('error_code', None)}; {error.get('error_msg', None)}")
#         return None

#     photo = response.get("photo_200", None)
#     first_name = response.get("first_name", "Инкогнито")
#     last_name = response.get("last_name", "Инкогнито")

#     user = User.new(User.get_fake_system(), f"vk_{user_id}", randstr(8), first_name, [Roles.visitor])
#     user.lastName = last_name
#     user.imageUrl = photo
#     db_sess.commit()

#     return user


@blueprint.post("/api/auth_ticket_err")
def login_ticket_err():
    return response_msg("ok")
