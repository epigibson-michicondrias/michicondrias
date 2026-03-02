from sqlalchemy import create_engine, text

engine = create_engine("postgresql://postgres:postgres@localhost:5432/michicondrias")
conn = engine.connect()
conn.execute(text("ALTER TABLE products ADD COLUMN seller_id VARCHAR(255);"))
conn.commit()
conn.close()
