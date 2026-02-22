from bafser import RolesBase

from data._operations import Operations


class Roles(RolesBase):
    boss = 2
    manager = 3
    staff = 4
    visitor = 5


Roles.ROLES = {
    Roles.boss: {
        "name": "Организатор",
        "operations": [
            Operations.promote_manager,
            Operations.manage_store,
            Operations.manage_quest,
            Operations.site_config,
        ]
    },
    Roles.manager: {
        "name": "Управляющий",
        "operations": [
            Operations.promote_staff,
        ]
    },
    Roles.staff: {
        "name": "Персонал",
        "operations": [
            Operations.page_staff,
            Operations.page_staff_quest,
            Operations.page_staff_store,
            Operations.page_stats,
            Operations.send_any,
            Operations.manage_games,
        ]
    },
    Roles.visitor: {
        "name": "Посетитель",
        "operations": []
    },
}
