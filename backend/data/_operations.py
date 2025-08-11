from bafser import OperationsBase


class Operations(OperationsBase):
    page_dev = ("page_dev", "Страница отладки")
    page_staff = ("page_staff", "Страница для персонала")
    page_staff_quest = ("page_staff_quest", "Страница кодов квестов")
    page_staff_store = ("page_staff_store", "Страница кодов товаров")
    page_stats = ("page_stats", "Страница статистики")

    promote_staff = ("promote_staff", "Повысить до волонтёра")
    promote_manager = ("promote_manager", "Повысить до управляющего")

    manage_store = ("manage_store", "Управление товарами")
    manage_quest = ("manage_quest", "Управление квестами")
    manage_games = ("manage_games", "Управление играми")

    add_any_image = ("add_any_image", "Добавление картинок")
    send_any = ("send_any", "Любые пересылки")
    site_config = ("site_config", "Настройка сайта")
