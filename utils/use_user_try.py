from functools import wraps
from flask import abort
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy.orm import Session
from data.user import User


def use_user_try():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            if "db_sess" not in kwargs:
                abort(500, "use_user_try: no db_sess")

            db_sess: Session = kwargs["db_sess"]
            try:
                jwt = verify_jwt_in_request(True, False)
                if jwt is None:
                    return fn(*args, **kwargs, user=None)
            except Exception:
                return fn(*args, **kwargs, user=None)

            jwt_identity = get_jwt_identity()
            if (not isinstance(jwt_identity, list) and not isinstance(jwt_identity, tuple)) or len(jwt_identity) != 2:
                return fn(*args, **kwargs, user=None)

            user: User = db_sess.query(User).filter(User.id == jwt_identity[0], User.deleted == False).first()
            if not user:
                return fn(*args, **kwargs, user=None)
            if user.password != jwt_identity[1]:
                return fn(*args, **kwargs, user=None)

            return fn(*args, **kwargs, user=user)

        return decorator

    return wrapper
