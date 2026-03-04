import os
import sys
from sqlalchemy.orm import Session
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine
from app.models.lost_pet import LostPetReport

def main():
    try:
        with Session(engine) as db:
            mock_pet = LostPetReport(
                reporter_id="mock-user-123",
                pet_name="Michi Test",
                species="gato",
                breed="Carey",
                color="Naranja/Negro",
                report_type="lost",
                last_seen_location="Av. Insurgentes Sur 1234",
                contact_phone="5512345678",
                contact_email="test@michi.com",
                has_tracker=True,
                tracker_device_id="MT-8291-XZ",
                current_lat=19.4326,
                current_lng=-99.1332,
                last_tracked_at=datetime.utcnow()
            )
            db.add(mock_pet)
            db.commit()
            print("Successfully inserted a mock Michi-Tracker report! 📡")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
