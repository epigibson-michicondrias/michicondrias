import uuid
import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.ecommerce import Category

def seed():
    db = SessionLocal()
    try:
        # Check if categories already exist
        existing = db.query(Category).count()
        if existing > 0:
            print(f"La base de datos ya tiene {existing} categorías. Omitiendo seed.")
            return

        categories = [
            {"name": "Alimentos", "description": "Alimentos y Snacks premium para mascotas"},
            {"name": "Accesorios", "description": "Correas, camas, platos y más"},
            {"name": "Juguetes", "description": "Juguetes interactivos y de peluche"},
            {"name": "Salud", "description": "Higiene, suplementos y cuidado médico"}
        ]

        for cat_data in categories:
            cat = Category(
                id=str(uuid.uuid4()),
                name=cat_data["name"],
                description=cat_data["description"],
                is_active=True
            )
            db.add(cat)
        
        db.commit()
        print("Categorías sembradas exitosamente ✅")
    except Exception as e:
        print(f"Error al sembrar categorías: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
