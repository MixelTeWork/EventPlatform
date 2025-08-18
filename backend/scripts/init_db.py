import os
from sqlalchemy.orm import Session
from bafser import AppConfig, Log, get_datetime_now, randstr

from data.dialog import Dialog
from data.game import Game
from data.other import Other
from data.quest import Quest
from data.tourney import Tourney
from data.user import User


def init_db(db_sess: Session, config: AppConfig):
    user_system = User.get_fake_system()

    Other.get(db_sess)
    Game.get(db_sess)
    Tourney.get(db_sess)
    Dialog.new(user_system, {"nodes": []}, 1, db_sess=db_sess)
    Dialog.new(user_system, {"nodes": []}, 2, db_sess=db_sess)

    quests = [
        (1, "Чудик в углу"),
        (2, "Соня"),
        (3, "Обручальный"),
        (4, "Чёрный"),
        (5, "Крылатый"),
        (6, "Парочка"),
    ]
    now = get_datetime_now()
    for (i, name) in quests:
        quest = Quest(name=name, description="", reward=0, hidden=False)
        quest.id = i
        quest.id_big = randstr(8)
        Log.added(quest, user_system, quest.get_creation_changes(), now=now, commit=False, db_sess=db_sess)
        db_sess.add(quest)

    admin = User.get_by_login(db_sess, "admin")
    if admin:
        admin.set_password(os.environ.get("ADMINPWD", randstr(16)))
        db_sess.commit()

    db_sess.commit()
