from bfs import OperationsBase


class Operations(OperationsBase):
    page_users = ("page_users", "Страница пользователей")
    page_debug = ("page_debug", "Страница отладки")
    page_worker = ("page_worker", "Страница для персонала")
    page_worker_quest = ("page_worker_quest", "Страница кодов квестов")
    page_worker_store = ("page_worker_store", "Страница кодов товаров")
    page_stats = ("page_stats", "Страница статистики")

    promote_worker = ("promote_worker", "Повысить до волонтёра")
    promote_manager = ("promote_manager", "Повысить до управляющего")

    manage_store = ("manage_store", "Управление товарами")
    manage_quest = ("manage_quest", "Управление квестами")
    manage_games = ("manage_games", "Управление играми")

    add_any_image = ("add_any_image", "Добавление картинок")
    send_any = ("send_any", "Любые пересылки")
    site_config = ("site_config", "Настройка сайта")
