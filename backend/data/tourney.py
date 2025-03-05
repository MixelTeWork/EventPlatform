import logging
from sqlalchemy import JSON, Column, DefaultClause, Integer
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables
from data.tourney_character import TourneyCharacter


class Tourney(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Tourney

    data = Column(JSON, nullable=False)
    curGameNodeId = Column(Integer, DefaultClause("-1"), nullable=False)

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

        child_nodes = [tree_node(i, ch.id) for i, ch in enumerate(characters)]
        last_id = child_nodes[-1]["id"]
        parent_nodes = []
        while len(child_nodes) != 1:
            while len(child_nodes) > 0:
                last_id += 1
                if len(child_nodes) > 1:
                    parent_nodes.append(tree_node(last_id, -1, child_nodes.pop(), child_nodes.pop()))
                else:
                    child = child_nodes.pop()
                    parent_nodes.append(tree_node(last_id, child["characterId"], child))
            child_nodes = parent_nodes
            parent_nodes = []

        self.data["tree"] = child_nodes.pop()
        flag_modified(self, "data")
        db_sess.commit()

    def edit_node(self, node_id: int, characterId: int):
        db_sess = Session.object_session(self)
        node = find_node(self.data["tree"], node_id)
        if not node:
            return False

        node["characterId"] = characterId

        flag_modified(self, "data")
        db_sess.commit()
        logging.info(f"edit_node {node_id=} {characterId=}")
        return True

    def set_third(self, characterId: int):
        db_sess = Session.object_session(self)
        self.data["third"] = characterId
        flag_modified(self, "data")
        db_sess.commit()
        logging.info(f"set_third {characterId=}")

    def start_game_at_node(self, node_id: int):
        db_sess = Session.object_session(self)
        if node_id != -1 and node_id != -3:
            node = find_node(self.data["tree"], node_id)
            if not node:
                return -1

            if not node["left"] or not node["right"]:
                return -2

            if node["left"]["characterId"] == -1 or node["right"]["characterId"] == -1:
                return -3

        self.curGameNodeId = node_id

        db_sess.commit()
        logging.info(f"start_game_at_node {node_id=}")
        return 0

    def get_dict(self):
        return {
            "tree": self.data["tree"],
            "third": self.data["third"],
            "curGameNodeId": self.curGameNodeId,
        }


def tree_node(id: int, characterId=-1, left=None, right=None):
    return {
        "id": id,
        "characterId": characterId,
        "left": left,
        "right": right,
    }


def find_node(tree, id: int):
    if tree["id"] == id:
        return tree
    if tree["left"]:
        r = find_node(tree["left"], id)
        if r:
            return r
    if tree["right"]:
        return find_node(tree["right"], id)
    return False


INIT_DATA = {
    "tree": tree_node(1),
    "third": -1,
}
