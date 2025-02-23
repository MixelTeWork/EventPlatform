import sys
import os


def init_values(dev=False, cmd=False):
    print(f"init_values {dev=}")
    if cmd:
        add_parent_to_path()

    from bfs import db_session, Log, get_datetime_now, randstr
    from data.dialog import Dialog
    from data.game import Game
    from data.quest import Quest
    from data.tourney import Tourney
    from data.user import User

    db_session.global_init(dev)
    db_sess = db_session.create_session()
    user_admin = User.get_admin(db_sess)

    Game.init(db_sess)
    Tourney.init(db_sess)
    Dialog.new(user_admin, {"nodes": []}, 1)
    Dialog.new(user_admin, {"nodes": []}, 2)

    quests = [
        (1, "Чудик в углу"),
        (2, "Инфостенд первый"),
        (3, "Инфостенд второй"),
        (4, "Инди зона"),
        (5, "Гейм зона"),
        (6, "Стенды"),
        (7, "Баннер"),
    ]
    now = get_datetime_now()
    for (i, name) in quests:
        quest = Quest(id=i, name=name, description="", reward=0, hidden=False, id_big=randstr(8))
        Log.added(quest, user_admin, quest.get_creation_changes(), now=now, commit=False)
        db_sess.add(quest)

    db_sess.commit()
    db_sess.close()


def add_parent_to_path():
    current = os.path.dirname(os.path.realpath(__file__))
    parent = os.path.dirname(current)
    sys.path.append(parent)


if __name__ == "__main__":
    init_values("dev" in sys.argv, True)
