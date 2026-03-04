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
            
            # Create a more localized pet (Queretaro)
            mock_pet = LostPetReport(
                reporter_id="mock-user-123",
                pet_name="Michi Queretano",
                species="gato",
                breed="Siamés",
                color="Blanco/Marrón",
                report_type="lost",
                last_seen_location="Querétaro",
                contact_phone="4421234567",
                contact_email="queretaro@michi.com",
                has_tracker=True,
                tracker_device_id="QRO-1029-GPS",
                current_lat=20.620342,
                current_lng=-100.450520,
                last_tracked_at=datetime.utcnow()
            )
            db.add(mock_pet)
            db.commit()
            print("Successfully inserted localized mock Tracker report for Queretaro! 📍📡")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
