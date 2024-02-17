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

    from datetime import timedelta
    from random import randint, choice
    from data import db_session
    from data.log import Actions, Log, Tables
    from data.operation import Operation, Operations
    from data.permission import Permission
    from utils.randstr import randstr
    from data.role import Role, Roles, ROLES
    from data.user import User
    from data.quest import Quest
    from data.race import Race
    from data.store_item import StoreItem
    from data.get_datetime_now import get_datetime_now

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

        user_admin = User.new(db_sess, User(id=1, name="Админ"), "admin", "admin", "Админ", [Roles.admin])

        log_changes(db_sess, user_admin, roles)

        Race.init(db_sess)

        if dev:
            init_values_dev(db_sess, user_admin)

    def log_changes(db_sess, user_admin, roles):
        now = get_datetime_now()

        def log(tableName, recordId, changes):
            db_sess.add(Log(
                date=now,
                actionCode=Actions.added,
                userId=user_admin.id,
                userName=user_admin.name,
                tableName=tableName,
                recordId=recordId,
                changes=changes
            ))

        for role in roles:
            log(Tables.Role, role.id, role.get_creation_changes())

        db_sess.commit()

    def init_values_dev(db_sess, user_admin):
        now = get_datetime_now()
        user_admin.balance = 100

        def log(tableName, recordId, changes):
            db_sess.add(Log(
                date=now,
                actionCode=Actions.added,
                userId=user_admin.id,
                userName=user_admin.name,
                tableName=tableName,
                recordId=recordId,
                changes=changes
            ))

        for i in range(15):
            description = f"Описание квеста №{i + 1}\nLorem, ipsum dolor sit amet consectetur adipisicing elit."
            quest = Quest(id=i, name=f"Квест {i + 1}", description=description,
                          reward=(i + 1) * 5234 % 150 + 50, hidden=i % 5 == 0, id_big=randstr(8))
            log(Tables.Quest, i, quest.get_creation_changes())
            db_sess.add(quest)

        for i in range(15):
            item = StoreItem(id=i, name=f"Товар {i + 1}", price=(i + 1) * 5432 % 150 + 50, count=(i + 1) * 2654 % 150 + 50, id_big=randstr(8))
            log(Tables.StoreItem, i, item.get_creation_changes())
            db_sess.add(item)

        User.new(db_sess, user_admin, "manager", "manager", "Организатор", [Roles.manager, Roles.worker])
        User.new(db_sess, user_admin, "worker", "worker", "Волонтёр", [Roles.worker])

        db_sess.commit()

    init()


def add_parent_to_path():
    current = os.path.dirname(os.path.realpath(__file__))
    parent = os.path.dirname(current)
    sys.path.append(parent)


if __name__ == "__main__":
    init_values("dev" in sys.argv, True)
