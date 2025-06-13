from bafser import RolesBase
from data._operations import Operations


class Roles(RolesBase):
    boss = 2
    manager = 3
    worker = 4
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
            Operations.promote_worker,
        ]
    },
    Roles.worker: {
        "name": "Персонал",
        "operations": [
            Operations.page_worker,
            Operations.page_worker_quest,
            Operations.page_worker_store,
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
