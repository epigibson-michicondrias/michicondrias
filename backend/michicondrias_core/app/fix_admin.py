from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role

db = SessionLocal()
try:
    admin_user = db.query(User).filter(User.email == 'admin@example.com').first()
    admin_role = db.query(Role).filter(Role.name == 'admin').first()
    
    if admin_user and admin_role:
        admin_user.role_id = admin_role.id
        db.add(admin_user)
        db.commit()
        print(f"SUCCESS: User {admin_user.email} updated with role {admin_role.name}")
    else:
        print(f"ERROR: Admin user ({'FOUND' if admin_user else 'NOT FOUND'}) or Admin role ({'FOUND' if admin_role else 'NOT FOUND'})")
finally:
    db.close()
