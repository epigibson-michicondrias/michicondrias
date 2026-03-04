import os
import sys
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.session import engine
from app.models.lost_pet import LostPetReport

def main():
    try:
        with Session(engine) as db:
            # Wipe older mock reports created by seed
            db.execute(text("DELETE FROM lost_pet_reports WHERE reporter_id = 'mock-user-123'"))
            
            # Create a more localized pet (CDMX - Chapultepec)
            mock_pet = LostPetReport(
                reporter_id="mock-user-123",
                pet_name="Michi Bosque",
                species="gato",
                breed="Bombay",
                color="Negro",
                report_type="lost",
                last_seen_location="Bosque de Chapultepec, CDMX",
                contact_phone="5588776655",
                contact_email="chapultepec@michi.com",
                has_tracker=True,
                tracker_device_id="MX-9021-CDMX",
                current_lat=19.4204,
                current_lng=-99.1818,
                last_tracked_at=datetime.utcnow()
            )
            db.add(mock_pet)
            db.commit()
            print("Successfully inserted localized mock Tracker report for Chapultepec! 🌲📡")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
