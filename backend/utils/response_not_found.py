from utils import reponse_msg


def response_not_found(name: str, id: int):
    return reponse_msg(f"{name.capitalize()} with '{name}Id={id}' not found"), 400
