import os
from dotenv import load_dotenv
load_dotenv()



SECRET_KEY = os.getenv("SECRET_KEY", "gbP95kts-z2j1sGq_wp5aZfxvBPnImS8xcp4Wnn0Jd8")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "ahorros.db"))
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
