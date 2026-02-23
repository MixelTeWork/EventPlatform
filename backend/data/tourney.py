import logging
from typing import TypedDict

from bafser import SingletonMixin, SqlAlchemyBase
from sqlalchemy import JSON
from sqlalchemy.orm import Mapped, Session, mapped_column
from sqlalchemy.orm.attributes import flag_modified

from data import Tables
from data.game import Game
from data.game_start_time import GameStartTime
from data.tourney_character import TourneyCharacter


class TreeNodeDict(TypedDict):
    id: int
    characterId: int
    left: "TreeNodeDict | None"
    right: "TreeNodeDict | None"


class TurneyData(TypedDict):
    tree: TreeNodeDict
    third: int


class TurneyDict(TypedDict):
    tree: TreeNodeDict
    third: int
    curGameNodeId: int
    showGame: bool
    ended: bool
    games: int
    played: int


class Tourney(SqlAlchemyBase, SingletonMixin):
    __tablename__ = Tables.Tourney

    data: Mapped[TurneyData] = mapped_column(JSON, init=False)
    curGameNodeId: Mapped[int] = mapped_column(default=-1)
    showGame: Mapped[bool] = mapped_column(default=False)
    ended: Mapped[bool] = mapped_column(default=False)

    def init(self):
        self.data = INIT_DATA

    @staticmethod
    def get_winners(db_sess: Session):
        tourney = Tourney.get(db_sess)
        tree = tourney.data["tree"]
        winner1 = tree["characterId"]
        winner2 = get_not_winner(tree)
        winner3 = tourney.data["third"]
        return winner1, winner2, winner3

    def gen_new_tree(self):
        characters = TourneyCharacter.all(self.db_sess)
        if len(characters) == 0:
            return

        child_nodes = [tree_node(i, ch.id) for i, ch in enumerate(characters)]
        last_id = child_nodes[-1]["id"]
        parent_nodes: list[TreeNodeDict] = []
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
        self.db_sess.commit()
        logging.info("gen_new_tree")

    def edit_node(self, node_id: int, characterId: int):
        db_sess = Session.object_session(self)
        assert db_sess
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
        assert db_sess
        self.data["third"] = characterId
        flag_modified(self, "data")
        db_sess.commit()
        logging.info(f"set_third {characterId=}")

    def start_game_at_node(self, node_id: int):
        db_sess = Session.object_session(self)
        assert db_sess
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
        assert db_sess

        nodes: list[TreeNodeDict] = []
        next_nodes = [self.data["tree"]]
        while any(n["characterId"] == -1 for n in next_nodes):
            nodes = next_nodes
            next_nodes: list[TreeNodeDict] = []
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
        assert db_sess

        err, opponent1Id, opponent2Id = get_opponents_by_node_id(self.data["tree"], self.curGameNodeId)
        if err < 0:
            return err

        self.showGame = True
        Game.start_new(db_sess, opponent1Id, opponent2Id)
        logging.info(f"start_game {opponent1Id=} {opponent2Id=}")
        return 0

    def end_game(self):
        _, played = get_torney_info(self.data["tree"])
        start_times = GameStartTime.get_all()
        new_start_time = start_times[played + 1] if played + 1 < len(start_times) else None

        winner = Game.end_game(self.db_sess, new_start_time)
        node = find_node(self.data["tree"], self.curGameNodeId)
        err, oponent1Id, oponent2Id = get_opponents_by_node_id(self.data["tree"], self.curGameNodeId)
        if err >= 0 and winner is not None:
            if self.curGameNodeId == -3:
                self.data["third"] = winner
            elif node:
                node["characterId"] = winner
            flag_modified(self, "data")

        self.showGame = False
        self.db_sess.commit()
        logging.info(f"end_game {winner=} {err=} {oponent1Id=} {oponent2Id=}")

    def show_pretourney(self):
        db_sess = Session.object_session(self)
        assert db_sess
        Game.reset(db_sess)
        logging.info("show_pretourney")

    def end_tourney(self):
        db_sess = Session.object_session(self)
        assert db_sess
        game = Game.get(db_sess)
        game.tourneyEnded = True
        self.ended = True
        db_sess.commit()
        logging.info("end_tourney")

    def unend_tourney(self):
        db_sess = Session.object_session(self)
        assert db_sess
        game = Game.get(db_sess)
        game.tourneyEnded = False
        self.ended = False
        db_sess.commit()
        logging.info("unend_tourney")

    def reset(self):
        db_sess = Session.object_session(self)
        assert db_sess
        self.curGameNodeId = -1
        self.showGame = False
        self.ended = False
        self.gen_new_tree()
        Game.reset(db_sess)
        logging.info("reset")

    def get_dict(self) -> "TurneyDict":
        games, played = get_torney_info(self.data["tree"])
        return {
            "tree": self.data["tree"],
            "third": self.data["third"],
            "curGameNodeId": self.curGameNodeId,
            "showGame": self.showGame,
            "ended": self.ended,
            "games": games,
            "played": played,
        }


def tree_node(id: int, characterId: int = -1, left: TreeNodeDict | None = None, right: TreeNodeDict | None = None) -> TreeNodeDict:
    return {
        "id": id,
        "characterId": characterId,
        "left": left,
        "right": right,
    }


def find_node(tree: TreeNodeDict, id: int) -> TreeNodeDict | None:
    if tree["id"] == id:
        return tree
    if tree["left"]:
        r = find_node(tree["left"], id)
        if r:
            return r
    if tree["right"]:
        return find_node(tree["right"], id)
    return None


def get_not_winner(tree: TreeNodeDict):
    if not tree or tree["characterId"] == -1:
        return -1
    left = tree["left"]
    right = tree["right"]
    if not left or not right:
        return -1
    if left["characterId"] == tree["characterId"]:
        return right["characterId"]
    return left["characterId"]


def get_opponents_by_node_id(tree: TreeNodeDict, node_id: int):
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


def get_torney_info(tree: TreeNodeDict):
    """Returns: (games count, played games)"""
    games = 0
    played = 0

    queue: list[TreeNodeDict] = [tree]
    while queue:
        node = queue.pop(0)
        if node["left"] and node["right"]:
            games += 1
            if node["characterId"] >= 0:
                played += 1
        if node["left"]:
            queue.append(node["left"])
        if node["right"]:
            queue.append(node["right"])

    return games, played


INIT_DATA: TurneyData = {
    "tree": tree_node(1),
    "third": -1,
}
