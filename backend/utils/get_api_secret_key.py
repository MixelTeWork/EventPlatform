import os

SECRET_KEY_PATH = "api_secret_key.txt"


def get_api_secret_key():
    if os.path.exists(SECRET_KEY_PATH):
        with open(SECRET_KEY_PATH, "r", encoding="utf8") as f:
            return f.read()
    else:
        print(f"api secret key no found! [{SECRET_KEY_PATH}]")
        return ""
