from flask import jsonify


def reponse_msg(msg: str):
    return jsonify({"msg": msg})
