import sys
from datetime import timedelta

from bafser import AppConfig, create_app
from dotenv import load_dotenv

from scripts.init_db import init_db
from scripts.init_dev_values import init_dev_values

load_dotenv()

app, run = create_app(__name__, AppConfig(
    CACHE_MAX_AGE=604800,
    PAGE404="404.html",
    JWT_ACCESS_TOKEN_EXPIRES=timedelta(hours=24),
    MESSAGE_TO_FRONTEND="",
    DEV_MODE="dev" in sys.argv,
    DELAY_MODE="delay" in sys.argv,
    IMAGES_FOLDER="storage/images",
)
    .add_secret_key_env("API_SECRET_KEY")
    # .add_secret_key("VK_SECRET_KEY", "secret_key_vk.txt")
)

run(__name__ == "__main__", init_db, init_dev_values)
