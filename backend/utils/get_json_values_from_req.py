from typing import Any, Union
from flask import g, Response

from utils import get_json_values, reponse_msg

field_name = str
default_value = Any
values_tuple = list[Any]
responseCode = int
errorRes = tuple[Response, responseCode]


def get_json_values_from_req(*field_names: Union[field_name, tuple[field_name, default_value]]) -> tuple[values_tuple, Union[errorRes, None]]:
    data, is_json = g.json
    if not is_json:
        return [], (reponse_msg("body is not json"), 415)

    values, values_error = get_json_values(data, *field_names)

    if values_error:
        return [], (reponse_msg(values_error), 400)

    return values, None
