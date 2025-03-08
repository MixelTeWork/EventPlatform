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
        self.data["third"] = -1
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
        elif node_id == -3:
            if not self.data["tree"]["left"] or not self.data["tree"]["right"]:
                return -2

            if self.data["tree"]["left"]["characterId"] == -1 or self.data["tree"]["right"]["characterId"] == -1:
                return -3

        self.curGameNodeId = node_id

        db_sess.commit()
        logging.info(f"start_game_at_node {node_id=}")
        return 0

    def select_next_game(self):
        db_sess = Session.object_session(self)

        nodes = []
        next_nodes = [self.data["tree"]]
        while any(n["characterId"] == -1 for n in next_nodes):
            nodes = next_nodes
            next_nodes = []
            for node in nodes:
                if node["left"]:
                    next_nodes.append(node["left"])
                if node["right"]:
                    next_nodes.append(node["right"])

        node_id = -1
        if len(next_nodes) == 2 and self.data["third"] == -1:
            node_id = -3
            # if True:
            #     self.data["third"] = get_not_winner(self.data["tree"]["left"])
            #     flag_modified(self, "data")
        else:
            next_node = next((n for n in nodes if n["characterId"] == -1), None)
            if next_node:
                node_id = next_node["id"]
                # if True:
                #     next_node["characterId"] = next_node["left"]["characterId"]
                #     flag_modified(self, "data")

        self.curGameNodeId = node_id
        db_sess.commit()
        logging.info(f"start_next_game {node_id=}")

    def start_game(self):
        pass

    def end_game(self):
        pass

    def reset(self):
        self.gen_new_tree()

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


def get_not_winner(tree):
    if not tree or tree["characterId"] == -1:
        return -1
    left = tree["left"]
    right = tree["right"]
    if not left or not right:
        return -1
    if left["characterId"] == tree["characterId"]:
        return right["characterId"]
    return left["characterId"]


INIT_DATA = {
    "tree": tree_node(1),
    "third": -1,
}
