import os

SECRET_KEY_PATH = "vk_secret_key.txt"


def get_vk_secret_key():
    if os.path.exists(SECRET_KEY_PATH):
        with open(SECRET_KEY_PATH, "r", encoding="utf8") as f:
            return f.read()
    else:
        print(f"vk secret key no found! [{SECRET_KEY_PATH}]")
        return ""
