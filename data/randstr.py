import string
from random import choices


def randstr(N: int):
    return ''.join(choices(string.ascii_letters + string.digits, k=N))
