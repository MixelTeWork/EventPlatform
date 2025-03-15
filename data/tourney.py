import logging
from sqlalchemy import JSON, Boolean, Column, DefaultClause, Integer
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from bfs import SqlAlchemyBase, IdMixin
from data._tables import Tables
from data.game import Game
from data.tourney_character import TourneyCharacter


class Tourney(SqlAlchemyBase, IdMixin):
    __tablename__ = Tables.Tourney

    data = Column(JSON, nullable=False)
    curGameNodeId = Column(Integer, DefaultClause("-1"), nullable=False)
    showGame = Column(Boolean, DefaultClause("0"), nullable=False)
    ended = Column(Boolean, DefaultClause("0"), nullable=False)

    @staticmethod
    def init(db_sess: Session):
        tourney = Tourney.get(db_sess)
        if tourney is not None:
            return
        db_sess.add(Tourney(id=1, data=INIT_DATA))
        db_sess.commit()

    @staticmethod
    def get(db_sess: Session):
        return db_sess.get(Tourney, 1)

    @staticmethod
    def get_winners(db_sess: Session):
        tourney = Tourney.get(db_sess)
        tree = tourney.data["tree"]
        winner1 = tree["characterId"]
        winner2 = get_not_winner(tree)
        winner3 = tourney.data["third"]
        return winner1, winner2, winner3

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
        logging.info("gen_new_tree")

    def edit_node(self, node_id: int, characterId: int):
        db_sess = Session.object_session(self)
        node = find_node(self.data["tree"], node_id)
        if not node:
            return False

        node["characterId"] = characterId

        if self.curGameNodeId != -1:
            err, opponent1, opponent2 = get_opponents_by_node_id(self.data["tree"], self.curGameNodeId)
            if err >= 0 and (opponent1 == characterId or opponent2 == characterId or characterId == -1):
                game = Game.get(db_sess)
                if game and game.opponent1Id == opponent1 and game.opponent2Id == opponent2:
                    if characterId == game.opponent1Id:
                        game.winner = 1
                    elif characterId == game.opponent2Id:
                        game.winner = 2
                    else:
                        game.winner = 0

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
        if node_id != -1:
            err, _, _ = get_opponents_by_node_id(self.data["tree"], node_id)
            if err < 0:
                return err

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
        else:
            next_node = next((n for n in nodes if n["characterId"] == -1), None)
            if next_node:
                node_id = next_node["id"]

        self.curGameNodeId = node_id
        db_sess.commit()
        logging.info(f"start_next_game {node_id=}")

    def start_game(self):
        db_sess = Session.object_session(self)

        err, opponent1Id, opponent2Id = get_opponents_by_node_id(self.data["tree"], self.curGameNodeId)
        if err < 0:
            return err

        self.showGame = True
        Game.start_new(db_sess, opponent1Id, opponent2Id)
        logging.info(f"start_game {opponent1Id=} {opponent2Id=}")
        return 0

    def end_game(self):
        db_sess = Session.object_session(self)

        winner = Game.end_game(db_sess)
        node = find_node(self.data["tree"], self.curGameNodeId)
        err, oponent1Id, oponent2Id = get_opponents_by_node_id(self.data["tree"], self.curGameNodeId)
        if err >= 0 and (winner == oponent1Id or winner == oponent2Id):
            if self.curGameNodeId == -3:
                self.data["third"] = winner
            elif node:
                node["characterId"] = winner
            flag_modified(self, "data")

        self.showGame = False
        db_sess.commit()
        logging.info(f"end_game {winner=} {err=} {oponent1Id=} {oponent2Id=}")

    def show_pretourney(self):
        db_sess = Session.object_session(self)
        Game.reset(db_sess)
        logging.info("show_pretourney")

    def end_tourney(self):
        db_sess = Session.object_session(self)
        game = Game.get(db_sess)
        game.tourneyEnded = True
        self.ended = True
        db_sess.commit()
        logging.info("end_tourney")

    def unend_tourney(self):
        db_sess = Session.object_session(self)
        game = Game.get(db_sess)
        game.tourneyEnded = False
        self.ended = False
        db_sess.commit()
        logging.info("unend_tourney")

    def reset(self):
        db_sess = Session.object_session(self)
        self.curGameNodeId = -1
        self.showGame = False
        self.ended = False
        self.gen_new_tree()
        Game.reset(db_sess)
        logging.info("reset")

    def get_dict(self):
        return {
            "tree": self.data["tree"],
            "third": self.data["third"],
            "curGameNodeId": self.curGameNodeId,
            "showGame": self.showGame,
            "ended": self.ended,
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
    return None


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


def get_opponents_by_node_id(tree, node_id: int):
    if node_id != -3 and node_id < 0:
        return -1, -1, -1

    if node_id == -3:
        if not tree["left"] or not tree["right"]:
            return -2, -1, -1

        left = get_not_winner(tree["left"])
        right = get_not_winner(tree["right"])

        if left == -1 or right == -1:
            return -3, -1, -1

        return 0, left, right

    node = find_node(tree, node_id)
    if not node:
        return -1, -1, -1

    if not node["left"] or not node["right"]:
        return -2, -1, -1

    left = node["left"]["characterId"]
    right = node["right"]["characterId"]
    if left == -1 or right == -1:
        return -3, -1, -1

    return 0, left, right


INIT_DATA = {
    "tree": tree_node(1),
    "third": -1,
}
