from functools import wraps
from flask import abort
from data.user import User


def permission_required(*operations: tuple[str, str]):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user = None
            if "user" in kwargs:
                user: User = kwargs["user"]
            else:
                abort(500, "permission_required: no user")

            for operation in operations:
                if not user.check_permission(operation[0]):
                    abort(403)

            return fn(*args, **kwargs)

        return decorator

    return wrapper


def permission_required_any(*operations: tuple[str, str]):
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            user = None
            if "user" in kwargs:
                user: User = kwargs["user"]
            else:
                abort(500, "permission_required: no user")

            passed = False
            for operation in operations:
                if user.check_permission(operation[0]):
                    passed = True
                    break

            if not passed:
                abort(403)

            return fn(*args, **kwargs)

        return decorator

    return wrapper
