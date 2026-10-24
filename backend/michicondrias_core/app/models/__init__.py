from app.models.base import BaseModel
from app.models.role import Role
from app.models.user import User
from app.models.global_setting import GlobalSetting
from app.models.push_token import PushToken

# Estos imports permiten que Alembic los detecte 
# al importar app.models en env.py
