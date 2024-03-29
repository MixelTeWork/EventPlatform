from sqlalchemy import Column, String
from sqlalchemy_serializer import SerializerMixin
from .db_session import SqlAlchemyBase


class Operation(SqlAlchemyBase, SerializerMixin):
    __tablename__ = "Operation"

    id   = Column(String(32), primary_key=True, unique=True)
    name = Column(String(32), nullable=False)

    def __repr__(self):
        return f"<Operation> {self.id} {self.name}"

    # def get_dict(self):
    #     return self.to_dict(only=("id", "name"))


class Operations:
    # pages
    page_users = ("page_users", "Страница пользователей")
    page_debug = ("page_debug", "Страница отладки")
    page_worker = ("page_worker", "Страница для персонала")
    page_worker_quest = ("page_worker_quest", "Страница кодов квестов")
    page_worker_store = ("page_worker_store", "Страница кодов товаров")

    promote_worker = ("promote_worker", "Повысить до волонтёра")
    promote_manager = ("promote_manager", "Повысить до управляющего")

    manage_store = ("manage_store", "Управление товарами")
    manage_quest = ("manage_quest", "Управление квестами")
    manage_games = ("manage_games", "Управление играми")

    add_any_image = ("add_any_image", "Добавление картинок")
    send_any = ("send_any", "Любые пересылки")

    @staticmethod
    def get_all():
        obj = Operations()
        members = [attr for attr in dir(obj) if not callable(getattr(obj, attr)) and not attr.startswith("__")]
        return map(lambda x: getattr(obj, x), members)
