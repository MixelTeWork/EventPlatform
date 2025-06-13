import sys
from datetime import timedelta

from bafser import AppConfig, create_app
from scripts.init_values import init_values
from scripts.init_dev_values import init_dev_values


app, run = create_app(__name__, AppConfig(
    CACHE_MAX_AGE=604800,
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24),
    MESSAGE_TO_FRONTEND="",
    DEV_MODE="dev" in sys.argv,
    DELAY_MODE="delay" in sys.argv,
)
    .add_secret_key("API_SECRET_KEY", "secret_key_api.txt")
    .add_secret_key("VK_SECRET_KEY", "secret_key_vk.txt")
)

run(__name__ == "__main__", lambda: (init_values(True), init_dev_values(True)))
