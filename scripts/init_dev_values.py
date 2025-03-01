import json
import sys
import os


def init_dev_values(dev=False, cmd=False):
    print(f"init_dev_values {dev=}")
    if cmd:
        add_parent_to_path()

    import shutil
    from random import randint, seed
    from bfs import db_session, Log, Image, randstr, get_datetime_now
    from data._roles import Roles
    from data.dialog import Dialog
    from data.dialog_character import DialogCharacter
    from data.tourney import Tourney
    from data.tourney_character import TourneyCharacter
    from data.quest import Quest
    from data.store_item import StoreItem
    from data.user import User

    db_session.global_init(dev)
    db_sess = db_session.create_session()
    user_admin = User.get_admin(db_sess)

    user_admin.balance = 100

    now = get_datetime_now()
    shutil.copy("scripts/dev_init_data/1.jpeg", "images/1.jpeg")
    shutil.copy("scripts/dev_init_data/2.jpeg", "images/2.jpeg")
    shutil.copy("scripts/dev_init_data/3.png", "images/3.png")
    shutil.copy("scripts/dev_init_data/4.png", "images/4.png")
    db_sess.add(Image(id=1, name="img1", type="jpeg", creationDate=now, createdById=user_admin.id))
    db_sess.add(Image(id=2, name="img2", type="jpeg", creationDate=now, createdById=user_admin.id))
    db_sess.add(Image(id=3, name="img3", type="png", creationDate=now, createdById=user_admin.id))
    db_sess.add(Image(id=4, name="img4", type="png", creationDate=now, createdById=user_admin.id))
    db_sess.add(Image(id=5, name="img5", type="png", creationDate=now, createdById=user_admin.id))

    character1 = DialogCharacter.new(user_admin, "Ярик Всемогущий", 1, 1)
    character2 = DialogCharacter.new(user_admin, "Альвер Шухтен", 2, 1)

    TourneyCharacter.new(user_admin, "Ярик Всемогущий", "#ae00ff", 1)
    TourneyCharacter.new(user_admin, "Альвер Шухтен", "#00ccff", 2)
    TourneyCharacter.new(user_admin, "Курита Мален", "#ffae00", 3)
    TourneyCharacter.new(user_admin, "Суль Минохон", "#00ff1e", 4)
    TourneyCharacter.new(user_admin, "Минь Сулёхен", "#ff0000", 4)
    for i in range(16 - 5):
        seed(i + 7)
        TourneyCharacter.new(user_admin, f"Бот #{i+1}", f"#{randint(0, 16777215):x}", 5)
    Tourney.get(db_sess).gen_new_tree()
    Tourney.get(db_sess).data = json.loads(read_file("scripts/dev_init_data/tourney.json"))

    dialog = Dialog.new(user_admin, {
        "nodes": [
            {
                "characterId": character1.id,
                "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, quo distinctio quisquam ab aliquid delectus natus, officiis assumenda consequatur unde perspiciatis error quos laudantium laborum. Totam tenetur alias reiciendis voluptatibus.",  # noqa: E501
            },
            {
                "characterId": character2.id,
                "text": "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti, quo distinctio quisquam ab aliquid delectus natus.",
            }
        ]})

    quest1 = Quest.get(db_sess, 1)
    quest1.dialog1Id = dialog.id

    for i in range(15):
        item = StoreItem(id=i, name=f"Товар {i + 1}", price=(i + 1) * 5432 % 150 + 50, count=(i + 1) * 2654 % 150 + 50, id_big=randstr(8))
        Log.added(item, user_admin, [("name", item.name), ("price", item.price), ("count", item.count), ("imgId", item.imgId)], commit=False)
        db_sess.add(item)

    User.new(user_admin, "manager", "manager", "Организатор", [Roles.manager, Roles.worker])
    User.new(user_admin, "worker", "worker", "Волонтёр", [Roles.worker])

    db_sess.commit()
    db_sess.close()


def add_parent_to_path():
    current = os.path.dirname(os.path.realpath(__file__))
    parent = os.path.dirname(current)
    sys.path.append(parent)


def read_file(path: str):
    with open(path, "r", encoding="utf8") as f:
        return f.read()


if __name__ == "__main__":
    init_dev_values("dev" in sys.argv, True)
