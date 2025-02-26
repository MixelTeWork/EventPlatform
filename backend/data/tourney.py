from sqlalchemy import JSON, Column
from sqlalchemy.orm import Session

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables
from data.tourney_character import TourneyCharacter


# add init to alembic
class Tourney(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Tourney

    data = Column(JSON, nullable=False)

    @staticmethod
    def init(db_sess: Session):
        game = Tourney.get(db_sess)
        if game is not None:
            return
        db_sess.add(Tourney(id=1, data=INIT_DATA))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.get(Tourney, 1)

    def gen_new_tree(self):
        db_sess = Session.object_session(self)
        characters = TourneyCharacter.all(db_sess)
        if len(characters) == 0:
            return

        child_nodes = [tree_node(ch.id) for ch in characters]
        parent_nodes = []
        while len(child_nodes) != 1:
            while len(child_nodes) > 0:
                if len(child_nodes) > 1:
                    parent_nodes.append(tree_node(-1, child_nodes.pop(), child_nodes.pop()))
                else:
                    parent_nodes.append(tree_node(-1, child_nodes.pop()))
            child_nodes = parent_nodes
            parent_nodes = []

        self.data = {"tree": child_nodes.pop()}
        db_sess.commit()

    def get_dict(self):
        return self.data


def tree_node(characterId=-1, left=None, right=None):
    return {
        "characterId": characterId,
        "left": left,
        "right": right,
    }


INIT_DATA = {
    "tree": tree_node()
}
