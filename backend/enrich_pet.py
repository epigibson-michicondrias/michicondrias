from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
engine = create_engine(DATABASE_URL)

PET_ID = "b76c16ca-d07d-4113-ade2-4c4228bd07d0"

with engine.connect() as conn:
    print(f"Updating pet {PET_ID} with rich data...")
    query = text(f"""
        UPDATE adoption_listings 
        SET 
            gender = 'Macho', 
            location = 'CDMX, Polanco', 
            is_emergency = TRUE, 
            temperament = 'Juguetón, Leal, Inteligente',
            microchip_number = 'MEX-9988776655'
        WHERE id = '{PET_ID}'
    """)
    conn.execute(query)
    conn.commit()
    print("Update successful!")
