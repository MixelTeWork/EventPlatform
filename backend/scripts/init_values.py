import sys
import os


def init_values(dev=False, cmd=False):
    if dev:
        if not os.path.exists("db"):
            os.makedirs("db")
        if cmd:
            add_parent_to_path()
    else:
        add_parent_to_path()

    from data import db_session
    from data.get_datetime_now import get_datetime_now
    from data.operation import Operation, Operations
    from data.permission import Permission
    from data.role import Role, Roles, ROLES
    from data.game import Game
    from data.log import Actions, Log, Tables
    from data.user import User
    from data.dialog import Dialog

    now = get_datetime_now()

    def log(db_sess, user_admin, tableName, recordId, changes):
        db_sess.add(Log(
            date=now,
            actionCode=Actions.added,
            userId=user_admin.id,
            userName=user_admin.name,
            tableName=tableName,
            recordId=recordId,
            changes=changes
        ))

    def init():
        db_session.global_init("dev" in sys.argv)
        db_sess = db_session.create_session()

        for operation in Operations.get_all():
            db_sess.add(Operation(id=operation[0], name=operation[1]))

        roles = []
        for role_id, role_data in ROLES.items():
            role_name = role_data["name"]
            role = Role(name=role_name, id=role_id)
            roles.append(role)
            db_sess.add(role)

            for operation in role_data["operations"]:
                db_sess.add(Permission(roleId=role_id, operationId=operation[0]))

        role_admin = Role(name="Админ", id=Roles.admin)
        roles.append(role_admin)
        db_sess.add(role_admin)

        for operation in Operations.get_all():
            db_sess.add(Permission(roleId=Roles.admin, operationId=operation[0]))

        user_admin = User.new(User(id=1, name="Админ"), "admin", "admin", "Админ", [Roles.admin], db_sess=db_sess)

        log_changes(db_sess, user_admin, roles)

        Game.init(db_sess)
        Dialog.new(user_admin, {"nodes": []}, 1)
        Dialog.new(user_admin, {"nodes": []}, 2)

        from data.quest import Quest
        from utils.randstr import randstr
        quests = [
            (1, "Чудик в углу"),
            (2, "Инфостенд первый"),
            (3, "Инфостенд второй"),
            (4, "Инди зона"),
            (5, "Гейм зона"),
            (6, "Стенды"),
            (7, "Баннер"),
        ]
        quest1 = None
        for (i, name) in quests:
            quest = Quest(id=i, name=name, description="", reward=0, hidden=False, id_big=randstr(8))
            log(db_sess, user_admin, Tables.Quest, i, quest.get_creation_changes())
            db_sess.add(quest)
            if quest1 is None:
                quest1 = quest
        db_sess.commit()

        if dev:
            init_values_dev(db_sess, user_admin, quest1)

    def log_changes(db_sess, user_admin, roles):
        for role in roles:
            log(db_sess, user_admin, Tables.Role, role.id, role.get_creation_changes())

        db_sess.commit()

    def init_values_dev(db_sess, user_admin, quest1):
        from datetime import timedelta
        from random import randint, choice
        import shutil
        from utils.randstr import randstr
        from data.store_item import StoreItem
        from data.image import Image
        from data.dialog_character import DialogCharacter

        user_admin.balance = 100

        shutil.copy("scripts/dev_init_data/1.jpeg", "images/1.jpeg")
        shutil.copy("scripts/dev_init_data/2.jpeg", "images/2.jpeg")
        img1 = Image(id=1, name="img1", type="jpeg")
        img2 = Image(id=2, name="img2", type="jpeg")
        db_sess.add(img1)
        db_sess.add(img2)

        character1 = DialogCharacter.new(user_admin, "Ярик Всемогущий", 1)
        character2 = DialogCharacter.new(user_admin, "Альвер Шухтен", 2)

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

        quest1.dialog1Id = dialog.id

        # for i in range(15):
        #     description = f"Описание квеста №{i + 1}\nLorem, ipsum dolor sit amet consectetur adipisicing elit."
        #     quest = Quest(id=i, name=f"Квест {i + 1}", description=description,
        #                   reward=(i + 1) * 5234 % 150 + 50, hidden=i % 5 == 0, id_big=randstr(8))
        #     if i == 1:
        #         quest.dialog1Id = dialog.id
        #     log(db_sess, user_admin, Tables.Quest, i, quest.get_creation_changes())
        #     db_sess.add(quest)

        for i in range(15):
            item = StoreItem(id=i, name=f"Товар {i + 1}", price=(i + 1) * 5432 % 150 + 50, count=(i + 1) * 2654 % 150 + 50, id_big=randstr(8))
            log(db_sess, user_admin, Tables.StoreItem, i, item.get_creation_changes())
            db_sess.add(item)

        User.new(user_admin, "manager", "manager", "Организатор", [Roles.manager, Roles.worker])
        User.new(user_admin, "worker", "worker", "Волонтёр", [Roles.worker])

        db_sess.commit()

    init()


def add_parent_to_path():
    current = os.path.dirname(os.path.realpath(__file__))
    parent = os.path.dirname(current)
    sys.path.append(parent)


def read_file(path):
    with open(path) as f:
        return f.read()


if __name__ == "__main__":
    init_values("dev" in sys.argv, True)
