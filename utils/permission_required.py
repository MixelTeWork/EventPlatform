from functools import wraps
from flask import abort
from data.user import User


def permission_required(operation: tuple[str, str]):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user = None
            if "user" in kwargs:
                user: User = kwargs["user"]
            else:
                abort(500, "permission_required: no user")

            if not user.check_permission(operation[0]):
                abort(403)

            return fn(*args, **kwargs)

        return decorator

    return wrapper
