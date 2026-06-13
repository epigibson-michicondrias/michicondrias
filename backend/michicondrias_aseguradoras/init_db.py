import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine, Base
from app.models.insurance import PetInsurancePolicy, InsuranceClaim

def main():
    try:
        print("Creating all tables for michicondrias_aseguradoras...")
        Base.metadata.create_all(bind=engine)
        print("Successfully created tables!")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    main()
