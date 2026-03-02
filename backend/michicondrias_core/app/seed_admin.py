from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash

def seed_admin():
    db = SessionLocal()
    try:
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            print("ERROR: Admin role not found. Run seed_roles first.")
            return

        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Administrador Michicondrias",
                is_active=True,
                role_id=admin_role.id,
                verification_status="VERIFIED"
            )
            db.add(admin_user)
            db.commit()
            print("✅ User admin@example.com created")
        else:
            print("⏩ User admin@example.com already exists")
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
