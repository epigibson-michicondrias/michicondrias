
import os
from sqlalchemy import create_engine, inspect

DATABASE_URL = os.environ["DATABASE_URL"]

def check_lengths():
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        columns = inspector.get_columns("pets")
        print("--- Column Max Lengths in 'pets' ---")
        for col in columns:
            name = col['name']
            ctype = col['type']
            print(f"{name}: {ctype}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_lengths()
