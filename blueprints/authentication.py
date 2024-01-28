import logging
from flask import Blueprint, jsonify, redirect, request
from flask_jwt_extended import create_access_token, unset_jwt_cookies, set_access_cookies
import requests
from sqlalchemy.orm import Session
from data.role import Roles
from data.user import User
from utils import get_json_values_from_req, get_vk_secret_key, randstr, reponse_msg, use_db_session


blueprint = Blueprint("authentication", __name__)
CLIENT_ID = "51843506"
CLIENT_SECRET = get_vk_secret_key()
REDIRECT_URI = "https://platformevent.pythonanywhere.com/auth_vk"


@blueprint.route("/api/auth", methods=["POST"])
@use_db_session()
def login(db_sess: Session):
    (login, password), errorRes = get_json_values_from_req("login", "password")
    if errorRes:
        return errorRes

    user: User = db_sess.query(User).filter(User.login == login, User.deleted == False).first()

    if not user or not user.check_password(password):
        return reponse_msg("Неправильный логин или пароль"), 400

    response = jsonify(user.get_dict())
    access_token = create_access_token(identity=[user.id, user.password])
    set_access_cookies(response, access_token)
    return response


@blueprint.route("/api/logout", methods=["POST"])
def logout():
    response = reponse_msg("logout successful")
    unset_jwt_cookies(response)
    return response


@blueprint.route("/auth_vk")
@use_db_session()
def auth_vk(db_sess: Session):
    vk_user = get_vk_user()
    if vk_user is None:
        return redirect("/auth_error")
    user_id, access_token = vk_user

    user: User = db_sess.query(User).filter(User.id_vk == user_id).first()

    if user is None:
        user = create_vk_user(db_sess, user_id, access_token)

    if user is None:
        return redirect("/auth_error")

    if user.deleted:
        user.deleted = False
        db_sess.commit()

    response = redirect("/")
    access_token = create_access_token(identity=[user.id, user.password])
    set_access_cookies(response, access_token)
    return response


def get_vk_user():
    code = request.args.get("code", "")
    error = request.args.get("error", "")
    error_description = request.args.get("error_description", "")
    if code == "" or error != "":
        logging.warning(f"auth_error_1: {error}; {error_description}")
        return None

    res = requests.get("https://oauth.vk.com/access_token", {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
        "code": code,
    })
    if not res.ok:
        logging.warning(f"auth_error_2: {res.status_code}; {res.content}")
        return None

    data = res.json()
    access_token = data.get("access_token", None)
    user_id = data.get("user_id", None)

    if user_id is None:
        logging.warning(f"auth_error_3: {data.get('error', None)}; {data.get('error_description', None)}")
        return None

    return user_id, access_token


def create_vk_user(db_sess: Session, user_id: int, access_token: str):
    res = requests.get("https://api.vk.com/method/account.getProfileInfo", {
        "access_token": access_token,
        "v": "5.199",
    })
    if not res.ok:
        logging.warning(f"auth_error_4: {res.status_code}; {res.content}")
        return None

    data = res.json()
    response = data.get("response", None)
    error = data.get("error", {})

    if response is None:
        logging.warning(f"auth_error_5: {error.get('error_code', None)}; {error.get('error_msg', None)}")
        return None

    photo = response.get("photo_200", None)
    first_name = response.get("first_name", "Инкогнито")
    last_name = response.get("last_name", "Инкогнито")

    admin = User.get_admin(db_sess)
    user = User.new(db_sess, admin, f"vk_{user_id}", randstr(8), first_name, [Roles.visitor])
    user.id_vk = user_id
    user.lastName = last_name
    user.imageUrl = photo
    db_sess.commit()

    return user
