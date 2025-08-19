import os
import json
import shutil
from random import randint, seed

from sqlalchemy.orm import Session
from bafser import AppConfig, Log, Image, randstr, get_datetime_now

import bafser_config
from data._roles import Roles
from data.dialog import Dialog
from data.dialog_character import DialogCharacter
from data.tourney import Tourney
from data.tourney_character import TourneyCharacter
from data.quest import Quest
from data.store_item import StoreItem
from data.user import User


def init_dev_values(db_sess: Session, config: AppConfig):
    user_admin = User.get_admin(db_sess)
    assert user_admin
    user_admin.balance = 100

    now = get_datetime_now()
    os.makedirs(bafser_config.images_folder, exist_ok=True)
    for i, ext in enumerate(["jpeg", "jpeg", "png", "png", "png"]):
        id = i + 1
        shutil.copy(f"scripts/dev_init_data/{id}.{ext}", f"{bafser_config.images_folder}/{id}.{ext}")
        img = Image(name=f"img{id}", type=ext, creationDate=now, createdById=user_admin.id)
        img.id = id
        db_sess.add(img)

    character1 = DialogCharacter.new(user_admin, "Ярик Всемогущий", 1, 1)
    character2 = DialogCharacter.new(user_admin, "Альвер Шухтен", 2, 1)

    TourneyCharacter.new(user_admin, "Ярик Всемогущий", "#ae00ff", 1)
    TourneyCharacter.new(user_admin, "Альвер Шухтен", "#00ccff", 2)
    TourneyCharacter.new(user_admin, "Курита Мален", "#ffae00", 3)
    TourneyCharacter.new(user_admin, "Суль Минохон", "#00ff1e", 4)
    TourneyCharacter.new(user_admin, "Минь Сулёхен", "#ff0000", 4)
    for i in range(16 - 5):
        seed(i + 7)
        TourneyCharacter.new(user_admin, f"Бот #{i + 1}", f"#{randint(0, 16777215):x}", 5)
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
        Log.added(quest, user_admin, quest.get_creation_changes(), now=now, commit=False, db_sess=db_sess)
        db_sess.add(quest)

    quest1 = Quest.get(db_sess, 1)
    assert quest1
    quest1.dialog1Id = dialog.id

    for i in range(15):
        item = StoreItem(name=f"Товар {i + 1}", price=(i + 1) * 5432 % 150 + 50, count=(i + 1) * 2654 % 150 + 50)
        item.id = i + 1
        item.id_big = randstr(8)
        Log.added(item, user_admin, [("name", item.name), ("price", item.price), ("count", item.count), ("imgId", item.imgId)], commit=False)
        db_sess.add(item)

    User.new(user_admin, "boss", "boss", "Организатор", [Roles.boss, Roles.manager, Roles.staff])
    User.new(user_admin, "manager", "manager", "Управляющий", [Roles.manager, Roles.staff])
    User.new(user_admin, "staff", "staff", "Волонтёр", [Roles.staff])

    db_sess.commit()


def read_file(path: str):
    with open(path, "r", encoding="utf8") as f:
        return f.read()
