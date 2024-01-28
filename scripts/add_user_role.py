import sys


def add_user_role(userId, roleId):
    userId, roleId = int(userId), int(roleId)
    add_parent_to_path()
    from data import db_session
    from data.user import User
    from data.role import Role

    db_session.global_init("dev" in sys.argv)
    session = db_session.create_session()
    user_admin = User.get_admin(session)
    user: User = session.get(User, userId)
    if not user:
        print(f"User with id [{userId}] does not exist")
        return
    role = session.get(Role, roleId)
    if not role:
        print(f"Role with id [{roleId}] does not exist")
        return

    ok = user.add_role(session, user_admin, roleId)

    if not ok:
        print("User role already exist")
        return

    print("User role added")


def add_parent_to_path():
    import os

    current = os.path.dirname(os.path.realpath(__file__))
    parent = os.path.dirname(current)
    sys.path.append(parent)


if not (len(sys.argv) == 3 or (len(sys.argv) == 4 and sys.argv[-1] == "dev")):
    print("Add user role: userId roleId [dev]")
else:
    add_user_role(sys.argv[1], sys.argv[2])
