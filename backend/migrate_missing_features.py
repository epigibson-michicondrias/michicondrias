from sqlalchemy import create_engine, text

# Supabase Database URL
DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"

engine = create_engine(DATABASE_URL)

ddls = [
    """
    CREATE TABLE IF NOT EXISTS adoption_forms (
        id VARCHAR(36) PRIMARY KEY,
        pet_id VARCHAR(36) NOT NULL,
        applicant_id VARCHAR(36) NOT NULL,
        has_other_pets BOOLEAN DEFAULT FALSE,
        has_yard BOOLEAN DEFAULT FALSE,
        hours_left_alone INTEGER DEFAULT 0,
        experience_level VARCHAR(50),
        compatibility_score INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'submitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS adoption_contracts (
        id VARCHAR(36) PRIMARY KEY,
        form_id VARCHAR(36) NOT NULL REFERENCES adoption_forms(id) ON DELETE CASCADE,
        refuge_id VARCHAR(36) NOT NULL,
        terms TEXT NOT NULL,
        signed_contract_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS consultations (
        id VARCHAR(36) PRIMARY KEY,
        clinic_id VARCHAR(36),
        vet_id VARCHAR(36),
        user_id VARCHAR(36) NOT NULL,
        pet_id VARCHAR(36),
        scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(30) DEFAULT 'scheduled',
        room_url VARCHAR(500),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    """
]

with engine.connect() as conn:
    print("Starting database schema migration...")
    for ddl in ddls:
        try:
            conn.execute(text(ddl))
            print("Successfully created/verified table.")
        except Exception as e:
            print(f"Error executing DDL: {e}")
    conn.commit()
    print("Migration complete!")
