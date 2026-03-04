import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine, Base
# Import all models to ensure they are registered with Base.metadata
from app.models.lost_pet import LostPetReport
from app.models.petfriendly import PetfriendlyPlace

def main():
    try:
        print("Creating all tables for michicondrias_perdidas...")
        Base.metadata.create_all(bind=engine)
        print("Successfully created tables!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    main()
